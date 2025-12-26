import os
import logging
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from werkzeug.utils import secure_filename
import requests
import json

# ===== CONFIGURAÇÃO DE LOGS =====
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("chat.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ===== CONFIGURAÇÃO DO FLASK =====
app = Flask(__name__)
CORS(app)

# ===== CONFIGURAÇÃO DE UPLOAD =====
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'csv', 'json', 'py', 'js', 'html', 'css'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

# Criar pasta de uploads se não existir
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    logger.info(f"[OK] Pasta de uploads criada: {UPLOAD_FOLDER}")

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

logger.info("[OK] Usando codellama:7b via Ollama")

# ===== FUNÇÕES AUXILIARES =====
def allowed_file(filename):
    """Verifica se a extensão do arquivo é permitida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ler_arquivo(filepath):
    """Lê o conteúdo de um arquivo de texto"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        # Tentar com outra codificação
        try:
            with open(filepath, 'r', encoding='latin-1') as f:
                return f.read()
        except Exception as e:
            logger.warning(f"[WARN] Erro ao ler arquivo: {str(e)}")
            return None
    except Exception as e:
        logger.warning(f"[WARN] Erro ao ler arquivo: {str(e)}")
        return None

# ===== ROTAS DA API =====

@app.route("/ping", methods=["GET"])
def ping():
    """Rota de teste de conexão"""
    logger.info("[PING] Requisicao de teste recebida")
    return jsonify({
        "status": "ok",
        "message": "Backend esta funcionando!",
        "model": "codellama:7b"
    })

@app.route("/upload", methods=["POST"])
def upload_file():
    """Rota para upload de arquivos"""
    try:
        logger.info("[UPLOAD] Requisicao de upload recebida")
        
        # Verificar se há arquivo na requisição
        if 'file' not in request.files:
            logger.warning("[WARN] Nenhum arquivo enviado")
            return jsonify({"erro": "Nenhum arquivo enviado"}), 400
        
        file = request.files['file']
        
        # Verificar se o nome do arquivo não está vazio
        if file.filename == '':
            logger.warning("[WARN] Nome de arquivo vazio")
            return jsonify({"erro": "Nome de arquivo vazio"}), 400
        
        # Verificar extensão permitida
        if not allowed_file(file.filename):
            logger.warning(f"[WARN] Tipo de arquivo nao permitido: {file.filename}")
            return jsonify({
                "erro": f"Tipo de arquivo nao permitido. Extensoes aceitas: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        
        # Salvar arquivo com nome seguro
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        file_size = os.path.getsize(filepath)
        logger.info(f"[OK] Arquivo salvo: {filepath} ({file_size} bytes)")
        
        # Tentar ler conteúdo (se for arquivo de texto)
        file_content = None
        extension = filename.rsplit('.', 1)[1].lower()
        
        if extension in {'txt', 'csv', 'json', 'py', 'js', 'html', 'css'}:
            file_content = ler_arquivo(filepath)
            if file_content:
                logger.info(f"[OK] Conteudo lido: {len(file_content)} caracteres")
        
        return jsonify({
            "sucesso": True,
            "filename": filename,
            "filepath": filepath,
            "size": file_size,
            "content": file_content[:3000] if file_content else None,  # limitar a 3000 chars
            "extension": extension
        })
    
    except Exception as e:
        logger.error(f"[ERROR] Erro no upload: {str(e)}", exc_info=True)
        return jsonify({"erro": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    """Rota de chat sem arquivo anexado - Aceita JSON e FormData"""
    try:
        # Aceitar tanto JSON quanto FormData
        if request.is_json:
            data = request.json
            logger.info(f"[OK] Requisicao JSON recebida: {data}")
        elif request.form:
            data = request.form.to_dict()
            logger.info(f"[OK] Requisicao FormData recebida: {data}")
        else:
            logger.warning(f"[WARN] Formato nao suportado: {request.content_type}")
            return jsonify({
                "erro": "Envie dados em JSON ou FormData",
                "content_type": request.content_type,
                "exemplo_json": {"pergunta": "sua pergunta aqui"},
                "dica": "Adicione header 'Content-Type: application/json' ou use FormData"
            }), 415
        
        pergunta = data.get("pergunta")
        
        logger.info(f"[IN] Pergunta recebida: {pergunta}")
        
        if not pergunta:
            logger.warning("[WARN] Pergunta vazia recebida")
            return jsonify({"erro": "Pergunta nao pode estar vazia"}), 400
        
        # Criar prompt simples
        prompt = f"""Voce e um assistente que sempre responde em portugues brasileiro de forma clara e educada.

Pergunta: {pergunta}

Resposta:"""
        
        # Retornar streaming
        return Response(
            stream_with_context(chat_stream(prompt)),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
                'Connection': 'keep-alive'
            }
        )
    
    except Exception as e:
        logger.error(f"[ERROR] Erro ao processar requisicao: {str(e)}", exc_info=True)
        return jsonify({"erro": str(e)}), 500

@app.route("/chat-with-file", methods=["POST"])
def chat_with_file():
    """Rota de chat com arquivo anexado"""
    try:
        # Aceitar tanto JSON quanto FormData
        if request.is_json:
            data = request.json
            logger.info(f"[OK] Requisicao JSON com arquivo recebida")
        elif request.form:
            data = request.form.to_dict()
            logger.info(f"[OK] Requisicao FormData com arquivo recebida")
        else:
            logger.warning(f"[WARN] Formato nao suportado: {request.content_type}")
            return jsonify({
                "erro": "Envie dados em JSON ou FormData",
                "content_type": request.content_type
            }), 415
        
        pergunta = data.get("pergunta")
        file_content = data.get("file_content", "")
        
        logger.info(f"[IN] Pergunta com arquivo recebida: {pergunta}")
        logger.info(f"[FILE] Tamanho do conteudo: {len(file_content)} caracteres")
        
        if not pergunta:
            logger.warning("[WARN] Pergunta vazia recebida")
            return jsonify({"erro": "Pergunta nao pode estar vazia"}), 400
        
        # Criar prompt com contexto do arquivo
        if file_content:
            prompt = f"""Voce e um assistente que sempre responde em portugues brasileiro.

Aqui esta o conteudo de um arquivo que o usuario anexou:

---INICIO DO ARQUIVO---
{file_content[:3000]}
---FIM DO ARQUIVO---

Agora, baseado nesse conteudo, responda a seguinte pergunta:

Pergunta: {pergunta}

Resposta:"""
        else:
            prompt = f"Responda em portugues: {pergunta}"
        
        # Retornar streaming
        return Response(
            stream_with_context(chat_stream(prompt)),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
                'Connection': 'keep-alive'
            }
        )
    
    except Exception as e:
        logger.error(f"[ERROR] Erro ao processar requisicao com arquivo: {str(e)}", exc_info=True)
        return jsonify({"erro": str(e)}), 500

# ===== FUNÇÃO DE STREAMING =====
def chat_stream(prompt):
    """Gera stream de tokens do Ollama"""
    try:
        logger.debug(f"[CALL] Enviando para Ollama: {prompt[:100]}...")
        
        # Chamar API do Ollama com streaming
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "codellama:7b",
                "prompt": prompt,
                "stream": True,
                "options": {
                    "num_predict": 1000,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "top_k": 40,
                    "repeat_penalty": 1.1
                }
            },
            stream=True,
            timeout=600
        )
        
        if response.status_code != 200:
            error_msg = f"Erro do Ollama: {response.text}"
            logger.error(f"[ERROR] {error_msg}")
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
            return
        
        # Enviar cada token para o frontend
        resposta_completa = ""
        token_count = 0
        
        for line in response.iter_lines():
            if line:
                try:
                    chunk = json.loads(line)
                    
                    # Enviar token individual
                    if "response" in chunk and chunk["response"]:
                        token = chunk["response"]
                        resposta_completa += token
                        token_count += 1
                        yield f"data: {json.dumps({'token': token})}\n\n"
                    
                    # Sinalizar fim da resposta
                    if chunk.get("done", False):
                        logger.info(f"[OUT] Resposta completa enviada ({token_count} tokens, {len(resposta_completa)} caracteres)")
                        logger.debug(f"[OUT] Preview: {resposta_completa[:200]}...")
                        yield f"data: {json.dumps({'done': True})}\n\n"
                        break
                        
                except json.JSONDecodeError as e:
                    logger.warning(f"[WARN] Erro ao decodificar JSON: {e}")
                    continue
    
    except requests.exceptions.Timeout:
        error_msg = "Tempo limite excedido ao processar resposta"
        logger.error(f"[ERROR] {error_msg}")
        yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    except requests.exceptions.ConnectionError:
        error_msg = "Nao foi possivel conectar ao Ollama. Certifique-se de que esta rodando (ollama serve)"
        logger.error(f"[ERROR] {error_msg}")
        yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    except Exception as e:
        error_msg = str(e)
        logger.error(f"[ERROR] Erro em chat_stream: {error_msg}", exc_info=True)
        yield f"data: {json.dumps({'error': error_msg})}\n\n"

# ===== ROTA DE LISTAGEM DE ARQUIVOS (OPCIONAL) =====
@app.route("/files", methods=["GET"])
def list_files():
    """Lista todos os arquivos enviados"""
    try:
        files = []
        for filename in os.listdir(UPLOAD_FOLDER):
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(filepath):
                files.append({
                    "name": filename,
                    "size": os.path.getsize(filepath),
                    "modified": os.path.getmtime(filepath)
                })
        
        logger.info(f"[FILES] {len(files)} arquivos encontrados")
        return jsonify({"files": files})
    
    except Exception as e:
        logger.error(f"[ERROR] Erro ao listar arquivos: {str(e)}", exc_info=True)
        return jsonify({"erro": str(e)}), 500

# ===== ROTA DE TESTE DE CONECTIVIDADE COM OLLAMA =====
@app.route("/test-ollama", methods=["GET"])
def test_ollama():
    """Testa conexão com Ollama"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            logger.info(f"[OLLAMA] Conectado! Modelos disponiveis: {len(models)}")
            return jsonify({
                "status": "online",
                "models": [m.get("name") for m in models]
            })
        else:
            return jsonify({
                "status": "error",
                "message": f"Ollama retornou status {response.status_code}"
            }), 500
    except requests.exceptions.ConnectionError:
        logger.error("[OLLAMA] Nao foi possivel conectar")
        return jsonify({
            "status": "offline",
            "message": "Ollama nao esta rodando. Execute: ollama serve"
        }), 503
    except Exception as e:
        logger.error(f"[ERROR] Erro ao testar Ollama: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# ===== INICIAR SERVIDOR =====
if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("[START] Iniciando servidor Flask")
    logger.info(f"[CONFIG] Porta: 5000")
    logger.info(f"[CONFIG] Modelo: codellama:7b")
    logger.info(f"[CONFIG] Pasta de uploads: {UPLOAD_FOLDER}")
    logger.info(f"[CONFIG] Tamanho maximo: {MAX_FILE_SIZE / (1024*1024):.0f}MB")
    logger.info(f"[CONFIG] Extensoes permitidas: {', '.join(ALLOWED_EXTENSIONS)}")
    logger.info("=" * 60)
    
    # Testar conexão com Ollama ao iniciar
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=3)
        if response.status_code == 200:
            models = response.json().get("models", [])
            logger.info(f"[OLLAMA] ✓ Conectado! {len(models)} modelo(s) disponivel(is)")
        else:
            logger.warning("[OLLAMA] ⚠ Ollama respondeu mas com erro")
    except:
        logger.warning("[OLLAMA] ⚠ Nao foi possivel conectar. Certifique-se de executar 'ollama serve'")
    
    logger.info("=" * 60)
    
    app.run(debug=True, port=5000, threaded=True)