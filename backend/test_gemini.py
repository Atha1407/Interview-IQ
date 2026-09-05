from google import genai

from app.core.config import settings


client = genai.Client(
    api_key=settings.gemini_api_key,
)

print("Sending request...")

interaction = client.interactions.create(
    model="gemini-3.6-flash",
    input="Give me 3 programming languages.",
    response_format={
        "type": "text",
        "mime_type": "application/json",
        "schema": {
            "type": "object",
            "properties": {
                "topics": {
                    "type": "array",
                    "items": {
                        "type": "string",
                    },
                },
            },
            "required": ["topics"],
        },
    },
)

print("Response received:")
print(interaction.output_text)