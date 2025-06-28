from PIL import Image
from rembg import remove

def remove_background(pil_img, save_path=None):
    """
    Remove background from a PIL image and return image with transparent background.

    Args:
        pil_img (PIL.Image.Image): Input image.
        save_path (str, optional): Path to save the final image (as PNG).

    Returns:
        PIL.Image.Image: Image with background removed (transparent).
    """
    # Ensure input image is in RGBA mode
    input_image = pil_img.convert("RGBA")

    # Remove background
    output_image = remove(input_image)

    # Optionally save the output
    if save_path:
        output_image.save(save_path)

    return output_image