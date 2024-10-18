// Event listeners
const uploadBTN = document.getElementById('upload-btn')
const pushToDBBtn = document.getElementById('push-to-DB-btn')
const submitBtn = document.getElementById('submit-btn')
const deleteBtn = document.getElementById('delete-btn')
const deleteUploadsBtn = document.getElementById('delete-uploads-btn')
const fileInput = document.getElementById('fileInput') // Hidden element

uploadBTN.addEventListener('click', function(){
    fileInput.click();
});
fileInput.addEventListener('change', get_uploads_from_user);
pushToDBBtn.addEventListener('click', pushToDB);
submitBtn.addEventListener('click', submitQuery);
deleteBtn.addEventListener('click', deleteFiles);
deleteUploadsBtn.addEventListener('click', deleteUploads);


// Updates UI with file lists on startup
window.onload = function() {
    populateFileList();
    populateUploadList();
}

// Array to keep track of selected files
let selectedFiles = [];
let selectedUploads = [];

// 
// User-Triggered functions
// 

// Launches file upload window
async function get_uploads_from_user(event) {
    const files = event.target.files;  // Get all selected files
    if (files.length > 0) {
        const formData = new FormData();

        // Append each file to the FormData object
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);  // The 'files' field should match the backend parameter
        }

        // Send files to FastAPI backend
        try {
            const response = await fetch('/upload_documents', {  // Replace with your actual FastAPI endpoint
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            console.log('Files uploaded successfully:', data);
            fileInput.value = '';
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    }
    populateUploadList();
}

// Processes the uploaded files and adds them to the DB
// This function will take a while
async function pushToDB(){
    try {
        const response = await fetch('/push_files_to_database'); // Adjust this URL if necessary
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        else
            alert("Files have been pushed to the DB")
            populateFileList()
            populateUploadList()
    } catch (error) {
        console.error('Error refreshing database:', error);
        return [];
    }
}

// Captures user query and queries LLM
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

async function fetchUploads() {
    try {
        const response = await fetch('/db_uploads_list');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const files = await response.json();
        return files;
    } catch (error) {
        console.error('Error fetching uploads:', error);
        return [];
    }
}

// Deletes vectorized files from the DB
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

// Clears out the uploaded files (not files that are in the DB)
async function deleteUploads () {
    const file_list = {
        deletion_list: selectedUploads
    };
    try{
        const response_JSON = await fetch('/delete_uploads', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(file_list)
        });
        selectedUploads = [];
        populateUploadList();
        const deletion_message = await response_JSON.json();
        alert(deletion_message.deletion_message)
    } catch (error) {
        console.error('Error deleting files:', error)
    }
}


//
// Background and Utility Processes
//

// Extracts just the file name from the path
function getFileNameOnly(file_path) {
    return file_name = file_path.split(/\\|\//).pop();
}

// Refreshes the DB files window
async function populateFileList() {
    const fileListElement = document.getElementById('file-list-ul');
    const files = await fetchFiles();

    // Clear existing list items
    fileListElement.innerHTML = '';

    // Create and append list items
    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = getFileNameOnly(file); // Set the text of the list item
        listItem.dataset.path = file;
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

// Refreshes the uploads window
async function populateUploadList() {
    const fileListElement = document.getElementById('uploads-list-ul');
    const files = await fetchUploads();

    // Clear existing list items
    fileListElement.innerHTML = '';

    // Create and append list items
    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = getFileNameOnly(file); // Set the text of the list item
        listItem.dataset.path = file;
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

// Changes list items' appearance and stores them in data when they are selected by the user
function toggleFileSelection(li) {
    li.classList.toggle('selected'); // Toggle selected class
    const fileName = li.dataset.path;

    // Toggle bold text for selected files
    if (li.classList.contains('selected')) {
        li.style.fontWeight = 'bold'; // Make text bold when selected
        selectedFiles.push(fileName); // Add file to selectedFiles
    } else {
        li.style.fontWeight = 'normal'; // Revert text to normal when not selected
        selectedFiles = selectedFiles.filter(file => file !== fileName); // Remove file from selectedFiles
    }
}



// UI Tweaking
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