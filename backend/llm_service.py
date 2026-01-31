import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("❌ GROQ_API_KEY manquante dans le .env")

BASE_URL = "https://api.groq.com/openai/v1/chat/completions"

# ✅ Modèle OFFICIEL recommandé par Groq
MODEL = "llama-3.1-8b-instant"

DAFANI_CONTEXT = """
Tu es un assistant officiel de l’entreprise DAFANI S.A.

INFORMATIONS DAFANI :
- Secteur : Industrie agroalimentaire
- Activité : Transformation de fruits tropicaux
- Produits : Nectar mangue, nectar orange, cocktails
- Formats : 0,5 L et 1 L
- Localisation : Orodara, Burkina Faso
- Téléphone : (+226) 20 99 53 53
- Email : dafani2006@yahoo.fr
- Site web : www.dafani.net
- Création : 22 juin 2007

RÈGLES :
- Réponds uniquement avec ces informations
- N’invente rien
- Sinon répond : "Information non disponible chez Dafani"
"""

def ask_dafani_groq(question: str) -> str:
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": DAFANI_CONTEXT},
            {"role": "user", "content": question}
        ],
        "temperature": 0.4,
        "max_tokens": 512
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(BASE_URL, json=payload, headers=headers)

    # 🔴 Important pour voir l’erreur Groq si elle revient
    if response.status_code != 200:
        raise RuntimeError(response.text)

    return response.json()["choices"][0]["message"]["content"]
