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
        # save upload temporarily
        contents = await file.read()
        temp_filename = f"{uuid.uuid4().hex}.png"
        temp_path = os.path.join(STATIC_DIR, temp_filename)
        with open(temp_path, "wb") as f:
            f.write(contents)

        # load & process
        image = Image.open(temp_path).convert("RGB")
        processed_image = remove_background_white(image)

        category = predict_clothing_label(temp_path).replace(" ", "").lower()
        category_dir = os.path.join(STATIC_DIR, category)
        os.makedirs(category_dir, exist_ok=True)

        output_filename = f"{uuid.uuid4().hex}_processed.jpg"
        output_path = os.path.join(category_dir, output_filename)

        processed_image.save(output_path)
        os.remove(temp_path)

        return {
            "image_path": f"/static/{category}/{output_filename}",
            "category": category,
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/delete-image")
async def delete_image(request: Request):
    data = await request.json()
    image_path = data.get("image_path")

    if not image_path:
        return JSONResponse(status_code=400, content={"error": "Image path required"})

    try:
        full_path = abs_from_static(image_path)

        if os.path.exists(full_path):
            os.remove(full_path)
            return {"message": "Image deleted"}
        else:
            return JSONResponse(status_code=404, content={"error": f"File not found: {full_path}"})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


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