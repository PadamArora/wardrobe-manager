from PIL import Image, ImageFilter
from rembg import remove

def remove_background_with_shadow(
    pil_img,
    save_path=None,
    add_shadow=True,
    blur_radius=10,
    shadow_offset=(10, 10)
):
    """
    Remove background, add soft shadow (optional), keep transparent background.

    Args:
        pil_img (PIL.Image.Image): Input image.
        save_path (str, optional): Path to save the final image as PNG.
        add_shadow (bool): Whether to add a soft shadow.
        blur_radius (int): Shadow blur radius.
        shadow_offset (tuple): Offset of the shadow.

    Returns:
        PIL.Image.Image: Final image with transparent background.
    """
    # Remove background: keep transparency
    cutout = remove(pil_img.convert("RGBA"))

    if add_shadow:
        # Create blurred alpha mask as shadow
        alpha = cutout.split()[3]
        shadow = alpha.point(lambda p: 80 if p > 0 else 0)
        shadow = shadow.filter(ImageFilter.GaussianBlur(blur_radius))
        shadow = Image.merge("RGBA", [shadow] * 3 + [shadow])

        # Transparent canvas for shadow + cutout
        canvas = Image.new("RGBA", cutout.size, (0, 0, 0, 0))
        canvas.paste(shadow, shadow_offset, shadow)
        canvas.paste(cutout, (0, 0), cutout)
        cutout = canvas

    if save_path:
        cutout.save(save_path)

    return cutout
