from PIL import Image, ImageFilter
from rembg import remove

def remove_background_white(pil_img, save_path=None, add_shadow=True, blur_radius=10, shadow_offset=(10, 10)):
    """
    Remove background from a PIL image, add soft shadow (optional), and return image on white background.

    Args:
        pil_img (PIL.Image.Image): Input image.
        save_path (str, optional): Path to save the final image.
        add_shadow (bool): Whether to add a soft shadow. Defaults to True.
        blur_radius (int): Shadow blur radius. Defaults to 10.
        shadow_offset (tuple): Offset of the shadow. Defaults to (10, 10).

    Returns:
        PIL.Image.Image: Final image with white background.
    """
    # Remove background
    cutout = remove(pil_img.convert("RGBA"))

    if add_shadow:
        # Create blurred alpha mask as shadow
        alpha = cutout.split()[3]
        shadow = alpha.point(lambda p: 80 if p > 0 else 0)
        shadow = shadow.filter(ImageFilter.GaussianBlur(blur_radius))
        shadow = Image.merge("RGBA", [shadow] * 3 + [shadow])

        # Transparent canvas with shadow + cutout
        canvas = Image.new("RGBA", cutout.size, (0, 0, 0, 0))
        canvas.paste(shadow, shadow_offset, shadow)
        canvas.paste(cutout, (0, 0), cutout)
        cutout = canvas

    # Composite over white background
    white_bg = Image.new("RGB", cutout.size, (255, 255, 255))
    white_bg.paste(cutout, mask=cutout.split()[3])  # Use alpha as mask

    if save_path:
        white_bg.save(save_path)

    return white_bg