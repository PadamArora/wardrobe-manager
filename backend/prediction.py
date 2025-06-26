from transformers import AutoModelForImageClassification, AutoImageProcessor
from PIL import Image
import torch

# Load model and processor once (globally)
repo_name = "samokosik/finetuned-clothes"
image_processor = AutoImageProcessor.from_pretrained(repo_name)
model = AutoModelForImageClassification.from_pretrained(repo_name)

def predict_clothing_label(image):
    """
    Predicts the clothing label for a given image using samokosik/finetuned-clothes model.

    Args:
        image (str or PIL.Image.Image): Path to image file or PIL image.

    Returns:
        str: Predicted clothing label.
    """
    # Load image if path is provided
    if isinstance(image, str):
        image = Image.open(image).convert("RGB")
    elif not isinstance(image, Image.Image):
        raise ValueError("Input must be a file path or PIL.Image.Image")

    # Preprocess
    inputs = image_processor(images=image, return_tensors="pt")

    # Predict
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        prediction = torch.argmax(logits, dim=1).item()

    return model.config.id2label[prediction]

