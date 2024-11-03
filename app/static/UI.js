// Log
const log = document.getElementById('log')

// Conversation and input
const conversation = document.getElementById('conversation')
const user_input = document.getElementById('userinput')

// Buttons (left pane, shortcuts)
const summary_btn = document.getElementById('summarize')
const sentiment_btn = document.getElementById('sentiment')

// Buttons (right pane)
const push_to_db_btn = document.getElementById('pushbtn')
const upload_btn = document.getElementById('upload-btn')
const delete_uploads_btn = document.getElementById('deleteuploadsbtn')
const download_btn = document.getElementById('downloaddbbutton')
const delete_btn = document.getElementById('deletedbbutton')

// Buttons (development use only)
const dev_add_input_button = document.getElementById('dev_create_input')
const dev_add_response_button = document.getElementById('dev_create_response')
const dev_add_context_button = document.getElementById('dev_create_context')

// List of files, uploads
const db_files_list = document.getElementById('file-list-ul');
const uploads_list = document.getElementById('uploads-list-ul');

// File upload window (hidden)
const file_input = document.getElementById('fileInput')


// Array to keep track of selected files
var selected_files = [];
var selected_uploads = [];

// Updates UI with file lists on startup
window.onload = function() {
    populate_file_list();
    populate_upload_list();
}

// Extracts just the file name from the path
function get_file_name(file_path) {
    return file_name = file_path.split(/\\|\//).pop();
}

// Expands text field to accomodate multiple lines of text
function auto_expand(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight) + 'px';

  if (textarea.scrollHeight > parseInt(getComputedStyle(textarea).maxHeight)) {
      textarea.style.overflowY = 'scroll';
  } else {
      textarea.style.overflowY = 'hidden';
  }
}

// Changes list items' appearance and stores them in data when they are selected by the user
function toggle_file_selection(li) {
    li.classList.toggle('selected'); // Toggle selected class
    const filePath = li.dataset.path;

    // Toggle bold text for selected files
    if (li.classList.contains('selected')) {
        li.style.fontWeight = 'bold'; // Make text bold when selected
        if (li.classList.contains('upload-item')){
            selected_uploads.push(filePath);
        }
        if (li.classList.contains('file-item')){
            selected_files.push(filePath);
        }
    } else {
        li.style.fontWeight = 'normal'; // Revert text to normal when not selected
        selected_files = selected_files.filter(file => file !== filePath); // Remove file from selectedFiles
    }
}

// adds a message to the log
function log_message(message) {
    log.innerHTML = log.innerHTML + message + '<br>';
}