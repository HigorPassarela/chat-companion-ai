import os
import logging
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from werkzeug.utils import secure_filename
import requests
import json
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

# Carregar variáveis de ambiente
load_dotenv()

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
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:8080"],
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# ===== CONFIGURAÇÃO DO SUPABASE =====
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.warning("[WARN] Credenciais do Supabase não encontradas no .env")
    supabase: Client = None
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("[OK] Conectado ao Supabase")
    except Exception as e:
        logger.error(f"[ERROR] Erro ao conectar no Supabase: {e}")
        supabase = None

# ===== CONFIGURAÇÃO DE UPLOAD =====
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'csv', 'json', 'py', 'js', 'html', 'css'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

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
        try:
            with open(filepath, 'r', encoding='latin-1') as f:
                return f.read()
        except Exception as e:
            logger.warning(f"[WARN] Erro ao ler arquivo: {str(e)}")
            return None
    except Exception as e:
        logger.warning(f"[WARN] Erro ao ler arquivo: {str(e)}")
        return None

# ===== ROTAS DE CONVERSAS (SUPABASE) =====

@app.route("/api/conversations", methods=["GET"])
def get_conversations():
    """Lista todas as conversas"""
    try:
        if not supabase:
            logger.error("[ERROR] Supabase não configurado")
            return jsonify({"error": "Supabase não configurado"}), 500
        
        logger.info("[API] Buscando conversas...")
        
        response = supabase.table("conversations").select("*").order("updated_at", desc=True).execute()
        
        conversations = response.data if response.data else []
        
        logger.info(f"[API] Retornando {len(conversations)} conversas")
        return jsonify(conversations)
    
    except Exception as e:
        logger.error(f"[ERROR] Erro ao buscar conversas: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route("/api/conversations", methods=["POST"])
def create_conversation():
    """Cria uma nova conversa"""
    try:
        if not supabase:
            return jsonify({"error": "Supabase não configurado"}), 500
        
        data = request.get_json()
        title = data.get("title", "Nova conversa")
        
        logger.info(f"[API] Criando nova conversa: {title}")
        
        response = supabase.table("conversations").insert({
            "title": title,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).execute()
        
        if response.data:
            conversation = response.data[0]
            logger.info(f"[API] Conversa criada: ID={conversation['id']}")
            return jsonify(conversation), 201
        else:
            logger.error("[ERROR] Falha ao criar conversa")
            return jsonify({"error": "Falha ao criar conversa"}), 500
    
    except Exception as e:
        logger.error(f"[ERROR] Erro ao criar conversa: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route("/api/conversations/<int:conversation_id>", methods=["GET"])
def get_conversation(conversation_id):
    """Busca uma conversa específica"""
    try:
        if not supabase:
            return jsonify({"error": "Supabase não configurado"}), 500
        
        logger.info(f"[API] Buscando conversa ID={conversation_id}")
        
        response = supabase.table("conversations").select("*").eq("id", conversation_id).execute()
        
        if response.data and len(response.data) > 0:
            return jsonify(response.data[0])
        else:
            return jsonify({"error": "Conversa não encontrada"}), 404
    
    except Exception as e:
        logger.error(f"[ERROR] Erro ao buscar conversa: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route("/api/conversations/<int:conversation_id>", methods=["PATCH"])
def update_conversation(conversation_id):
    """Atualiza o título de uma conversa"""
    try:
        if not supabase:
            return jsonify({"error": "Supabase não configurado"}), 500
        
        data = request.get_json()
        title = data.get("title")
        
        if not title:
            return jsonify({"error": "Título é obrigatório"}), 400
        
        logger.info(f"[API] Atualizando conversa ID={conversation_id}: {title}")
        
        response = supabase.table("conversations").update({
            "title": title,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", conversation_id).execute()
        
        if response.data and len(response.data) > 0:
            logger.info(f"[API] Conversa {conversation_id} atualizada")
            return jsonify(response.data[0])
        else:
            return jsonify({"error": "Conversa não encontrada"}), 404
    
    except Exception as e:
        logger.error(f"[ERROR] Erro ao atualizar conversa: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route("/api/conversations/<int:conversation_id>", methods=["DELETE"])
def delete_conversation(conversation_id):
    """Deleta uma conversa"""
    try:
        if not supabase:
            return jsonify({"error": "Supabase não configurado"}), 500
        
        logger.info(f"[API] Deletando conversa ID={conversation_id}")
        
        # Deletar mensagens da conversa primeiro (se houver)
        try:
            supabase.table("messages").delete().eq("conversation_id", conversation_id).execute()
        except:
            pass
        
        response = supabase.table("conversations").delete().eq("id", conversation_id).execute()
        
        logger.info(f"[API] Conversa {conversation_id} deletada")
        return jsonify({"message": "Conversa deletada com sucesso"}), 200
    
    except Exception as e:
        logger.error(f"[ERROR] Erro ao deletar conversa: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# ===== ROTAS EXISTENTES =====

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
        
        if 'file' not in request.files:
            logger.warning("[WARN] Nenhum arquivo enviado")
            return jsonify({"erro": "Nenhum arquivo enviado"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            logger.warning("[WARN] Nome de arquivo vazio")
            return jsonify({"erro": "Nome de arquivo vazio"}), 400
        
        if not allowed_file(file.filename):
            logger.warning(f"[WARN] Tipo de arquivo nao permitido: {file.filename}")
            return jsonify({
                "erro": f"Tipo de arquivo nao permitido. Extensoes aceitas: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        file_size = os.path.getsize(filepath)
        logger.info(f"[OK] Arquivo salvo: {filepath} ({file_size} bytes)")
        
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
            "content": file_content[:3000] if file_content else None,
            "extension": extension
        })
    
    except Exception as e:
        logger.error(f"[ERROR] Erro no upload: {str(e)}", exc_info=True)
        return jsonify({"erro": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    """Rota de chat sem arquivo anexado"""
    try:
        if request.is_json:
            data = request.json
            logger.info(f"[OK] Requisicao JSON recebida")
        elif request.form:
            data = request.form.to_dict()
            logger.info(f"[OK] Requisicao FormData recebida")
        else:
            return jsonify({"erro": "Formato não suportado"}), 415
        
        pergunta = data.get("pergunta")
        logger.info(f"[IN] Pergunta recebida: {pergunta}")
        
        if not pergunta:
            return jsonify({"erro": "Pergunta nao pode estar vazia"}), 400
        
        prompt = f"""Voce e um assistente que sempre responde em portugues brasileiro de forma clara e educada.

Pergunta: {pergunta}

Resposta:"""
        
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
        logger.error(f"[ERROR] Erro: {str(e)}", exc_info=True)
        return jsonify({"erro": str(e)}), 500

@app.route("/chat-with-file", methods=["POST"])
def chat_with_file():
    """Rota de chat com arquivo anexado"""
    try:
        if request.is_json:
            data = request.json
        elif request.form:
            data = request.form.to_dict()
        else:
            return jsonify({"erro": "Formato não suportado"}), 415
        
        pergunta = data.get("pergunta")
        file_content = data.get("file_content", "")
        
        logger.info(f"[IN] Pergunta com arquivo recebida: {pergunta}")
        
        if not pergunta:
            return jsonify({"erro": "Pergunta nao pode estar vazia"}), 400
        
        if file_content:
            prompt = f"""Voce e um assistente que sempre responde em portugues brasileiro.

Aqui esta o conteudo de um arquivo:

---INICIO DO ARQUIVO---
{file_content[:3000]}
---FIM DO ARQUIVO---

Pergunta: {pergunta}

Resposta:"""
        else:
            prompt = f"Responda em portugues: {pergunta}"
        
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
        logger.error(f"[ERROR] Erro: {str(e)}", exc_info=True)
        return jsonify({"erro": str(e)}), 500

def chat_stream(prompt):
    """Gera stream de tokens do Ollama"""
    try:
        logger.debug(f"[CALL] Enviando para Ollama...")
        
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
        
        resposta_completa = ""
        token_count = 0
        
        for line in response.iter_lines():
            if line:
                try:
                    chunk = json.loads(line)
                    
                    if "response" in chunk and chunk["response"]:
                        token = chunk["response"]
                        resposta_completa += token
                        token_count += 1
                        yield f"data: {json.dumps({'token': token})}\n\n"
                    
                    if chunk.get("done", False):
                        logger.info(f"[OUT] Resposta completa ({token_count} tokens)")
                        yield f"data: {json.dumps({'done': True})}\n\n"
                        break
                        
                except json.JSONDecodeError:
                    continue
    
    except Exception as e:
        logger.error(f"[ERROR] Erro: {str(e)}", exc_info=True)
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@app.route("/files", methods=["GET"])
def list_files():
    """Lista arquivos enviados"""
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
        logger.error(f"[ERROR] Erro: {str(e)}", exc_info=True)
        return jsonify({"erro": str(e)}), 500

@app.route("/test-ollama", methods=["GET"])
def test_ollama():
    """Testa conexão com Ollama"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            return jsonify({
                "status": "online",
                "models": [m.get("name") for m in models]
            })
        else:
            return jsonify({"status": "error"}), 500
    except:
        return jsonify({"status": "offline"}), 503

# ===== INICIAR SERVIDOR =====
if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("[START] Iniciando servidor Flask")
    logger.info(f"[CONFIG] Porta: 5000")
    logger.info(f"[CONFIG] Modelo: codellama:7b")
    logger.info(f"[CONFIG] Supabase: {'Configurado' if supabase else 'Não configurado'}")
    logger.info("=" * 60)
    
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=3)
        if response.status_code == 200:
            models = response.json().get("models", [])
            logger.info(f"[OLLAMA] ✓ Conectado! {len(models)} modelo(s)")
    except:
        logger.warning("[OLLAMA] ⚠ Não conectado")
    
    logger.info("=" * 60)
    
    app.run(debug=True, port=5000, threaded=True)