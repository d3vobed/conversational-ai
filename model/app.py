from fastapi import FastAPI
from pydantic import BaseModel
from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch
import uvicorn

app = FastAPI()

tokenizer = T5Tokenizer.from_pretrained("obx0x3/empathy-dementia")
model = T5ForConditionalGeneration.from_pretrained("obx0x3/empathy-dementia")

class PromptRequest(BaseModel):
    message: str
    lang: str = None  # Optional

def detect_language(text: str):
    # crude lang check
    return "fr" if any(word in text.lower() for word in ["je", "tu", "c’est", "j’ai", "où"]) else "en"

@app.post("/generate")
async def generate_response(payload: PromptRequest):
    lang = payload.lang or detect_language(payload.message)
    prefix = "émotion: " if lang == "fr" else "emotion: "
    input_text = prefix + payload.message

    inputs = tokenizer.encode(input_text, return_tensors="pt")
    with torch.no_grad():
        outputs = model.generate(inputs, max_length=50)

    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"reply": result, "language": lang}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
