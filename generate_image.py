from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

prompt = (
    "Create a banner image for an application called 'Shill Or No Shill'. The image should be modern, engaging, and reflect themes of decision-making, finance, and social media influence. Incorporate elements like a stylized 'S' and 'N' for Shill and No Shill, perhaps with a subtle balance or scale motif. The color palette should be vibrant and professional."
)

response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents=[prompt],
)

for part in response.candidates[0].content.parts:
    if part.text is not None:
        print(part.text)
    elif part.inline_data is not None:
        image = Image.open(BytesIO(part.inline_data.data))
        image.save("assets/images/branding/shill-or-no-shill-banner.png")