from fastapi import FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid

# 👉 Import Groq
from backend.llm_service import ask_dafani_groq

app = FastAPI(title="DAFANI Support AI API")

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# SCHEMAS
# =========================
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

# =========================
# ROUTES
# =========================
@app.get("/")
async def root():
    return {"message": "API Customer Support AI - DAFANI (Groq)"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Le champ 'message' est requis")

    conversation_id = request.conversation_id or str(uuid.uuid4())

    try:
        # 🔥 Appel Groq
        response_text = await run_in_threadpool(
            ask_dafani_groq,
            request.message
        )

        return ChatResponse(
            response=response_text,
            conversation_id=conversation_id
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur serveur : {str(e)}"
        )
