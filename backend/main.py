from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from PIL import Image
import os
import uuid
import shutil
import re

from remove_background import remove_background_white
from prediction import predict_clothing_label
from make_transparent import remove_background_with_shadow


# ---------------------------------------------------------------------------
# directory setup
# ---------------------------------------------------------------------------
STATIC_DIR = "static"
OUTFITS_DIR = os.path.join(STATIC_DIR, "saved_outfits")  # new
os.makedirs(OUTFITS_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# FastAPI boilerplate
# ---------------------------------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in prod
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
def abs_from_static(url: str) -> str:
    """
    Convert any URL or path that contains `/static/…` (or starts with it)
    into an absolute path on disk under the STATIC_DIR.
    """
    try:
        rel = url.split("/static/", 1)[1]           # after the first /static/
    except IndexError:
        rel = url.lstrip("/")                       # already relative
    return os.path.join(STATIC_DIR, rel)


# ---------------------------------------------------------------------------
# routes
# ---------------------------------------------------------------------------
@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    try:
        # ------------------------------------------
        # 1. Save upload temporarily
        # ------------------------------------------
        contents = await file.read()
        temp_filename = f"{uuid.uuid4().hex}.png"
        temp_path = os.path.join(STATIC_DIR, temp_filename)
        with open(temp_path, "wb") as f:
            f.write(contents)

        # ------------------------------------------
        # 2. Load & process both versions
        # ------------------------------------------
        image = Image.open(temp_path).convert("RGB")

        # Transparent version (PNG with transparency)
        transparent_image = remove_background_with_shadow(image)

        # White background version (flattened)
        processed_image = remove_background_white(image)

        # ------------------------------------------
        # 3. Predict category
        # ------------------------------------------
        category = predict_clothing_label(temp_path).replace(" ", "").lower()

        # Create both output dirs
        category_dir = os.path.join(STATIC_DIR, category)
        transparent_category_dir = os.path.join(STATIC_DIR, "transparent", category)
        os.makedirs(category_dir, exist_ok=True)
        os.makedirs(transparent_category_dir, exist_ok=True)

        # ------------------------------------------
        # 4. Generate unique filenames & save
        # ------------------------------------------
        uuid_part = uuid.uuid4().hex

        # White background version → JPG
        output_filename = f"{uuid_part}_processed.jpg"
        output_path = os.path.join(category_dir, output_filename)
        processed_image.save(output_path, format="JPEG")

        # Transparent version → PNG
        transparent_filename = f"{uuid_part}_transparent.png"
        transparent_output_path = os.path.join(transparent_category_dir, transparent_filename)
        transparent_image.save(transparent_output_path, format="PNG")

        # ------------------------------------------
        # 5. Cleanup temp file
        # ------------------------------------------
        os.remove(temp_path)

        # ------------------------------------------
        # 6. Return both paths
        # ------------------------------------------
        return {
            "image_path": f"/static/{category}/{output_filename}",
            "transparent_image_path": f"/static/transparent/{category}/{transparent_filename}",
            "category": category,
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


import csv

CSV_FILE = os.path.join(STATIC_DIR, "clothing_items.csv")

@app.post("/save-clothing-item")
async def save_clothing_item(request: Request):
    """
    Body JSON:
    {
      "image_url": "/static/shortsleeve/abcd_processed.jpg",
      "category": "shortsleeve",
      "color": "black"
    }
    """
    data = await request.json()
    image_url = data.get("image_url")
    category  = data.get("category")
    color     = data.get("color")

    if not (image_url and category and color):
        return JSONResponse(status_code=400, content={"error": "image_url, category, color required"})

    # Append to CSV
    with open(CSV_FILE, "a", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([image_url, category, color])

    return {"message": "Item saved to CSV", "image_url": image_url}


@app.post("/delete-clothing-item")
async def delete_clothing_item(request: Request):
    """
    Body JSON:
    {
      "image_url": "/static/shortsleeve/abcd_processed.jpg"
    }
    """
    data = await request.json()
    image_url = data.get("image_url")
    if not image_url:
        return JSONResponse(status_code=400, content={"error": "image_url required"})

    # 1. Delete white background file
    full_path = abs_from_static(image_url)
    if os.path.exists(full_path):
        os.remove(full_path)

    # 2. Delete transparent version (guess path)
    if "_processed" in image_url:
        transparent_url = image_url.replace("/static/", "/static/transparent/").replace("_processed.jpg", "_transparent.png")
    else:
    # fallback if suffix missing (rare)
        transparent_url = image_url.replace("/static/", "/static/transparent/").replace(".jpg", ".png")

    transparent_full_path = abs_from_static(transparent_url)
    if os.path.exists(transparent_full_path):
        os.remove(transparent_full_path)

    # 3. Remove row from CSV
    lines = []
    if os.path.exists(CSV_FILE):
        with open(CSV_FILE, "r") as csvfile:
            reader = csv.reader(csvfile)
            lines = [row for row in reader if row[0] != image_url]

        with open(CSV_FILE, "w", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerows(lines)

    return {"message": "Item deleted from storage, transparent, and CSV"}

@app.post("/save-outfit")
async def save_outfit(request: Request):
    """
    Body JSON:
    {
      "outfit_name": "Airport Look",
      "top_image_path": "/static/shortsleeve/abcd.jpg",
      "bottom_image_path": "/static/pants/xyz.jpg"
    }
    """
    data = await request.json()
    outfit_name  = data.get("outfit_name", "").strip()
    top_path_in  = data.get("top_image_path")
    bott_path_in = data.get("bottom_image_path")

    if not (outfit_name and top_path_in and bott_path_in):
        return JSONResponse(
            status_code=400,
            content={"error": "outfit_name, top_image_path and bottom_image_path are required"},
        )

    # sanitise folder name (letters, numbers, space, underscore, dash)
    safe_name = re.sub(r"[^\w\- ]", "", outfit_name) or "untitled"
    outfit_dir = os.path.join(OUTFITS_DIR, safe_name)
    os.makedirs(outfit_dir, exist_ok=True)

    top_src   = abs_from_static(top_path_in)
    bott_src  = abs_from_static(bott_path_in)

    if not (os.path.exists(top_src) and os.path.exists(bott_src)):
        return JSONResponse(status_code=404, content={"error": "One or both image paths were not found on the server"})

    # copy, preserving extensions
    shutil.copyfile(top_src,  os.path.join(outfit_dir, f"top{os.path.splitext(top_src)[1]}"))
    shutil.copyfile(bott_src, os.path.join(outfit_dir, f"bottom{os.path.splitext(bott_src)[1]}"))

    return {"message": "Outfit saved", "folder": f"/static/saved_outfits/{safe_name}"}

@app.get("/get-saved-outfits")
def get_saved_outfits():
    outfits = []
    base_dir = os.path.join(STATIC_DIR, "saved_outfits")
    if os.path.exists(base_dir):
        for folder_name in os.listdir(base_dir):
            folder_path = os.path.join(base_dir, folder_name)
            if os.path.isdir(folder_path):
                top_path = f"/static/saved_outfits/{folder_name}/top.jpg"
                bottom_path = f"/static/saved_outfits/{folder_name}/bottom.jpg"
                outfits.append({
                    "name": folder_name,
                    "top_image": top_path,
                    "bottom_image": bottom_path
                })
    return JSONResponse(content={"outfits": outfits})

@app.post("/delete-saved-outfit")
async def delete_saved_outfit(request: Request):
    data = await request.json()
    outfit_name = data.get("outfit_name")
    if not outfit_name:
        return JSONResponse(status_code=400, content={"error": "outfit_name required"})

    outfit_dir = os.path.join(STATIC_DIR, "saved_outfits", outfit_name)
    if os.path.exists(outfit_dir):
        shutil.rmtree(outfit_dir)

    return {"message": f"Outfit '{outfit_name}' deleted"}
