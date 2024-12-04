// import { LoremIpsum } from 'lorem-ipsum';
import { useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

// Handlers
import { refresh_files, refresh_uploads } from '@/handlers/file_handlers';
import { refresh_collections } from '@/handlers/collection_handlers';
import { handle_select_preset, handle_run_preset } from '@/handlers/preset_handlers';
import { refresh_chats } from '@/handlers/chats_handlers';

// Components
import { Tabs_Section } from '@/components/Tabs_Section';
import { Logs } from '@/components/Logs';
import { TextInput } from '@/components/TextInput';
import { DropdownMenu } from '@/components/Dropdown_Menu';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Conversation } from '@/components/Conversation';
import { ChatHistory } from '@/components/ChatHistory';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

// Styling
import '@/App.css';

// Hooks
import { use_presets } from '@/hooks/hooks';

function MainApp() {
    const { user, logout } = useAuth();
    // const lorem = new LoremIpsum();
    // const filler_text = lorem.generateWords(600);

    // Sets the initial state of state variables on start
    useEffect(() => {
        refresh_collections();
        refresh_files();
        refresh_uploads();
        refresh_chats();
    }, []);

    return (
        <ThemeProvider>
            <div className="container_parent max-w-full max-h-full flex flex-row">
                {/* Left Pane */}
                <div className='min-h-full max-h-full w-64 flex flex-col bg-accent'>
                    <div id="fillerdiv" className="h-14"></div>
                    {/* Chat History Section */}
                    <div className='ml-4 font-bold text-text'>Recent Chats</div>
                    <ChatHistory></ChatHistory>
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
                    <Logs></Logs>
                    <ThemeSwitcher></ThemeSwitcher>
                </div>

                {/* Title Bar + Main Content */}
                <div className='flex flex-col flex-1'>
                    {/* Title Bar */}
                    <header className="w-full bg-primary pl-3 pt-3 mb-0 flex flex-row h-20">
                        {/* App Title */}
                        <div className="flex flex-1 flex-row font-bold items-center">
                            <div className="text-2xl font-bold text-text">
                                Cloud RAG<sub className='text-text text-s font-mono'>0.4.1</sub>
                            </div>
                            {/* <nav className='flex gap-4'>
                <a href={HREF_REPO} target='_blank'>
                  <img className="icon" src={SRC_GITHUB_ICON} alt="Repo Link" />
                </a>
              </nav> */}
                            {/* Profile Badge */}
                            <div className='justify-end flex flex-1 items-center mr-6'>
                                <div className='flex flex-row text-text items-center'>
                                    <Button
                                        onClick={logout}>
                                        Log Out
                                    </Button>
                                    <div className='p-2'>
                                        {user?.email}
                                    </div>
                                    <div>
                                        <Avatar>
                                            <AvatarImage src="" />
                                            <AvatarFallback className='bg-secondary'>{user?.email.substring(0, 2)}</AvatarFallback>
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
                            <Conversation></Conversation>
                            <TextInput></TextInput>
                        </div>
                        {/* Right Pane */}
                        <div className='p-2'>
                            <Tabs_Section></Tabs_Section>
                        </div>
                    </div>
                    <script src="../static/UI.js"></script>
                    <script src="../static/js"></script>
                </div>
            </div>
        </ThemeProvider>
    );
}

export default MainApp;