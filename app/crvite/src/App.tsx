import { useEffect } from 'react';

import { ThemeSwitch } from './components/ThemeSwitch';
import { ThemeProvider } from './contexts/ThemeContext';

// States

import useLogsStore from './stores/logsStore';
import useMessageStore from './stores/messageStore';
import useCollectionsStore from './stores/collectionsStore'

// Handlers
import { refresh_files, refresh_uploads } from './handlers/file_handlers';
import { refresh_collections } from './handlers/collection_handlers';
import {
  handle_select_preset, handle_run_preset
} from './handlers/preset_handlers';
import { use_presets } from './handlers/preset_handlers';


// Components
import { Tabs_Data } from './components/Tabs_Data';

import { Logs } from './components/Logs';
import { TextInput } from './components/TextInput';
import { ChatBubble } from './components/ChatBubble';
import { DropdownMenu } from './components/Dropdown_Menu';


import { VerticalDivider, HorizontalLine } from './components/Dividers';

// Styling
import './App.css';

// Constants
import { HREF_REPO, SRC_GITHUB_ICON } from './constants/constants';

import { Message } from './types/types';
import { Button } from './components/ui/button';



function App() {

  const { logs } = useLogsStore();
  const { messages } = useMessageStore();
  const { current_collection } = useCollectionsStore();

  // Refresh files and uploads on start
  useEffect(() => {
    refresh_collections();
    refresh_files(current_collection);
    refresh_uploads();
  }, []);

  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////
  // Start of HTML
  //////////////////////////////////
  //////////////////////////////////
  //////////////////////////////////

  return (
    <ThemeProvider>
    <div className="container_parent max-w-full">

      {/* Title Bar */}

      <header className="flex flex-col w-full bg-primary pl-3 pt-3 mb-0">
        <div className="flex font-bold items-center pb-3">
          <div className="text-2xl font-bold mr-8 text-text">Cloud RAG<sub className='text-text'>0.3x</sub>
          </div>
          <nav className='flex gap-4'>
            <a href={HREF_REPO} target='_blank'>
              <img className="icon" src={SRC_GITHUB_ICON} alt="Repo Link" />
            </a>
            <ThemeSwitch></ThemeSwitch>
          </nav>
        </div>
      </header>

      <div className="container max-w-full p-0 bg-gradient-to-t from-secondary to-primary to-50%">

        {/* Left Pane */}

        <div className="L1 text-center bg-secondary" id="L1S1">
          <div id="auth" className='flex flex-1 flex-col'>
            Testing Area
          </div>

          <HorizontalLine></HorizontalLine>

          <div id="shortcuts" className="flex flex-1 flex-col">
            <DropdownMenu
              useItemsHook={use_presets}
              placeholder='Select Preset'
              searchPlaceholder='Search preset analyses'
              emptyMessage='No preset sellected'
              className='flex ml-2 mt-2'
              onChange={handle_select_preset} />
            <Button
              className='flex ml-2 mt-2'
              onClick={handle_run_preset}
            >Run Selected Preset</Button>
          </div>

          <HorizontalLine></HorizontalLine>

          <div id="log" className='flex flex-1 flex-col text-left p-1'>
            <Logs logs={logs} />
          </div>
        </div>


        <VerticalDivider></VerticalDivider>

        {/* Middle Pane */}

        <div className="L1 flex-1">
          <div
            id="conversation"
            className="bg-none output pl-1 pr-1 pt-2 overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {messages.map((msg: Message, index: number) => (<ChatBubble key={index} message={msg} />))}
          </div>
          <div className='mt-2'>
            <TextInput/>
          </div>
        </div>


        {/* <VerticalDivider></VerticalDivider> */}

        {/* Right Pane */}
        <div className='pr-3 pt-3'>
          <Tabs_Data></Tabs_Data>
        </div>
      </div>
      <script src="../static/UI.js"></script>
      <script src="../static/js"></script>
    </div>
    </ThemeProvider>
  );
}

export default App;
