// Event listeners
document.getElementById('submit-btn').addEventListener('click', submitQuery);
document.getElementById('push-to-DB-btn').addEventListener('click', pushToDB);
document.getElementById('delete-btn').addEventListener('click', deleteFiles);
window.onload = populateFileList;

async function submitQuery() {
    const user_Input = document.getElementById('query-input').value;

    // Make sure input is not empty
    if (!user_Input) {
        alert("Please enter a query.");
        return;
    }  
    document.getElementById('response-box').innerText = "Query received. Generating response. Please wait...";

    try {
        // Send query text to backend and retrieve formatted response
        const response_JSON = await fetch('/submit_query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query_text: user_Input})
        });
        const response_JSON_String = await response_JSON.json();
        response_Text = response_JSON_String.query_response
    } catch (error) {
        console.error('Error:', error);
        response_Text = 'Error generating response. Please try again.'
    }
    // Update response box
    document.getElementById('response-box').innerText = response_Text;
}

async function pushToDB(){
    try {
        const response = await fetch('/push_files_to_database'); // Adjust this URL if necessary
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        else
            alert("Files have been pushed to the DB")
            populateFileList()
    } catch (error) {
        console.error('Error refreshing database:', error);
        return [];
    }
}

async function fetchFiles() {
    try {
        const response = await fetch('/db_file_list');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const files = await response.json();
        return files;
    } catch (error) {
        console.error('Error fetching files:', error);
        return [];
    }
}



// Updating the UI with a list of files from the DB
async function populateFileList() {
    const fileListElement = document.getElementById('file-list-ul');
    const files = await fetchFiles();

    // Clear existing list items
    fileListElement.innerHTML = '';

    // Create and append list items
    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file; // Set the text of the list item
        listItem.classList.add('file-item'); // Add a class for styling
        listItem.style.cursor = 'pointer'; // Change cursor to pointer
        listItem.onclick = () => toggleFileSelection(listItem); // Add click event
        fileListElement.appendChild(listItem); // Append the list item to the file list
    });
    if(files.length === 0){
        const noFilesItem = document.createElement('li');
        noFilesItem.textContent = 'No Files Found'; // Set the message for no files
        fileListElement.appendChild(noFilesItem); // Append the no files item to the file list
    }
}

// Array to keep track of selected files
let selectedFiles = [];

// Function to toggle file selection
function toggleFileSelection(li) {
    li.classList.toggle('selected'); // Toggle selected class
    const fileName = li.textContent;

    // Toggle bold text for selected files
    if (li.classList.contains('selected')) {
        li.style.fontWeight = 'bold'; // Make text bold when selected
        selectedFiles.push(fileName); // Add file to selectedFiles
    } else {
        li.style.fontWeight = 'normal'; // Revert text to normal when not selected
        selectedFiles = selectedFiles.filter(file => file !== fileName); // Remove file from selectedFiles
    }
}

async function deleteFiles () {
    const file_list = {
        deletion_list: selectedFiles
    };
    try{
        const response_JSON = await fetch('/delete_files', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(file_list)
        });
        selectedFiles = [];
        populateFileList();
        const deletion_message = await response_JSON.json();
        alert(deletion_message.deletion_message)
    } catch (error) {
        console.error('Error deleting files:', error)
    }
}

// Making the screen divider resizable
const container = document.getElementById('resizable-container');
    const resizeHandle = document.getElementById('resize-handle');

    resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent text selection

        const startX = e.clientX;
        const startWidth = container.offsetWidth;

        const onMouseMove = (e) => {
            const newWidth = startWidth + (e.clientX - startX);
            container.style.width = `${newWidth}px`;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });