import asyncio
import os
import base64
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage

STYLE = (
    "Luxury editorial product photography on a pure black background, dramatic warm gold rim lighting, "
    "soft spotlight from above, subtle reflective dark stone surface, cinematic moody atmosphere, "
    "absolutely no text, no labels, no logos, no branding anywhere on the bottle, unbranded generic bottle, "
    "vertical 4:5 composition"
)

SHOTS = {
    "oud-royale": "A small ornate attar bottle of deep amber glass with an antique gold cap, filled with dark resinous oud oil, a few dark oud wood chips and a faint wisp of smoke at the base. " + STYLE,
    "musk-al-ameer": "A small elegant attar bottle of frosted white glass with a polished gold cap, glowing softly like moonlight, a white rose petal beside the base. " + STYLE,
    "midnight-bloom": "A tall rectangular EDP perfume bottle of near-black violet glass with a slim black cap, dark jasmine blossoms and a black orchid petal at the base. " + STYLE,
    "ocean-breeze": "A tall cylindrical EDP perfume bottle of clear sea-blue tinted glass with a brushed silver cap, a fine cool mist and a small piece of pale driftwood at the base. " + STYLE,
}

OUT_DIR = "/app/frontend/public/products"
os.makedirs(OUT_DIR, exist_ok=True)


async def gen(name, prompt):
    chat = LlmChat(
        api_key=os.environ["EMERGENT_LLM_KEY"],
        session_id=f"img-{name}",
        system_message="You generate product photos.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
    text, images = await chat.send_message_multimodal_response(UserMessage(text=prompt))
    if images:
        data = base64.b64decode(images[0]["data"])
        path = os.path.join(OUT_DIR, f"{name}.png")
        with open(path, "wb") as f:
            f.write(data)
        print(f"OK {name}: {len(data)} bytes")
    else:
        print(f"FAIL {name}: no image, text={text[:100] if text else ''}")


async def main():
    for name, prompt in SHOTS.items():
        await gen(name, prompt)


asyncio.run(main())
