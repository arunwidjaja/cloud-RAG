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
import { DropdownMenuContext } from './Dropdown_Menu_Context';
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
import { use_retrieved_files } from '@/handlers/retrieved_handlers';
import { FileDisplay } from './FileDisplay';


export function Tabs_Data() {
    const selected_uploads = use_selected_uploads();
    // const retrieved = use_retrieved_files();
    const uploadRef = useRef(null);
    return (
        <Tabs defaultValue="data" className="w-[500px] flex flex-col h-full pb-2">
            <TabsList className="grid grid-cols-3 ml-4 mr-4">
                <TabsTrigger
                    value="data"
                >Retrieval</TabsTrigger>
                <TabsTrigger
                    value="files"
                >Database</TabsTrigger>
                <TabsTrigger
                    value="uploads"
                >Uploads</TabsTrigger>
            </TabsList>

            <TabsContent id="retrieval_tab_content" value="data" className='flex-1 rounded-lg p-4 mt-2 min-h-0 overflow-hidden'>
                <div id="contentdiv" className='h-full overflow-auto flex flex-col'>
                    <div id='tab_header'>
                        <p className='text-xl text-text'>Retrieved Documents</p>
                        <p className='text-sm mt-1 mb-3 text-text'>Once you submit a query, any relevant documents will be displayed here.</p>
                    </div>
                    <div className='flex'>
                        <DropdownMenuContext
                            useItemsHook={use_retrieved_files}
                            placeholder='Select document'
                            searchPlaceholder='Search retrieved documents...'
                            className='flex-1 mt-1'>
                        </DropdownMenuContext>
                    </div>
                    <FileDisplay></FileDisplay>
                </div>
            </TabsContent>

            <TabsContent value="files" className='flex-1 rounded-lg p-4 mt-2 min-h-0 overflow-hidden'>
                <div id="contentdiv" className='h-full overflow-auto flex flex-col'>
                    <div id='tab_header'>
                        <p className='text-xl text-text'>Your Database</p>
                        <p className='text-sm mt-1 mb-3 text-text'>Manage your Collections and files here. Create a new Collection to begin.</p>
                    </div>
                    <div className="flex">
                        <DropdownMenu
                            useItemsHook={use_collections}
                            placeholder='Select a Collection...'
                            searchPlaceholder='Search Collections...'
                            emptyMessage='No Collections found.'
                            onChange={handle_choose_collection}
                            className='flex-1 mt-1' />
                        <CollectionCreationButton />
                        <CollectionDeletionButton />
                    </div>
                    <FileTable></FileTable>
                </div>
            </TabsContent>

            <TabsContent value="uploads" className='flex-1 rounded-lg p-4 mt-2 min-h-0 overflow-hidden'>
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
                            <Button id="pushbtn" onClick={handle_push_uploads} className='w-full mt-4 mb-1'>
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
