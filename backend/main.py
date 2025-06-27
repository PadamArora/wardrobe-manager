from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image
import os
import uuid

from remove_background import remove_background_white
from prediction import predict_clothing_label

# Create static folder if it doesn't exist
STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)

app = FastAPI()

# Allow frontend access (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (processed images)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        contents = await file.read()
        temp_filename = f"{uuid.uuid4().hex}.png"
        temp_path = os.path.join(STATIC_DIR, temp_filename)
        with open(temp_path, "wb") as f:
            f.write(contents)

        # Load image
        image = Image.open(temp_path).convert("RGB")

        # 1. Remove background
        processed_image = remove_background_white(image)

        category = predict_clothing_label(temp_path).replace(" ", "").lower()

        # Create a subfolder based on predicted category
        category_dir = os.path.join(STATIC_DIR, category)
        os.makedirs(category_dir, exist_ok=True)

        output_filename = f"{uuid.uuid4().hex}_processed.jpg"
        output_path = os.path.join(category_dir, output_filename)

        processed_image.save(output_path)
        os.remove(temp_path)
        
        return JSONResponse({
        "image_path": f"/static/{category}/{output_filename}",
        "category": category
        })


    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )