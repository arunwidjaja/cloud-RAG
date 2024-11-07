import React, { useEffect, useState, useRef } from 'react';

import { fetch_db_files_metadata } from './api/api';
import { fetch_uploads_metadata } from './api/api';
import { start_push_to_DB } from './api/api';
import { start_upload_deletion } from './api/api';
import { start_file_deletion } from './api/api';
import { start_file_download } from './api/api';

import './App.css';


function App() {
  const [files, set_files] = useState([]);
  const [uploads, set_uploads] = useState([]);
  const [selected_files, set_selected_files] = useState([]);
  const [selected_uploads, set_selected_uploads] = useState([]);
  const [log_messages, set_log_messages] = useState([]);
  const upload_window = useRef(null);
  const accept_uploads = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/upload_documents`, {
            method: 'POST',
            body: formData
        });
        const uploaded_files = await response.json();
        uploaded_files.forEach((uploaded_file) => {
          log_message("Uploaded File: " + uploaded_file)
        });
        upload_window.current.value = '';
      } catch (error) {
          console.error('Error uploading files:', error);
      }
    }
    refresh_uploads();
  }

  //

  
  // Runs once on start
  useEffect(() => {
    refresh_files();
    refresh_uploads();
  }, []);




  const log_message = (message) => {
  // Writing a new message to the log
    set_log_messages((prev_messages) => [...prev_messages, message]);
  };
  const refresh_files = async () => {
  // Refreshing the list of files in the database
    const fetched_files = await fetch_db_files_metadata();
    set_files(fetched_files)
  };
  const refresh_uploads = async () => {
  // Refreshing the list of files in the uploads folder
    const fetched_uploads = await fetch_uploads_metadata();
    set_uploads(fetched_uploads)
  };




  const push_uploads = async () => {
  // Pushing the uploads to the database
    const pushed_uploads = await start_push_to_DB();
    refresh_files();
    refresh_uploads();
    set_selected_uploads([]);
    pushed_uploads.forEach((pushed_upload) => {
      log_message("Pushed upload: " + pushed_upload)
    });
  };
  const delete_uploads = async () => {
  // Deleting the selected uploads from the uploads folder
    const deleted_uploads = await start_upload_deletion(selected_uploads);
    refresh_uploads();
    set_selected_uploads([]);
    deleted_uploads.forEach((deleted_upload) => {
      log_message("Deleted upload: " + deleted_upload)
    });
  };  
  const download_files = async () => {
  // Download files from the collection
    const downloaded_files = await start_file_download(selected_files);
    set_selected_files([]);
    downloaded_files.forEach((downloaded_file) => {
      log_message("Downloaded file: " + downloaded_file)
    });
  };
  const delete_files = async () => {
  // Delete files from the collection
    const deleted_files = await start_file_deletion(selected_files);
    refresh_files();
    set_selected_files([]);
    deleted_files.forEach((deleted_file) => {
      log_message("Deleted file from collection: " + deleted_file)
    });
  }





  const toggle_selected_files = (item) => {
  // Toggling whether or not a file is selected
    if (selected_files.includes(item)){
      set_selected_files(selected_files.filter((selected) => selected !== item));
    } else {
      set_selected_files([...selected_files, item])
    }
  };
  const toggle_selected_uploads = (item) => {
  // Toggling whether or not an upload is selected
    if (selected_uploads.includes(item)){
      set_selected_uploads(selected_uploads.filter((selected) => selected !== item));
    } else {
      set_selected_uploads([...selected_uploads, item])
    }
  };


  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  // Components
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////



  // Log Messages Component
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



  // File List Component
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
        onClick={() => toggle_selected_files(file)}
        style = {{
          cursor: 'pointer',
          fontWeight: selected_files.includes(file) ? 'bold':'normal'
        }}
      >
        {file.name}
      </li>
    ));
  }

  // Uploads List Component
  let upload_list_content;
  if (uploads.length === 0){
    upload_list_content = <li>No files have been uploaded</li>;
  } else {
    upload_list_content = uploads.map((upload) => (
      <li
        key = {upload.hash}
        className = 'upload-item'
        data_name = {upload.name}
        data_hash = {upload.hash}
        data_word_count = {upload.word_count}
        onClick={() => toggle_selected_uploads(upload)}
        style = {{
          cursor: 'pointer',
          fontWeight: selected_uploads.includes(upload) ? 'bold':'normal'
        }}
      >
        {upload.name}
      </li>
    ));
  }

  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  // Start of HTML
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////

  return (
    <div className="container">
      {/* Banner */}
      {/* <div class="banner">
          Cloud RAG UI - Draft Only. Do Not Use.
      </div> */}
      {/* Hidden element - uploads window */}
      <input
        type="file"
        ref={upload_window}
        onChange={accept_uploads}
        style={{display: 'none'}}
        multiple />
      <div className="container">
          {/* Left Pane */}
          <div className="L1" id="L1S1">
              <div id="title">
                  Cloud RAG - dev version
              </div>
              <div id="version">v0.2</div>
              <div id="links"><br />
                  <a href="https://github.com/arunwidjaja/cloud-RAG" target="_blank">
                      <img className="icon" src="/github_light.svg" alt="Repo Link"/>
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
                      <button id='upload-btn' className="btn" onClick={() => upload_window.current.click()}>Upload Files</button>
                      <button id='deleteuploadsbtn'className="btn" onClick={delete_uploads}>Clear Selected Uploads</button>
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
                      <button className="btn" id="downloaddbbutton" onClick={download_files}>Download Selected Files from DB</button>
                      <button className="btn" id="deletedbbutton" onClick={delete_files}>Delete Selected Files from DB</button>
                  </div>
              </div>
          </div>
      </div>
      <script src="../static/UI.js"></script>
      <script src="../static/js"></script>
    </div>
  );
}

export default App;
