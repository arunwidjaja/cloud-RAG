const log = document.getElementById('log')
const conversation = document.getElementById('conversation')
const uploadBTN = document.getElementById('upload-btn')
const pushToDBBtn = document.getElementById('pushbtn')
const deleteBtn = document.getElementById('deletedbbutton')
const deleteUploadsBtn = document.getElementById('deleteuploadsbtn')
const userInput = document.getElementById('userinput')
const databaseList = document.getElementById('file-list-ul');
const uploadsList = document.getElementById('uploads-list-ul');
const fileInput = document.getElementById('fileInput') // Hidden element


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

// adds a message to the log
function writeToLog(message) {
    log.innerHTML = log.innerHTML + message + '<br>';
}



const listItem = document.createElement('li');
listItem.textContent = getFileNameOnly(file); // Set the text of the list item
listItem.dataset.path = file;
listItem.classList.add('file-item'); // Add a class for styling
listItem.style.cursor = 'pointer'; // Change cursor to pointer
listItem.onclick = () => toggleFileSelection(listItem); // Add click event
databaseList.appendChild(listItem); // Append the list item to the file list