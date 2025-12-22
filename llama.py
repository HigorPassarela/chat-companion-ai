import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("chat.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


app = Flask(__name__)
CORS(app)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

logger.info("[OK] Usando codellama:7b via Ollama")

@app.route("/ping", methods=["GET"])
def ping():
    logger.info("[PING] Requisição de teste recebida")
    return jsonify({"status": "ok", "message": "Backend está funcionando!"})

@app.route("/chat", methods=["POST"])
def chat():
    try:
        # Primeiro tenta detectar se é JSON ou multipart
        pergunta = None
        imagem_path = None

        if request.content_type.startswith("application/json"):
            logger.info("[REQ] Recebido JSON")
            data = request.json
            pergunta = data.get("pergunta")

        elif request.content_type.startswith("multipart/form-data"):
            logger.info("[REQ] Recebido Multipart/Form-Data")
            pergunta = request.form.get("pergunta")

            # se houver imagem anexada
            if "imagem" in request.files:
                imagem = request.files["imagem"]
                if imagem.filename:
                    imagem_path = os.path.join(UPLOAD_DIR, imagem.filename)
                    imagem.save(imagem_path)
                    logger.info(f"[IMG] Imagem recebida: {imagem_path}")

        logger.info(f"[IN] Pergunta recebida: {pergunta}")

        if not pergunta:
            logger.warning("[WARN] Pergunta vazia recebida")
            return jsonify({"erro": "Pergunta não pode estar vazia"}), 400

        resposta = chat_pergunta(pergunta)

        logger.info(f"[OUT] Resposta enviada: {resposta[:200]}...")

        return jsonify({
            "resposta": resposta,
            "imagem_recebida": bool(imagem_path)
        })

    except Exception as e:
        logger.error(f"[ERROR] Erro ao processar requisição: {e}", exc_info=True)
        return jsonify({"erro": str(e)}), 500

def chat_pergunta(pergunta):
    try:
        logger.debug(f"[CALL] Enviando para codellama:7b: {pergunta[:120]}...")

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "codellama:7b",
                "prompt": pergunta,
                "stream": False,
                "options": {
                    "num_predict": 5000,
                    "temperature": 0.7,
                    "system": "Responda sempre em português brasileiro.",
                    "top_p": 0.9,
                },
            },
            timeout=500,
        )

        if response.status_code != 200:
            raise Exception(f"Erro do Ollama: {response.text}")

        resposta_bruta = response.json()["response"]
        return resposta_bruta

    except Exception as e:
        logger.error(f"[ERROR] Erro em chat_pergunta: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    logger.info("[START] Iniciando servidor Flask na porta 5000...")
    app.run(debug=True, port=5000)