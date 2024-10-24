// Log
const log = document.getElementById('log')

// Conversation and input
const conversation = document.getElementById('conversation')
const userInput = document.getElementById('userinput')

// Buttons
const uploadBTN = document.getElementById('upload-btn')
const pushToDBBtn = document.getElementById('pushbtn')
const deleteBtn = document.getElementById('deletedbbutton')
const deleteUploadsBtn = document.getElementById('deleteuploadsbtn')


// List of files, uploads
const databaseList = document.getElementById('file-list-ul');
const uploadsList = document.getElementById('uploads-list-ul');

// File upload window (hidden)
const fileInput = document.getElementById('fileInput')


// Array to keep track of selected files
var selectedFiles = [];
var selectedUploads = [];

// Updates UI with file lists on startup
window.onload = function() {
    populateFileList();
    populateUploadList();
}

// Extracts just the file name from the path
function getFileNameOnly(file_path) {
    return file_name = file_path.split(/\\|\//).pop();
}

// Expands text field to accomodate multiple lines of text
function autoExpand(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight) + 'px';

  if (textarea.scrollHeight > parseInt(getComputedStyle(textarea).maxHeight)) {
      textarea.style.overflowY = 'scroll';
  } else {
      textarea.style.overflowY = 'hidden';
  }
}

// Changes list items' appearance and stores them in data when they are selected by the user
function toggleFileSelection(li) {
    li.classList.toggle('selected'); // Toggle selected class
    const filePath = li.dataset.path;

    // Toggle bold text for selected files
    if (li.classList.contains('selected')) {
        li.style.fontWeight = 'bold'; // Make text bold when selected
        if (li.classList.contains('upload-item')){
            selectedUploads.push(filePath);
        }
        if (li.classList.contains('file-item')){
            selectedFiles.push(filePath);
        }
    } else {
        li.style.fontWeight = 'normal'; // Revert text to normal when not selected
        selectedFiles = selectedFiles.filter(file => file !== filePath); // Remove file from selectedFiles
    }
}

// adds a message to the log
function writeToLog(message) {
    log.innerHTML = log.innerHTML + message + '<br>';
}