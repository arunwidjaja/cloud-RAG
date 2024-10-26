fileInput.addEventListener('change', get_uploads_from_user);
pushToDBBtn.addEventListener('click', pushToDB);
deleteBtn.addEventListener('click', deleteFiles);
deleteUploadsBtn.addEventListener('click', deleteUploads);
uploadBTN.addEventListener('click', function(){
    fileInput.click();
});
userInput.addEventListener('keydown', captureInput);

function captureInput(event) {
    if (event.key === 'Enter') {
        if (!event.shiftKey) {
            event.preventDefault(); // Prevents adding a new line
            var query = userInput.value;
            appendConversation(query, "input");
            submitQuery(query);
            userInput.value=''
        }
    }
}

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
        const pushed_files = await fetch('/push_files_to_database');
        if (!pushed_files.ok) {
            throw new Error('Network response was not ok');
        }
        else {
            const pushed_files_JSON = await pushed_files.json();
            writeToLog("Pushed files to DB: " + pushed_files_JSON)
        }
    } catch (error) {
        console.error('Error refreshing database:', error);
        return [];
    }
    populateUploadList()
    populateFileList()
    
}

function appendConversation(content, type) {
    const contentDiv = document.createElement("div");
    switch(type.toUpperCase()) {
        case "INPUT":
            contentDiv.className = "conversation_input";
            break;
        case "OUTPUT":
            contentDiv.className = "conversation_output";
            break;
    }
    // contentDiv.textContent = content;
    contentDiv.innerHTML = content.replace(/\n/g, '<br>'); //replace newlines with line breaks
    const conversationDiv = document.getElementById("conversation");
    conversationDiv.appendChild(contentDiv);
}

// Queries LLM, prints response
async function submitQuery(query) {
    const user_Input = query;
    if (!user_Input) {
        alert("Please enter a query.");
        return;
    }
    try {
        // fetches the QueryResponse object
        const query_response = await fetch('/submit_query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query_text: user_Input})
        });
        const query_response_JSON = await query_response.json();
        const message_model = query_response_JSON['message_model'];

        
        response_text = message_model.message; // The actual answer
        response_id = message_model.id; // The ID of the answer. Unused for now.
        response_context = message_model.contexts; // Dict of context and source
        
        // output answer
        appendConversation(response_text, "output")

        // output source and context
        for (const data of response_context) {
            context = data['context'];
            source = data['source'];
            appendConversation("Source: " + source + '\n\n' + context, "output");
        }
    } catch (error) {
        console.error('Error:', error);
        response_text = 'There was an error generating a response. Please try again.'
        writeToLog(response_text)
        appendConversation(response_text,"output")
    }
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
        const deleted_files = await fetch('/delete_files', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(file_list)
        });

        // Clears selections, refreshes list of files
        selectedFiles = [];
        populateFileList();
        const deleted_files_JSON = await deleted_files.json();
        writeToLog("Deleted from DB: " + deleted_files_JSON)
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
        const deleted_uploads = await fetch('/delete_uploads', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(file_list)
        });

        // Clears selections, refreshes list of uploads
        selectedUploads = [];
        populateUploadList();
        const deleted_uploads_JSON = await deleted_uploads.json();
        writeToLog("Removed upload: " + deleted_uploads_JSON)
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
        listItem.classList.add('upload-item'); // Add a class for styling
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