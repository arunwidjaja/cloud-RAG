fileInput.addEventListener('change', get_uploads_from_user);
pushToDBBtn.addEventListener('click', pushToDB);
deleteBtn.addEventListener('click', deleteFiles);
deleteUploadsBtn.addEventListener('click', deleteUploads);
uploadBTN.addEventListener('click', function(){
    fileInput.click();
});
userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        if (!event.shiftKey) {
            event.preventDefault(); // Prevents adding a new line
            var query = userInput.value;
            submitQuery(query);
            userInput.value=''
        }
    }
});

// Upload files
async function get_uploads_from_user(event) {
    const files = event.target.files;  // Get all selected files
    if (files.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        try {
            const response = await fetch('/upload_documents', {
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

// Push uploads to DB
async function pushToDB(){
    try {
        const response = await fetch('/push_files_to_database');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        else
            writeToLog("Pushed files to DB.")
    } catch (error) {
        console.error('Error refreshing database:', error);
        return [];
    }
    populateUploadList()
    populateFileList()
    
}

// Queries LLM
async function submitQuery(query) {
    const user_Input = query;
    if (!user_Input) {
        alert("Please enter a query.");
        return;
    }
    try {
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
    conversation.innerText = response_Text;
}

// Get list of files in DB
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

// Get list of uploads
async function fetchUploads() {
    try {
        console.log("Fetching uploads...")
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

// Deletes files from DB
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
        writeToLog(deletion_message.deletion_message)
    } catch (error) {
        console.error('Error deleting files:', error)
    }
}

// Clears out uploads (not DB files)
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
        writeToLog(deletion_message.deletion_message)
    } catch (error) {
        console.error('Error deleting files:', error)
    }
}


// Refreshes the DB files list
async function populateFileList() {   
    const files = await fetchFiles();
    databaseList.innerHTML = '';

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = getFileNameOnly(file); // Set the text of the list item
        listItem.dataset.path = file;
        listItem.classList.add('file-item'); // Add a class for styling
        listItem.style.cursor = 'pointer'; // Change cursor to pointer
        listItem.onclick = () => toggleFileSelection(listItem); // Add click event
        databaseList.appendChild(listItem); // Append the list item to the file list
    });
    if(files.length === 0){
        const noFilesItem = document.createElement('li');
        noFilesItem.textContent = 'Database is empty'; // Set the message for no files
        databaseList.appendChild(noFilesItem); // Append the no files item to the file list
    }
}

// Refreshes the uploads list
async function populateUploadList() {
    const files = await fetchUploads();
    uploadsList.innerHTML = '';

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = getFileNameOnly(file); // Set the text of the list item
        listItem.dataset.path = file;
        listItem.classList.add('file-item'); // Add a class for styling
        listItem.style.cursor = 'pointer'; // Change cursor to pointer
        listItem.onclick = () => toggleFileSelection(listItem); // Add click event
        uploadsList.appendChild(listItem); // Append the list item to the file list
    });
    if(files.length === 0){
        const noFilesItem = document.createElement('li');
        noFilesItem.textContent = 'No files have been uploaded.'; // Set the message for no files
        uploadsList.appendChild(noFilesItem); // Append the no files item to the file list
    }
}