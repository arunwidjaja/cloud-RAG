// src/App.js

import React, { useEffect, useState } from 'react';
import './App.css';

async function fetch_db_files_metadata() {
  // Fetches the list of files in the database
  // TODO: Make it collection specific
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
  // Fetches the list of uploads from backend
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
async function start_push_to_DB() {
  try {
      const pushed_files = await fetch(`${process.env.REACT_APP_API_BASE_URL}/initiate_push_to_db`);
      if (!pushed_files.ok) {
          throw new Error('Network response was not ok');
      }
      else {
          const pushed_files_JSON = await pushed_files.json();
          return pushed_files_JSON
      }
  } catch (error) {
      console.error('Error refreshing database:', error);
      return [];
  }
}

function App() {
  const [files, set_files] = useState([]);
  const [uploads, set_uploads] = useState([]);
  const [selected_items, set_selected_items] = useState([]);
  const [log_messages, set_log_messages] = useState([]);

  const log_message = (message) => {
    set_log_messages((prev_messages) => [...prev_messages, message]);
  };

  const populate_file_list = async () => {
    const fetched_files = await fetch_db_files_metadata();
    set_files(fetched_files)
  };
  const populate_upload_list = async () => {
    const fetched_uploads = await fetch_uploads_metadata();
    set_uploads(fetched_uploads)
  };
  const push_uploads = async () => {
    const pushed_uploads = await start_push_to_DB();
    const fetched_files = await fetch_db_files_metadata();
    const fetched_uploads = await fetch_uploads_metadata();
    set_files(fetched_files);
    set_uploads(fetched_uploads);
    pushed_uploads.forEach((pushed_upload) => {
      log_message("Pushed Upload: " + pushed_upload)
    });
  };
  
  useEffect(() => {
    populate_file_list();
    populate_upload_list();
  }, []);

  const toggle_selected = (item) => {
    if (selected_items.includes(item)){
      set_selected_items(selected_items.filter((selected) => selected !== item));
    } else {
      set_selected_items([...selected_items, item])
    }
  };

  // list of logger messages
  let log_content;
  log_content = log_messages.map((msg, index) => (
    <div
      key = {index}
      style = {{
        fontSize: '12px',
        fontFamily: 'monospace'
      }}
    >
      {msg}
    </div>
  ));

  // Database collection file list
  let file_list_content;
  if (files.length === 0){
    file_list_content = <li>This collection is empty</li>;
  } else {
    file_list_content = files.map((file) => (
      <li
        key = {file.hash}
        className = 'file-item'
        data_name = {file.name}
        data_hash = {file.hash}
        data_word_count = {file.word_count}
        onClick={() => toggle_selected(file)}
        style = {{
          cursor: 'pointer',
          fontWeight: selected_items.includes(file) ? 'bold':'normal'
        }}
      >
        {file.name}
      </li>
    ));
  }
    // Upload list
    let upload_list_content;
    if (uploads.length === 0){
      upload_list_content = <li>No files have been uploaded</li>;
    } else {
      upload_list_content = uploads.map((upload) => (
        <li
          key = {upload.hash}
          className = 'file-item'
          data_name = {upload.name}
          data_hash = {upload.hash}
          data_word_count = {upload.word_count}
          onClick={() => toggle_selected(upload)}
          style = {{
            cursor: 'pointer',
            fontWeight: selected_items.includes(upload) ? 'bold':'normal'
          }}
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
                {log_content}
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
                  <button
                    id="pushbtn" onClick={push_uploads}>Push Uploads to DB</button>
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
