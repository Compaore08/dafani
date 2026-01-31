from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import uvicorn

from llm_service import ask_dafani_groq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        answer = await run_in_threadpool(ask_dafani_groq, req.message)
        return {
            "response": answer,
            "conversation_id": req.conversation_id or str(uuid.uuid4())
        }
    except Exception as e:
        print("❌ ERREUR BACKEND :", e)
        raise HTTPException(status_code=500, detail=str(e))

# Point d'entrée pour Render
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Render fournit le port via une variable d'environnement
    uvicorn.run(app, host="0.0.0.0", port=port)
