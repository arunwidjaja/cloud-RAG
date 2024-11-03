const PATH_DOWNLOAD_ICON = '../static/images/download_light.svg'

// Hidden element. Launches file upload window
file_input.addEventListener('change', get_uploads_from_user);

summary_btn.addEventListener('click', generate_summary);
sentiment_btn.addEventListener('click', analyze_sentiment);

push_to_db_btn.addEventListener('click', push_to_DB);
download_btn.addEventListener('click', download_files);

delete_btn.addEventListener('click', delete_files);
delete_uploads_btn.addEventListener('click', delete_uploads);
upload_btn.addEventListener('click', function(){
    file_input.click();
});
user_input.addEventListener('keydown', capture_input);

// Shortcut: Generate summary
async function generate_summary() {
    add_bubble(
        content_arg = 'Dummy Summary',
        type_arg = 'OUTPUT'
    )
}
// Shortcut: Generate sentiment analysis
async function analyze_sentiment() {
    add_bubble(
        content_arg = 'Dummy Sentiment Analysis',
        type_arg = 'OUTPUT'
    )
}

// Submits query when the user hits Enter
function capture_input(event) {
    if (event.key === 'Enter') {
        if (!event.shiftKey) {
            event.preventDefault(); // Prevents adding a new line
            var query = user_input.value;
            add_bubble(query, "input");
            query_llm(query);
            user_input.value=''
        }
    }
}

// Launches upload file window
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
            file_input.value = '';
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    }
    populate_upload_list();
}

// Pushes uploaded files to the DB
async function push_to_DB() {
    try {
        const pushed_files = await fetch('/initiate_push_to_db');
        if (!pushed_files.ok) {
            throw new Error('Network response was not ok');
        }
        else {
            const pushed_files_JSON = await pushed_files.json();
            log_message("Pushed files to DB: " + pushed_files_JSON)
        }
    } catch (error) {
        console.error('Error refreshing database:', error);
        return [];
    }
    populate_upload_list()
    populate_file_list()   
}

// Adds a chat bubble to the conversation
function add_bubble(content_arg, type_arg, source_arg) {
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

    // Adds text to the bubble
    convoBubble.innerHTML = content_arg.replace(/\n/g, '<br>');

    // Adds a DL button to the bubble if it's a context citation
    if (type_arg.toUpperCase() === "CONTEXT") {
        convoBubble.dataset.context_source = source_arg;
        add_download_icon(convoBubble)
    }

    // Adds the bubble to the conversation and displays it
    const conversationDiv = document.getElementById("conversation");
    conversationDiv.appendChild(convoBubble);
}

// Queries the LLM and prints the response
async function query_llm(query) {
    const user_Input = query;
    if (!user_Input) {
        alert("Please enter a query.");
        return;
    }
    try {
        // fetches the response
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
        response_context = message_model.contexts; // Dictionary of context and source
        
        // Displays the answer
        add_bubble(response_text, "output")

        // Displays the source file and the associated context in one bubble.
        for (const data of response_context) {
            context = data['context'];
            source = data['source'];
            source_stripped = get_file_name(source)
            add_bubble(
                content_arg = "Source: " + source_stripped + '\n\n' + context,
                type_arg = "context",
                source_arg = source 
            );
        }
    } catch (error) {
        console.error('Error:', error);
        response_text = 'There was an error generating a response. Please try again.'
        log_message(response_text)
        add_bubble(response_text,"output")
    }
}

// Gets a list of files in the DB
async function fetch_db_files() {
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

// Gets a list of uploaded files
async function fetch_uploads() {
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
async function delete_files () {
    const file_list = {
        deletion_list: selected_files
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
        selected_files = [];
        populate_file_list();
        const deleted_files_JSON = await deleted_files.json();
        log_message("Deleted from DB: " + deleted_files_JSON)
    } catch (error) {
        console.error('Error deleting files:', error)
    }
}


// Downloads the selected files from the DB
async function download_files(files = selected_files) {
    const download_list = {
        download_list: files
    };
    try{
        const downloaded_files = await fetch('/download_files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(download_list)
        });
        
        selected_files = [];
        const downloaded_files_JSON = await downloaded_files.json();
        log_message("Downloaded files from DB: " + downloaded_files_JSON)
    } catch (error) {
        console.error('Error downloading files:', error)
    }
}
// Downloads the source file associated with a given context
async function download_context(source_arg) {
    const files = [source_arg];
    download_files(files);
}

// Deletes the selected uploads
async function delete_uploads () {
    const file_list = {
        deletion_list: selected_uploads
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
        selected_uploads = [];
        populate_upload_list();
        const deleted_uploads_JSON = await deleted_uploads.json();
        log_message("Removed upload: " + deleted_uploads_JSON)
    } catch (error) {
        console.error('Error deleting files:', error)
    }
}

// Refreshes the DB files list
async function populate_file_list() {   
    const files = await fetch_db_files();
    db_files_list.innerHTML = '';

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = get_file_name(file); // Set the text of the list item
        listItem.dataset.path = file;
        listItem.classList.add('file-item'); // Add a class for styling
        listItem.style.cursor = 'pointer'; // Change cursor to pointer
        listItem.onclick = () => toggle_file_selection(listItem); // Add click event
        db_files_list.appendChild(listItem); // Append the list item to the file list
    });
    if(files.length === 0){
        const noFilesItem = document.createElement('li');
        noFilesItem.textContent = 'Database is empty'; // Set the message for no files
        db_files_list.appendChild(noFilesItem); // Append the no files item to the file list
    }
}

// Refreshes the uploads list
async function populate_upload_list() {
    const files = await fetch_uploads();
    uploads_list.innerHTML = '';

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = get_file_name(file); // Set the text of the list item
        listItem.dataset.path = file;
        listItem.classList.add('upload-item'); // Add a class for styling
        listItem.style.cursor = 'pointer'; // Change cursor to pointer
        listItem.onclick = () => toggle_file_selection(listItem); // Add click event
        uploads_list.appendChild(listItem); // Append the list item to the file list
    });
    if(files.length === 0){
        const noFilesItem = document.createElement('li');
        noFilesItem.textContent = 'No files have been uploaded.'; // Set the message for no files
        uploads_list.appendChild(noFilesItem); // Append the no files item to the file list
    }
}

// Adds a download button to a chat bubble
function add_download_icon(convoBubble) {
    const download_context_div = document.createElement('div');
    const download_icon = document.createElement('img');

    // Create the download button and the icon
    download_context_div.className = 'download_context';
    download_icon.classList.add('icon');
    download_icon.classList.add('download_context_button');
    download_icon.id = 'download_context_button'
    download_icon.src = PATH_DOWNLOAD_ICON;

    // add icon to div, add div to convo bubble
    download_context_div.appendChild(download_icon);
    convoBubble.appendChild(download_context_div)

    // Add event listener to the icon
    download_icon.addEventListener('click', function() {
        source = convoBubble.dataset.context_source;
        download_context(source);
    });
}


// Dev tools
dev_add_input_button.addEventListener('click', function(){
    add_bubble(
        content_arg = "This is a dummy user input bubble.<br>It has multiple lines.<br>This is for testing the UI appearance.",
        type_arg = "INPUT",
        source_arg = "Sample Source"
    )
});
dev_add_response_button.addEventListener('click', function(){
    add_bubble(
        content_arg = "This is a dummy response bubble.<br>It has multiple lines.<br>This is for testing the UI appearance.",
        type_arg = "OUTPUT",
        source_arg = "Sample Source"
    )
});
dev_add_context_button.addEventListener('click', function(){
    add_bubble(
        content_arg = "This is a dummy context bubble.<br>It has multiple lines.<br>This is for testing the UI appearance.",
        type_arg = "CONTEXT",
        source_arg = "Sample Source"
    )
});
