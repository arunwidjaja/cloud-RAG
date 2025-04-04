import { useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

// Handlers
import { refresh_files, refresh_uploads } from '@/handlers/handlers_files';
import { refresh_collections } from '@/handlers/handlers_collections';
import { handle_select_preset, handle_run_preset } from '@/handlers/handlers_presets';
import { refresh_chats } from '@/handlers/handlers_chats';

// Components
import { TabsPanel } from '@/components/TabsPanel';
import { Logs } from '@/components/Logs';
import { CustomDropdownMenu } from '@/components/Dropdown_Menu';
import { ChatHistory } from '@/components/ChatHistory';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ProfileBadge } from '@/components/ProfileBadge';
import { ConversationPanel } from '@/components/ConversationPanel';

import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

// Hooks
import { use_presets } from '@/hooks/hooks_misc';
import { start_session } from '@/api/api_init';

// Constants
import { LOGO_PLACEHOLDER } from '@/constants/constants';

// Styling
import '@/App.css';

function MainApp() {
    const { user, isAuthenticated } = useAuth();
    // const lorem = new LoremIpsum();
    // const filler_text = lorem.generateWords(600);

    // Sets the initial state of state variables on start
    useEffect(() => {
        if (isAuthenticated && user) {
            async function initialize(): Promise<void> {
                try {
                    await start_session();
                    await refresh_collections();
                    await Promise.all([
                        refresh_files(),
                        refresh_uploads(),
                        refresh_chats()
                    ]);
                } catch (error) {
                    console.error('Initialization error: ', error);
                }
            }
            initialize();
        }

    }, [isAuthenticated, user]);

    return (
        <ThemeProvider>
            <div className="container_parent flex flex-row absolute max-w-full max-h-full overflow-hidden">
                {/* Left Pane */}
                <div className='min-h-full max-h-full w-64 flex flex-col bg-accent'>
                    <div id="fillerdiv" className="h-14"></div>
                    {/* Chat History Section */}
                    <ChatHistory></ChatHistory>
                    {/* Presets and LLM settings */}
                    <div id="llmpanel" className='p-2'>
                        {/* Presets section */}
                        <div id="presets" className="flex flex-1 flex-col">
                            <CustomDropdownMenu
                                useItemsHook={use_presets}
                                placeholder='Select Preset'
                                searchPlaceholder='Search preset analyses'
                                emptyMessage='No preset sellected'
                                className='flex'
                                onChange={handle_select_preset} />
                            <Button
                                className='flex mt-2 hover:bg-highlight hover:text-text2 text-text'
                                onClick={handle_run_preset}>
                                Run Selected Preset
                            </Button>
                        </div>
                    </div>
                    <Logs></Logs>
                    <ThemeSwitcher></ThemeSwitcher>
                </div>

                {/* Title Bar + Main Content */}
                <div className='flex flex-col flex-1'>
                    {/* Title Bar */}
                    <header
                        className={`
                            flex flex-row h-20 w-full
                            pl-3 pt-3 mb-0
                            bg-primary
                        `}>
                        {/* App Title */}
                        <div className="flex flex-1 flex-row font-bold items-center">
                            <img src={LOGO_PLACEHOLDER} className='w-10 h-10 m-4'></img>
                            <div className="text-2xl font-bold text-text">
                                Cloud RAG<sub className='text-text text-s font-mono'>0.6</sub>
                            </div>
                            <ProfileBadge></ProfileBadge>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div
                        className={`
                            container flex flex-row max-w-full
                            p-0
                            bg-gradient-to-t from-secondary to-primary to-50%
                        `}>
                        <ConversationPanel></ConversationPanel>
                        <TabsPanel></TabsPanel>
                        <Toaster></Toaster>
                    </div>
                    <script src="../static/UI.js"></script>
                    <script src="../static/js"></script>
                </div>
            </div>
        </ThemeProvider>
    );
}

export default MainApp;