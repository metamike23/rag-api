const axios = require('axios');

// Cosine similarity function
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        console.error('Error: Vectors are of different lengths or null/undefined.');
        return NaN;
    }

    const dotProduct = vecA.reduce((sum, v, i) => sum + v * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, v) => sum + v * v, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, v) => sum + v * v, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
        console.error('Error: One of the vectors has zero magnitude.');
        return NaN;
    }

    return dotProduct / (magnitudeA * magnitudeB);
}

// Function to request embedding from your Python API
async function getEmbedding(text) {
    try {
        const response = await axios.post('http://localhost:5000/embed', {
            text: text
        }, {
            headers: {
                'x-api-key': '123456789012345' // Replace with your actual API key
            }
        });

        // Debugging: Log the embeddings received from the Python API
        console.log(`Embedding for "${text}":`, response.data.embeddings);

        return response.data.embeddings[0]; // Assuming only one vector per string in the response
    } catch (error) {
        console.error('Error fetching embedding:', error);
        return null;
    }
}

// Function to compare a prompt vector with an array of strings and return a map with their similarities
async function comparePromptWithStrings(prompt, textsArray) {
    const promptEmbedding = await getEmbedding(prompt);

    if (!promptEmbedding || promptEmbedding.length === 0) {
        console.log('Error: Invalid embedding for prompt.');
        return;
    }

    // Debugging: Log the shape of the prompt embedding
    console.log('Prompt embedding structure:', promptEmbedding);

    // Create an array to store the cosine similarity results
    const similarityResults = {};

    // Loop over the array of strings and fetch embeddings dynamically to compute similarity
    for (const text of textsArray) {
        const vector = await getEmbedding(text); // Fetch the embedding for each text

        // Ensure the vector from the map is valid and of the same length as the prompt
        if (!vector || vector.length !== promptEmbedding.length) {
            console.error(`Error: Invalid vector for "${text}", skipping...`);
            continue;
        }

        const similarity = cosineSimilarity(promptEmbedding, vector); // Compare prompt embedding with fetched vector
        similarityResults[text] = similarity;
    }

    return similarityResults;
}

// Example usage
const prompt = "This is a sample prompt to compare with other vectors.";
const textsArray = [
    "This is the first comparison text.",
    "Here is another text to compare.",
    "The third comparison text is here.",
    // Add more texts to compare with the prompt
];

async function runComparison() {
    const similarityScores = await comparePromptWithStrings(prompt, textsArray);
    console.log("Similarity Scores: ", similarityScores);
}

runComparison();
