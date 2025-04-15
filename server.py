from quart import Quart, request, jsonify
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer
from functools import wraps
from quart_cors import cors

MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'
API_KEY = "123456789012345"  # Replace this with your own secure key

# Load model and tokenizer
model = SentenceTransformer(MODEL_NAME)
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

# Initialize app with CORS enabled
app = cors(Quart(__name__), allow_origin="*")  # You can restrict origin to just your frontend domain

# Auth decorator
def require_api_key(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        key = request.headers.get('x-api-key')
        if key != API_KEY:
            return jsonify({"error": "Unauthorized"}), 401
        return await func(*args, **kwargs)
    return wrapper

@app.route('/health', methods=['GET'])
async def health():
    return jsonify({"status": "ok"})

@app.route('/info', methods=['GET'])
@require_api_key
async def info():
    return jsonify({
        "model": MODEL_NAME,
        "embedding_dimension": model.get_sentence_embedding_dimension(),
        "max_tokens_per_chunk": tokenizer.model_max_length,
        "description": "Embeds text input using Sentence Transformers."
    })

@app.route('/embed', methods=['POST'])
@require_api_key
async def embed():
    data = await request.get_json()
    texts = data.get("text")

    if not texts:
        return jsonify({"error": "Missing 'text' in request body"}), 400

    if isinstance(texts, str):
        texts = [texts]
    elif not isinstance(texts, list):
        return jsonify({"error": "'text' must be a string or a list of strings"}), 400

    embeddings = model.encode(texts, convert_to_numpy=True).tolist()
    return jsonify({
        "embeddings": embeddings,
        "input_count": len(texts),
        "dimension": model.get_sentence_embedding_dimension()
    })

if __name__ == '__main__':
    app.run(port=5000)
