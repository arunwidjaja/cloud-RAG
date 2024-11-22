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


import { ChatHistory } from './components/ChatHistory';

// Styling
import './App.css';

// Constants
import { HREF_REPO, ICON_GITHUB } from './constants/constants';

import { Message } from './types/types';
import { Button } from './components/ui/button';

import { LoremIpsum } from 'lorem-ipsum';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"




function App() {
  const lorem = new LoremIpsum();
  const filler_text = lorem.generateWords(600);

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
      <div className="container_parent max-w-full max-h-full flex flex-row">
        {/* Left Pane */}
        <div className='min-h-full max-h-full w-64 flex flex-col bg-accent'>
          <div id="fillerdiv" className="h-14"></div>
          {/* Chat History Section */}
          <div className='ml-4 font-bold text-text'>Recent Chats</div>
          <div id="chathistory" className="flex-1 min-h-0 w-full mb-2">
            {/* Chat History */}
            <div className='h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
              <ChatHistory></ChatHistory>
              {/* {filler_text} */}
            </div>


          </div>
          {/* Presets and LLM settings */}
          <div id="llmpanel" className='p-2'>
            {/* Presets section */}
            <div id="presets" className="flex flex-1 flex-col">
              <DropdownMenu
                useItemsHook={use_presets}
                placeholder='Select Preset'
                searchPlaceholder='Search preset analyses'
                emptyMessage='No preset sellected'
                className='flex'
                onChange={handle_select_preset} />
              <Button
                className='flex mt-2'
                onClick={handle_run_preset}
              >Run Selected Preset</Button>
            </div>
          </div>

          <div className='flex flex-1 flex-col text-left p-1 bg-text m-2 rounded-sm'>
            <Logs logs={logs} />
          </div>

          <ThemeSwitch></ThemeSwitch>

        </div>

        {/* Title Bar + Main Content */}
        <div className='flex flex-col flex-1'>
          {/* Title Bar */}
          <header className="w-full bg-primary pl-3 pt-3 mb-0 flex flex-row h-20">
            {/* App Title */}
            <div className="flex flex-1 flex-row font-bold items-center">
              <div className="text-2xl font-bold text-text">
                Cloud RAG<sub className='text-text'>0.4</sub>
              </div>
              {/* <nav className='flex gap-4'>
                <a href={HREF_REPO} target='_blank'>
                  <img className="icon" src={SRC_GITHUB_ICON} alt="Repo Link" />
                </a>
              </nav> */}
              {/* Profile Badge */}
              <div className='justify-end flex flex-1 items-center mr-6'>
                <div className='flex flex-row text-text items-center'>
                  <div className='p-2'>awidjaja</div>
                  <div>
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback className='bg-secondary'>AW</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="container flex flex-row max-w-full p-0 bg-gradient-to-t from-secondary to-primary to-50%">
            {/* Conversation Pane */}
            <div id="conversationarea" className="flex flex-col flex-1 p-3">
              {/* Gradient for overflow */}
              <div className="relative">
                <div className="max-h-24 overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-transparent to-primary from-0 to-80%"></div>
                </div>
              </div>
              {/* Conversation */}
              <div
                id="conversation"
                className="flex flex-1 flex-col-reverse text-text bg-none output p-2 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full">

                {messages.map((msg: Message, index: number) => (<ChatBubble key={index} message={msg} />))}
              </div>
              {/* User Input Field */}
              <div className='mt-2 flex flex-row justify-center'>
                <TextInput />
              </div>
            </div>


            {/* <VerticalDivider></VerticalDivider> */}

            {/* Right Pane */}
            <div className='p-2'>
              <Tabs_Data></Tabs_Data>
            </div>
          </div>
          <script src="../static/UI.js"></script>
          <script src="../static/js"></script>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
