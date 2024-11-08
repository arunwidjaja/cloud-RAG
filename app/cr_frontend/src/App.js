import React, { useEffect, useState, useRef } from 'react';

import {
  fetch_db_files_metadata,
  fetch_uploads_metadata,
  start_push_to_DB,
  start_upload_deletion,
  start_file_deletion,
  start_file_download,
  start_submit_query,
  start_summarization,
  start_theme_analysis
} from './api/api'

import './App.css';



function App() {
  const [log_messages, set_log_messages] = useState([]);

  const [user_input, set_user_input] = useState("");
  const [messages, set_messages] = useState([]);

  const [files, set_files] = useState([]);
  const [uploads, set_uploads] = useState([]);
  const [selected_files, set_selected_files] = useState([]);
  const [selected_uploads, set_selected_uploads] = useState([]);

  const text_area = useRef(null);
  const upload_window = useRef(null);

  // Runs once on start
  useEffect(() => {
    refresh_files();
    refresh_uploads();
  }, []);

  // Text field behavior
  const adjust_text_area = (e) => {
    set_user_input(e.target.value);
    text_area.current.style.height = "auto";
    const new_height = Math.min(text_area.current.scrollHeight, 200);
    text_area.current.style.height = `${new_height}px`;
  }
  const handle_key_down = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send_user_input();
    }
  }
  const send_user_input = async () => {
    if (user_input.trim()) {
      add_bubble(user_input, 'INPUT');
      set_user_input('')

      const ai_reply = await start_submit_query(user_input);
      const ai_reply_text = ai_reply.message;
      const ai_reply_context = ai_reply.contexts;
      const ai_reply_id = ai_reply.id;
      add_bubble(ai_reply_text, 'OUTPUT');

      for (let i = 0; i < ai_reply_context.length; i++) {
        const context = ai_reply_context[i];
        add_bubble(context, 'CONTEXT');
      }
    }
  };

  const preset_summarize_selection = async () => {
    const summarized_files = selected_files
    if (summarized_files.length === 0) {
      write_to_log("Please select files to summarize first.")
    } else {
      write_to_log("Summarizing files...")

      set_selected_files([]);

      const summary = await start_summarization(selected_files);

      add_bubble(summary, "OUTPUT")

      write_to_log("Files summarized: ")
      summarized_files.forEach(file => {
        write_to_log(file.name)
      });
    }
  };
  const preset_analyze_themes = async () => {
    const analyzed_files = selected_files
    if (analyzed_files.length === 0) {
      write_to_log("Please select files to analyze first.")
    } else {
      write_to_log("Analyzing themes...")

      set_selected_files([]);

      const theme_analysis = await start_theme_analysis(selected_files);
      const theme_analysis_text = theme_analysis.message;
      const theme_analysis_context = theme_analysis.contexts;
      const theme_analysis_id = theme_analysis.id;

      add_bubble(theme_analysis_text, 'OUTPUT');
      for (let i = 0; i < theme_analysis_context.length; i++) {
        const context = theme_analysis_context[i];
        add_bubble(context, 'CONTEXT');
      }

      write_to_log("Files analyzed: ")
      analyzed_files.forEach(file => {
        write_to_log(file.name)
      });
    }
  };
  const preset_analyze_sentiment = async (file_hashes) => {
    write_to_log("Sentiment Analysis is not available yet")
  };








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
          write_to_log("Uploaded File: " + uploaded_file)
        });
        upload_window.current.value = '';
      } catch (error) {
        console.error('Error uploading files:', error);
      }
    }
    refresh_uploads();
  }







  const write_to_log = (log_message) => {
    set_log_messages((prev_messages) => [...prev_messages, { text: log_message }]);
  };

  const add_bubble = (bubble_content, bubble_type) => {
    let message_type;
    switch (bubble_type.toUpperCase()) {
      case "INPUT":
        message_type = "conversation_input";
        set_messages((prev_messages) => [...prev_messages, { text: bubble_content, type: message_type }]);
        break;
      case "OUTPUT":
        message_type = "conversation_output";
        set_messages((prev_messages) => [...prev_messages, { text: bubble_content, type: message_type }]);
        break;
      case "CONTEXT":
        message_type = "conversation_output";
        const context_source = bubble_content.source;
        const context_text = bubble_content.context;
        const context_hash = bubble_content.source;
        const context_full_text = "Source: " + context_source + "\n\n" + context_text;
        set_messages((prev_messages) => [...prev_messages, { text: context_full_text, type: message_type }]);
        break;
    }
  }

  const refresh_files = async () => {
    const fetched_files = await fetch_db_files_metadata();
    set_files(fetched_files)
  };
  const refresh_uploads = async () => {
    const fetched_uploads = await fetch_uploads_metadata();
    set_uploads(fetched_uploads)
  };


  const push_uploads = async () => {
    // Pushing the uploads to the database
    const pushed_uploads = await start_push_to_DB(uploads);
    refresh_files();
    refresh_uploads();
    set_selected_uploads([]);
    pushed_uploads.forEach((pushed_upload) => {
      write_to_log("Pushed upload: " + pushed_upload)
    });
  };

  const download_files = async () => {
    // Download files from the collection
    const downloaded_files = await start_file_download(selected_files);
    set_selected_files([]);
    downloaded_files.forEach((downloaded_file) => {
      write_to_log("Downloaded file: " + downloaded_file)
    });
  };
  const delete_uploads = async () => {
    // Delete the selected uploads from the uploads folder
    const deleted_uploads = await start_upload_deletion(selected_uploads);
    refresh_uploads();
    set_selected_uploads([]);
    deleted_uploads.forEach((deleted_upload) => {
      write_to_log("Removed upload: " + deleted_upload)
    });
  };
  const delete_files = async () => {
    // Delete files from the collection
    const deleted_files = await start_file_deletion(selected_files);
    refresh_files();
    set_selected_files([]);
    deleted_files.forEach((deleted_file) => {
      write_to_log("Deleted file from collection: " + deleted_file)
    });
  }

  const toggle_selected_files = (item) => {
    // Toggling whether or not a file is selected
    if (selected_files.includes(item)) {
      set_selected_files(selected_files.filter((selected) => selected !== item));
    } else {
      set_selected_files([...selected_files, item])
    }
  };
  const toggle_selected_uploads = (item) => {
    // Toggling whether or not an upload is selected
    if (selected_uploads.includes(item)) {
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


  let ChatBubble;
  ChatBubble = ({ message }) => {
    return (
      <div className={`${message.type}`} style={{ whiteSpace: 'pre-wrap' }}>
        {message.text}
      </div>
    )
  };

  let LogEntry;
  LogEntry = ({ log_entry }) => {
    return (
      <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
        {log_entry.text}
      </div>
    )
  };

  let FileListItem;
  FileListItem = ({ file }) => {
    return (
      <li
        className='file-item'
        data_name={file.name}
        data_hash={file.hash}
        data_word_count={file.word_count}
        onClick={() => toggle_selected_files(file)}
        style={{
          cursor: 'pointer',
          fontWeight: selected_files.includes(file) ? 'bold' : 'normal'
        }}
      >
        {file.name}
      </li>
    )
  };

  let UploadListItem;
  UploadListItem = ({ upload }) => {
    return (
      <li
        className='upload-item'
        data_name={upload.name}
        data_hash={upload.hash}
        data_word_count={upload.word_count}
        onClick={() => toggle_selected_uploads(upload)}
        style={{
          cursor: 'pointer',
          fontWeight: selected_uploads.includes(upload) ? 'bold' : 'normal'
        }}
      >
        {upload.name}
      </li>
    )
  };

  // User Input Component
  let text_area_comp;
  text_area_comp = <textarea
    id='userinput'
    ref={text_area}
    value={user_input}
    onChange={adjust_text_area}
    placeholder={'placeholder text'}
    onKeyDown={handle_key_down}
  />

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
            <a href="https://github.com/arunwidjaja/cloud-RAG" target="_blank">
              <img className="icon" src="/github_light.svg" alt="Repo Link" />
            </a>
          </div>
          <div id="auth">
            (WIP) Auth/Collections
            {/* <button class="devtools" id="dev_create_input">Create input bubble</button>
                  <button class="devtools" id="dev_create_response">Create response bubble</button>
                  <button class="devtools" id="dev_create_context">Create context bubble</button> */}
          </div>
          <div id="shortcuts">
            <button className="shortcut_button" id="summarize" onClick={preset_summarize_selection}>Summarize Selected Documents</button>
            <button className="shortcut_button" id="highlights" onClick={preset_analyze_themes}>Retrieve Themes</button>
            <button className="shortcut_button" id="sentiment" onClick={preset_analyze_sentiment}>(WIP) Analyze Sentiment</button>
          </div>
          <div id="log">
            {log_messages.map((msg, index) => (<LogEntry key={index} log_entry={msg} />))}
          </div>
        </div>
        {/* Middle Pane */}
        <div className="L1" id="L1S2">
          <div id="conversation" className="output">
            {messages.map((msg, index) => (<ChatBubble key={index} message={msg} />))}
          </div>
          {text_area_comp}
        </div>
        {/* Right Pane */}
        <div className="L1" id="L1S3">
          <div id="uploadssection">
            <div id="uploadstitle">
              Uploaded Files
            </div>
            <div className="filelist" id="uploadslist">
              <ul id="uploads-list-ul">
                {uploads.map((upload, index) => (<UploadListItem key={index} upload={upload} />))}
              </ul>
            </div>
            <button
              id="pushbtn" onClick={push_uploads}>Push Uploads to DB</button>
            <div className="uploadsbuttons">
              <button id='upload-btn' className="btn" onClick={() => upload_window.current.click()}>Upload Files</button>
              <button id='deleteuploadsbtn' className="btn" onClick={delete_uploads}>Remove Selected Uploads</button>
            </div>
          </div>
          <div id="databasesection">
            <div id="databasetitle">
              Database Files
            </div>
            <div className="filelist" id="databaselist">
              <ul id="file-list-ul">
                {files.map((file, index) => (<FileListItem key={index} file={file} />))}
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