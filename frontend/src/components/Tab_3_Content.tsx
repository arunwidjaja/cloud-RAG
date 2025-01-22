import { useRef, useState } from 'react';
import { RefObject } from 'react';

// Components
import { DropdownMenu } from "./Dropdown_Menu"
import { UploadTable } from "./Table_Upload"
import { Button } from "./ui/button"
import { FileUploadWindow } from "./FileUpload"
import { Upload } from 'lucide-react';
import Spinner from './Spinner';

// Handlers
import { handle_choose_collection } from "@/handlers/handlers_buttons"

// Hooks
import { use_collections } from '@/hooks/hooks_database';
import { use_current_collection } from '@/hooks/hooks_database';


export function Tab_3_Content() {
    const uploadRef = useRef(null);
    const current_collection = use_current_collection();
    const [isLoading] = useState(false);

    // Launches upload window
    const handle_accept_uploads = (uploadRef: RefObject<HTMLInputElement>): void => {
        if (current_collection) {
            if (uploadRef && uploadRef.current) {
                uploadRef.current.click();
            }
        }
        else {
            alert("Please select a collection to upload to.")
        }
    };


    return (
        <div id="contentdiv"
            className={`relative h-full overflow-auto flex flex-col ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            <FileUploadWindow ref={uploadRef} />
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
                <Button
                    className='w-full mt-4 mb-1 bg-text hover:bg-highlight'
                    onClick={() => handle_accept_uploads(uploadRef)}>
                    <Upload></Upload>
                </Button>
            </div>
        </div>
    )
}

