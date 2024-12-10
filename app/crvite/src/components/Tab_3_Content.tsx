import { useRef } from 'react';

import { DropdownMenu } from "./Dropdown_Menu"
import { UploadTable } from "./UploadTable"
import { SimpleTooltip } from "./SimpleTooltip"
import { Button } from "./ui/button"
import { FileUploadWindow } from "./FileUpload"

import { handle_push_uploads, handle_choose_collection, handle_accept_uploads, handle_remove_selected_uploads } from "@/handlers/button_handlers"

import { use_collections, use_selected_uploads } from "@/hooks/hooks"


export function Tab_3_Content() {
    const uploadRef = useRef(null);
    const selected_uploads = use_selected_uploads();
    return (
        <div id="contentdiv" className='h-full overflow-auto flex flex-col'>
            <div id='tab_header'>
                <div className='text-xl text-text'>Uploads</div>
                <div className='text-sm mt-1 mb-3 text-text'>Upload files here. Select a collection to push your files to. For best performance, keep thematically distinct files in different collections.</div>
            </div>
            <div className="flex">
                <DropdownMenu
                    useItemsHook={use_collections}
                    placeholder='Select a Collection...'
                    searchPlaceholder='Search Collections...'
                    emptyMessage='No Collections found.'
                    onChange={handle_choose_collection}
                    className='flex-1 mt-1' />
            </div>
            <UploadTable></UploadTable>
            <div className='mt-auto'>
                <SimpleTooltip content="Pushes all uploads to the current Collection">
                    <Button id="pushbtn"
                    onClick={handle_push_uploads}
                    className='w-full mt-4 mb-1 bg-accent text-text hover:bg-highlight hover:text-text2'>
                        Push
                    </Button>
                </SimpleTooltip>
                <div className='grid grid-cols-2'>
                    <FileUploadWindow ref={uploadRef} />
                    <Button className="mr-1 bg-accent text-text hover:bg-highlight hover:text-text2" onClick={() => handle_accept_uploads(uploadRef)}>Upload Files</Button>
                    <Button className="ml-1 bg-accent text-text hover:bg-highlight hover:text-text2" onClick={() => handle_remove_selected_uploads(selected_uploads)}>Remove Uploads</Button>
                </div>
            </div>
        </div>
    )
}

