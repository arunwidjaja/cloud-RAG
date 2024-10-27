const PATH_DOWNLOAD_ICON = '../static/images/download_light.svg'

fileInput.addEventListener('change', get_uploads_from_user);
pushToDBBtn.addEventListener('click', pushToDB);
downloadBtn.addEventListener('click', downloadFiles);

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
async function pushToDB() {
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



function appendConversation(content_arg, type_arg, source_arg) {
    const convoBubble = document.createElement("div");
    switch(type_arg.toUpperCase()) {
        case "INPUT":
            convoBubble.className = "conversation_input";
            break;
        case "OUTPUT":
        case "CONTEXT":
            convoBubble.className = "conversation_output";
            break;
    }

    // Add text to bubble
    convoBubble.innerHTML = content_arg.replace(/\n/g, '<br>');

    // Add DL button to bubble if it's context
    if (type_arg.toUpperCase() === "CONTEXT") {
        convoBubble.dataset.context_source = source_arg;
        addDownloadContextButton(convoBubble)
    }

    // Add bubble to conversation
    const conversationDiv = document.getElementById("conversation");
    conversationDiv.appendChild(convoBubble);
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
            source_stripped = getFileNameOnly(source)
            appendConversation(
                content_arg = "Source: " + source_stripped + '\n\n' + context,
                type_arg = "context",
                source_arg = source 
            );
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


// TODO: combine downloadFiles() and downloadContext(source_arg) into one function
// Need to modify downloadFiles() so that it accepts an argument, and pass selectedFiles as the argument on the event listener for the download db button?
async function downloadFiles() {
    const download_list = {
        download_list: selectedFiles
    };
    try{
        const downloaded_files = await fetch('/download_files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(download_list)
        });
        
        selectedFiles = [];
        const downloaded_files_JSON = await downloaded_files.json();
        writeToLog("Downloaded files from DB: " + downloaded_files_JSON)
    } catch (error) {
        console.error('Error downloading files:', error)
    }
}
async function downloadContext(source_arg) {
    const context_source = {
        download_list: [source_arg]
    };
    try{
        const downloaded_source = await fetch('/download_files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(context_source)
        });
        const downloaded_source_JSON = await downloaded_source.json();
        writeToLog("Downloaded source files from DB: " + downloaded_source_JSON)
    } catch (error) {
        console.error('Error downloading source files:', error)
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

function addDownloadContextButton(convoBubble) {
    const download_context = document.createElement('div');
    const download_icon = document.createElement('img');

    // Create the download button and the icon
    download_context.className = 'download_context';
    download_icon.classList.add('icon');
    download_icon.classList.add('download_context_button');
    download_icon.id = 'download_context_button'
    download_icon.src = PATH_DOWNLOAD_ICON;

    // add icon to div, add div to convo bubble
    download_context.appendChild(download_icon);
    convoBubble.appendChild(download_context)

    // Add event listener to the icon
    download_icon.addEventListener('click', function() {
        source = convoBubble.dataset.context_source;
        downloadContext(source);
    });
}