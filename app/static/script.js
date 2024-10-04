document.getElementById('submit-btn').addEventListener('click', submitQuery);
document.getElementById('upload-btn').addEventListener('click', storeInDB);
document.getElementById('test-btn').addEventListener('click', runTests);
document.getElementById('clear-btn').addEventListener('click', clearDB);
document.getElementById('reset-btn').addEventListener('click', resetDB);

// Replace these with actual AJAX requests to your backend
async function submitQuery() {
    const userInput = document.getElementById('query-input').value;

        // Make sure input is not empty
    if (!userInput) {
        alert("Please enter a query.");
        return;
    }

    try {
        // Send a POST request to the backend
        const response = await fetch('/submit_query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query_text: userInput })
        });

        // Parse the JSON response
        const data = await response.json();

        // Update the response box with the received response
        document.getElementById('response-box').innerText = data.response;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('response-box').innerText = 'Error submitting query. Please try again.';
    }

    // Simulate an AJAX call to get the response
    // const response = "This is a simulated response for: " + userInput;
    document.getElementById('response-box').innerText = response;
}

function storeInDB() {
    // Simulate storing data in DB
    alert("Storing data in Chroma DB...");
}

function runTests() {
    // Simulate running tests
    alert("Running test queries...");
}

function clearDB() {
    // Simulate clearing DB
    alert("Database wiped.");
}

function resetDB() {
    // Simulate resetting DB
    alert("Database reset and data re-uploaded.");
}