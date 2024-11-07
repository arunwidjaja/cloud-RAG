// src/App.js

import React, { useEffect, useState } from 'react';
import './App.css';

async function fetch_db_files_metadata() {
  try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/db_files_metadata`);
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
async function fetch_uploads_metadata() {
  try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/uploads_metadata`);
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

function App() {
  const [files, set_files] = useState([]);
  const [uploads, set_uploads] = useState([]);

  const populate_file_list = async () => {
    const fetched_files = await fetch_db_files_metadata();
    set_files(fetched_files)
  };
  const populate_upload_list = async () => {
    const fetched_uploads = await fetch_uploads_metadata();
    set_uploads(fetched_uploads)
  };
  

  useEffect(() => {
    populate_file_list();
    populate_upload_list();
  }, []);

  const toggleFileSelection = (file) => {
    alert(`File selected: ${file.name}`);
    // Here, you could add or remove the file from a "selected" state, if needed
  };

  // Database collection file list
  let file_list_content;
  if (files.length === 0){
    file_list_content = <li>Searching for files in the collection...</li>;
  } else {
    file_list_content = files.map((file) => (
      <li
        key = {file.hash}
        className = 'file-item'
        style = {{cursor: 'pointer'}}
        onClick={() => toggleFileSelection(file)}
        data_name = {file.name}
        data_hash = {file.hash}
        data_word_count = {file.word_count}
      >
        {file.name}
      </li>
    ));
  }
    // Database collection file list
    let upload_list_content;
    if (uploads.length === 0){
      upload_list_content = <li>Searching for uploads...</li>;
    } else {
      upload_list_content = uploads.map((upload) => (
        <li
          key = {upload.hash}
          className = 'file-item'
          style = {{cursor: 'pointer'}}
          onClick={() => toggleFileSelection(upload)}
          data_name = {upload.name}
          data_hash = {upload.hash}
          data_word_count = {upload.word_count}
        >
          {upload.name}
        </li>
      ));
    }

  return (
    <div className="container">
      {/* Banner */}
      {/* <div class="banner">
          Cloud RAG UI - Draft Only. Do Not Use.
      </div> */}
      {/* Hidden element - file open window */}
      <input type="file" id="fileInput" style={{display: 'none'}} multiple />
      <div className="container">
          {/* Left Pane */}
          <div className="L1" id="L1S1">
              <div id="title">
                  Cloud RAG - dev version
              </div>
              <div id="version">v0.2</div>
              <div id="links"><br />
                  <a href="https://github.com/arunwidjaja/cloud-RAG" target="_blank">
                      <img className="icon" src="/github_light.svg"/>
                    </a>
              </div>
              <div id="auth">
                  (WIP) Auth/Collections
                  {/* <button class="devtools" id="dev_create_input">Create input bubble</button>
                  <button class="devtools" id="dev_create_response">Create response bubble</button>
                  <button class="devtools" id="dev_create_context">Create context bubble</button> */}
              </div>
              <div id="shortcuts">
                  <button className="shortcut_button" id="summarize">Summarize Selected Documents</button>
                  <button className="shortcut_button" id="summarize_all">Summarize All Documents</button>
                  <button className="shortcut_button" id="highlights">Retrieve Themes</button>
                  <button className="shortcut_button" id="sentiment">(WIP) Analyze Sentiment</button>
              </div>
              <div id="log">
              </div>
          </div>
          {/* Middle Pane */}
          <div className="L1" id="L1S2">
              <div id="conversation" className="output"></div>
              <textarea id="userinput"></textarea>
          </div>
          {/* Right Pane */}
          <div className="L1" id="L1S3">
              <div id="uploadssection">
                  <div id="uploadstitle">
                      Uploaded Files
                  </div>
                  <div className="filelist" id="uploadslist">
                      <ul id="uploads-list-ul">
                          {upload_list_content}
                      </ul>
                  </div>
                  <button id="pushbtn">Push Uploads to DB</button>
                  <div className="uploadsbuttons">
                      <button id='upload-btn' className="btn">Upload Files</button>
                      <button id='deleteuploadsbtn'className="btn">Clear Selected Uploads</button>
                  </div>
              </div>
              <div id="databasesection">
                  <div id="databasetitle">
                      Database Files
                  </div>
                  <div className="filelist" id="databaselist">
                      <ul id="file-list-ul">
                        {file_list_content}
                      </ul>
                  </div>
                  <div className="databasebuttons">
                      <button className="btn" id="downloaddbbutton">Download Selected Files from DB</button>
                      <button className="btn" id="deletedbbutton">Delete Selected Files from DB</button>
                  </div>
              </div>
          </div>
      </div>
      <script src="../static/UI.js"></script>
      <script src="../static/API.js"></script>
    </div>
  );
}

export default App;
