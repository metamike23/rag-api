import requests
import json

# The list of documents you want to embed
documents = [
    "Artificial Intelligence is the simulation of human intelligence processes by machines.",
    "Machine Learning is a subset of AI that involves training a model on data to predict outcomes.",
    "Natural Language Processing (NLP) helps computers understand, interpret, and generate human language."
]

# Prepare the request payload
data = {"text": documents}

# Set the API endpoint and headers
url = "http://localhost:5000/embed"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "123456789012345"  # Use the appropriate API key
}

# Send the request to the /embed API
response = requests.post(url, headers=headers, data=json.dumps(data))

# Check the response
if response.status_code == 200:
    embeddings = response.json()["embeddings"]
    print("Embeddings:", embeddings)
else:
    print("Error:", response.status_code, response.text)
