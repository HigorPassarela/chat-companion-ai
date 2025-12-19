import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

# Configurar logs
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("chat.log"),  # salva em arquivo
        logging.StreamHandler()            # mostra no terminal
    ]
)
logger = logging.getLogger(__name__)

# Criar app Flask
app = Flask(__name__)
CORS(app)  # Permitir requisições do frontend

logger.info("[OK] Usando codellama:7b via Ollama")

@app.route("/ping", methods=["GET"])
def ping():
    logger.info("[PING] Requisição de teste recebida")
    return jsonify({"status": "ok", "message": "Backend está funcionando!"})

@app.route("/chat", methods=["POST"])
def chat():
    try:
        # Log da requisição bruta
        logger.info(f"[OK] Requisição recebida: {request.json}")
        
        data = request.json
        pergunta = data.get("pergunta")
        
        logger.info(f"[IN] Pergunta recebida: {pergunta}")
        
        if not pergunta:
            logger.warning("[WARN] Pergunta vazia recebida")
            return jsonify({"erro": "Pergunta não pode estar vazia"}), 400
        
        # Processar pergunta
        resposta = chat_pergunta(pergunta)

        logger.info(f"[OUT] Resposta enviada: {resposta}")

        return jsonify({"resposta": resposta})
    
    except Exception as e:
        # Log detalhado do erro
        logger.error(f"[ERROR] Erro ao processar requisição: {str(e)}", exc_info=True)
        return jsonify({"erro": str(e)}), 500

def chat_pergunta(pergunta):
    try:
        logger.debug(f"[CALL] Enviando para codellama:7b: {pergunta}")

        # Chama API local do Ollama
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
            "model": "codellama:7b",
                "prompt": pergunta,
                "stream" : False,
                "options": {
                    "num_predict": 5000,
                    "temperature": 0.7,
                    "system": "Você sempre responde em português brasileiro",
                    "top_p": 0.9
                }
        },
            timeout = 500
        )

        if response.status_code != 200:
            raise Exception(f"Erro do Ollama: {response.text}")

        resposta_bruta = response.json()["response"]
        logger.debug(f"[LLM] Resposta do codellama:7b: {resposta_bruta}")

        return resposta_bruta

    except Exception as e:
        logger.error(f"[ERROR] Erro em chat_pergunta: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    logger.info("[START] Iniciando servidor Flask na porta 5000...")
    app.run(debug=True, port=5000)