import { useRef, useState } from 'react';

// Components
import { DropdownMenu } from "./Dropdown_Menu"
import { UploadTable } from "./Table_Upload"
import { SimpleTooltip } from "./SimpleTooltip"
import { Button } from "./ui/button"
import { FileUploadWindow } from "./FileUpload"

// Handlers
import { handle_push_uploads, handle_choose_collection, handle_accept_uploads, handle_remove_selected_uploads } from "@/handlers/button_handlers"

// Hooks
import { use_collections, use_selected_uploads } from "@/hooks/hooks"
import Spinner from './Spinner';
import { Upload } from 'lucide-react';




export function Tab_3_Content() {
    const uploadRef = useRef(null);
    const selected_uploads = use_selected_uploads();
    const [isLoading, setIsLoading] = useState(false);

    const handle_click_push_uploads = async () => {
        setIsLoading(true);
        try {
            await handle_push_uploads();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="contentdiv"
            className={`relative h-full overflow-auto flex flex-col ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>

            {/* Loading Spinner Element */}
            {isLoading && <div className='absolute top-1/3 left-1/2'><Spinner></Spinner></div>}

            {/* Main Content */}
            <div id='tab_header'>
                <div
                    className='text-xl text-text'>
                    Uploads
                </div>
                <div
                    className='text-sm mt-1 mb-3 text-text'>
                    Upload files here. Select a collection to push your files to. For best performance, keep thematically distinct files in different collections.
                </div>
            </div>
            <div id="upload_dropdown_menu"
                className="flex">
                <DropdownMenu
                    useItemsHook={use_collections}
                    placeholder='Select a Collection...'
                    searchPlaceholder='Search Collections...'
                    emptyMessage='No Collections found.'
                    onChange={handle_choose_collection}
                    className='flex-1 mt-1' />
            </div>
            <UploadTable></UploadTable>
            <div id="upload_buttons" className='mt-auto'>
                <FileUploadWindow ref={uploadRef} />
                <Button
                    className='w-full mt-4 mb-1 bg-text hover:bg-highlight'
                    onClick={() => handle_accept_uploads(uploadRef)}>
                    <Upload></Upload>
                </Button>

                <div className='grid grid-cols-2'>
                    <SimpleTooltip content="Pushes all uploads to the current Collection">
                        <Button id="pushbtn"
                            onClick={handle_click_push_uploads}
                            className="mr-1 bg-accent text-text hover:bg-highlight hover:text-text2">
                            Push
                        </Button>
                    </SimpleTooltip>
                    <Button
                        className="ml-1 bg-accent text-text hover:bg-highlight hover:text-text2"
                        onClick={() => handle_remove_selected_uploads(selected_uploads)}>
                        Remove Uploads
                    </Button>
                </div>
            </div>
        </div>
    )
}

