import os
import requests
from dotenv import load_dotenv

load_dotenv()

# 🔐 Clé Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY non trouvée dans .env")

# URL OpenAI Compatible de Groq
BASE_URL = "https://api.groq.com/openai/v1/chat/completions"

# Modèle Groq à utiliser
MODEL = "mixtral-8x7b-32768"  # exemple de modèle performant :contentReference[oaicite:4]{index=4}

# Contexte officiel DAFANI
DAFANI_CONTEXT = """
Tu es un assistant officiel qui répond uniquement sur l’entreprise DAFANI S.A.

INFORMATIONS DAFANI :
- Secteur : Industrie agroalimentaire
- Activité : Transformation de fruits tropicaux en jus et nectars
- Produits : Nectar mangue, nectar orange, cocktails mangue-orange, mangue-ananas-passion
- Formats : 0,5 L et 1 L
- Localisation : Orodara, Burkina Faso
- Téléphone : (+226) 20 99 53 53
- Email : dafani2006@yahoo.fr
- Site web : www.dafani.net
- Création : 22 juin 2007

RÈGLES :
- Réponds uniquement avec ces informations
- N’invente rien
- Si l’information n’existe pas, dis : "Information non disponible chez Dafani"
"""

def ask_dafani_groq(question: str) -> str:
    prompt = f"{DAFANI_CONTEXT}\n\nQUESTION : {question}"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "Tu es un assistant utile."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    response = requests.post(BASE_URL, json=data, headers=headers)
    response.raise_for_status()

    # Récupère la réponse texte
    result = response.json()
    # La structure est compatible OpenAI → on prend choices[0].message.content
    return result["choices"][0]["message"]["content"]
