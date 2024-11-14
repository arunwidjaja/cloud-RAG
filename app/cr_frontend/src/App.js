import React, { useEffect, useState, useRef } from 'react';

// States
import useFilesStore from './stores/filesStore';
import useLogsStore from './stores/logsStore';
import useMessageStore from './stores/messageStore.js';

// API Calls
import {
  start_submit_query,
} from './api/api'

// Handlers
import { refresh_files, refresh_uploads } from './handlers/file_handlers';
import {
  handle_push_uploads,
  handle_remove_selected_uploads,
  handle_download_selected_files,
  handle_delete_selected_files
} from './handlers/button_handlers';
import {
  preset_analyze_sentiment,
  preset_analyze_themes,
  preset_summarize_selection
} from './handlers/preset_handlers';

// Components
import { FilesList, UploadsList } from './components/FileList';
import { Logs } from './components/Logs';
import { TextInput } from './components/TextInput.js';
import { ChatBubble } from './components/ChatBubble.js';

// Styling
import './App.css';


// Constants
const HREF_REPO = 'https://github.com/arunwidjaja/cloud-RAG'
const SRC_GITHUB_ICON = '/github_light.svg'

function App() {

  const { files, uploads, selected_files, selected_uploads} = useFilesStore();
  const { logs } = useLogsStore();
  const { messages } = useMessageStore();

  const upload_window = useRef(null);

  // Runs once on start
  useEffect(() => {
    refresh_files();
    refresh_uploads();
  }, []);


  // Dummy function for context download button to prevent error
  const download_files = () => {
    alert('dummy')
  }



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
          // // write_to_log("Uploaded File: " + uploaded_file)
        });
        upload_window.current.value = '';
      } catch (error) {
        console.error('Error uploading files:', error);
      }
    }
    refresh_uploads();
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
        style={{ display: 'none' }}
        multiple />
      <div className="container">
        {/* Left Pane */}
        <div className="L1" id="L1S1">
          <div id="title">
            Cloud RAG - dev version
          </div>
          <div id="version">v0.2</div>
          <div id="links"><br />
            <a href={HREF_REPO} target="_blank">
              <img className="icon" src={SRC_GITHUB_ICON} alt="Repo Link" />
            </a>
          </div>
          <div id="auth">
            (WIP) Auth/Collections
            {/* <button onClick = {() => // write_to_log("asdf")}>Test Button</button> */}
            {/* <button class="devtools" id="dev_create_input">Create input bubble</button>
                  <button class="devtools" id="dev_create_response">Create response bubble</button>
                  <button class="devtools" id="dev_create_context">Create context bubble</button> */}
          </div>
          <div id="shortcuts">
            <button className="shortcut_button" id="summarize" onClick={() => preset_summarize_selection(selected_files)}>Summarize Selected Documents</button>
            <button className="shortcut_button" id="highlights" onClick={() => preset_analyze_themes(selected_files)}>Retrieve Themes</button>
            <button className="shortcut_button" id="sentiment" onClick={() => preset_analyze_sentiment(selected_files)}>(WIP) Analyze Sentiment</button>
          </div>
          <div id="log">
            <Logs logs={logs}/>
          </div>
        </div>
        {/* Middle Pane */}
        <div className="L1" id="L1S2">
          <div id="conversation" className="output">
            {messages.map((msg, index) => (<ChatBubble key={index} message={msg} />))}
          </div>
          {/* {text_area_comp} */}
          <TextInput />
        </div>
        {/* Right Pane */}
        <div className="L1" id="L1S3">
          <div id="uploadssection">
            <div id="uploadstitle">
              Uploaded Files
            </div>
            <div className="filelist" id="uploadslist">
              <ul id="uploads-list-ul">
                <UploadsList uploads={uploads}/>
              </ul>
            </div>
            <button
              id="pushbtn" onClick={() => handle_push_uploads(uploads)}>Push All Uploads to DB</button>
            <div className="uploadsbuttons">
              <button id='upload-btn' className="btn" onClick={() => upload_window.current.click()}>Upload Files</button>
              <button id='deleteuploadsbtn' className="btn" onClick={() => handle_remove_selected_uploads(selected_uploads)}>Remove Selected Uploads</button>
            </div>
          </div>
          <div id="databasesection">
            <div id="databasetitle">
              Database Files
            </div>
            <div className="filelist" id="databaselist">
              <ul id="file-list-ul">
                <FilesList files={files}/>
              </ul>
            </div>
            <div className="databasebuttons">
              <button className="btn" id="downloaddbbutton" onClick={() => handle_download_selected_files(selected_files)}>Download Selected Files from DB</button>
              <button className="btn" id="deletedbbutton" onClick={() => handle_delete_selected_files(selected_files)}>Delete Selected Files from DB</button>
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