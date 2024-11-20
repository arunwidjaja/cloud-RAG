import { useRef } from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { FileTable } from "./Table_Files"
import { UploadTable } from './Table_Uploads';
import { SimpleTooltip } from "./SimpleTooltip"

import { DropdownMenu } from "./Dropdown_Menu"
import { CollectionCreationButton } from "./CollectionCreationButton"
import { CollectionDeletionButton } from "./CollectionDeletionButton"

import {
    handle_push_uploads,
    handle_choose_collection,
    handle_accept_uploads,
    handle_remove_selected_uploads

} from '@/handlers/button_handlers';

import { FileUploadWindow } from '@/components/FileUpload';


import { Button } from "@/components/ui/button"
import { use_selected_uploads } from '@/handlers/file_handlers';
import { use_collections } from '@/handlers/collection_handlers';
import { handle_select_retrieved, use_retrieved_files } from '@/handlers/retrieved_handlers';


export function Tabs_Data() {
    const selected_uploads = use_selected_uploads();
    // const retrieved = use_retrieved_files();
    const uploadRef = useRef(null);
    return (
        <Tabs defaultValue="files" className="w-[400px] flex flex-col h-full pb-2">
            <TabsList className="grid w-full grid-cols-3 bg-[#18181B]">
                <TabsTrigger
                    value="data"
                    className="
                        data-[state=active]:bg-black
                        data-[state=active]:text-white
                        data-[state=inactive]:bg-[#18181B]
                        mr-1"
                >Data</TabsTrigger>
                <TabsTrigger
                    value="files"
                    className="
                        data-[state=active]:bg-black
                        data-[state=active]:text-white
                        data-[state=inactive]:bg-[#18181B]
                        mr-1"
                >Database</TabsTrigger>
                <TabsTrigger
                    value="uploads"
                    className="
                        data-[state=active]:bg-black
                        data-[state=active]:text-white
                        data-[state=inactive]:bg-[#18181B]
                        ml-1"
                >Uploads</TabsTrigger>
            </TabsList>

            <TabsContent value="data" className=' flex-1 border border-slate-400 rounded-lg p-4 mt-2'>
                <p className='text-xl'>Dummy Content Here</p>
                <p className='text-sm mt-1 mb-3'>This section will display retrieved documents when the users submits a query</p>
                <div className='border border-white'>
                    Preview of Retrieved Files
                </div>
                <div className='border border-white'>
                    <DropdownMenu
                        useItemsHook={() => {
                            const retrieved = use_retrieved_files();
                            return retrieved.map(file => file.source);}}
                        onChange={handle_select_retrieved}>
                    </DropdownMenu>
                </div>
            </TabsContent>

            <TabsContent value="files" className=' flex-1 border border-slate-400 rounded-lg p-4 mt-2'>
                <p className='text-xl'>Your Database</p>
                <p className='text-sm mt-1 mb-3'>Manage your Collections and files here. Create a new Collection to begin.</p>
                <div className="flex">
                    <DropdownMenu
                        useItemsHook={use_collections}
                        placeholder='Select a Collection...'
                        searchPlaceholder='Search Collections...'
                        emptyMessage='No Collections found.'
                        onChange={handle_choose_collection}
                        className='flex-1 mt-1 border-gray-800' />
                    <CollectionCreationButton />
                    <CollectionDeletionButton />
                </div>
                <FileTable></FileTable>
            </TabsContent>

            <TabsContent value="uploads" className=' flex-1 border border-slate-400 rounded-lg p-4 mt-2'>
                <div className='flex flex-col h-full'>
                    <div className='text-xl'>Uploads</div>
                    <div className='text-sm mt-1 mb-3'>Upload files here to add them to your Collection</div>
                    <div className="flex">
                        <DropdownMenu
                            useItemsHook={use_collections}
                            placeholder='Select a Collection...'
                            searchPlaceholder='Search Collections...'
                            emptyMessage='No Collections found.'
                            onChange={handle_choose_collection}
                            className='flex-1 mt-1 border-gray-800' />
                    </div>
                    <UploadTable></UploadTable>
                    <div className='mt-auto'>
                    <SimpleTooltip content="Pushes all uploads to the current Collection">
                        <Button id="pushbtn" onClick={handle_push_uploads} className='w-full mt-4 mb-2'>
                            Push
                        </Button>
                    </SimpleTooltip>
                    <div className='grid grid-cols-2'>
                        <FileUploadWindow ref={uploadRef} />
                        <Button className="mr-1" onClick={() => handle_accept_uploads(uploadRef)}>Upload Files</Button>
                        <Button className="ml-1" onClick={() => handle_remove_selected_uploads(selected_uploads)}>Remove Uploads</Button>
                    </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    )
}
