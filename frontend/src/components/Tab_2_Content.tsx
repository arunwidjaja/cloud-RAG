// Components
import { CustomDropdownMenu } from "./Dropdown_Menu"
import { FileTable } from "./Table_Files"
import { Settings2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

// Handlers
import { handle_choose_collection, handle_create_collection, handle_delete_collection } from "@/handlers/handlers_buttons"

// Hooks
import { use_collections } from "@/hooks/hooks_database"
import { Dialog } from "@radix-ui/react-dialog"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { useState } from "react"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { use_embeddings_store } from "@/hooks/hooks_misc"


export function Tab_2_Content() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [collectionName, setCollectionName] = useState('new_collection');
    const [selectedEmbedding, setSelectedEmbedding] = useState('');


    const confirm_creation = async (collection_name: string, embedding_function: string) => {
        try {
            await handle_create_collection(collection_name, embedding_function);
            setIsCreateDialogOpen(false)
        } catch (error) {
            setIsCreateDialogOpen(true);
            console.error('Failed to create collection', error);
        }
    };

    const confirm_deletion = async () => {
        try {
            await handle_delete_collection();
            setIsDeleteDialogOpen(false)
        } catch (error) {
            setIsDeleteDialogOpen(true);
            console.error('Failed to delete collection', error);
        }
    };


    return (
        <div id="contentdiv" className='h-full overflow-auto flex flex-col'>
            <div id='tab_header'>
                <p className='text-xl text-text'>Your Database</p>
                <p className='text-sm mt-1 mb-3 text-text'>Manage your Collections and files here. Create a new Collection to begin.</p>
            </div>
            <div className="flex items-center">
                <CustomDropdownMenu
                    useItemsHook={use_collections}
                    placeholder='Select a Collection...'
                    searchPlaceholder='Search Collections...'
                    emptyMessage='No Collections found.'
                    onChange={handle_choose_collection}
                    className='flex-1 mt-1' />
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Settings2 className="m-2 text-text"></Settings2>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => setIsCreateDialogOpen(true)}
                            className={`
                                text-text
                                cursor-pointer
                                focus:bg-primary_light                                
                            `}>
                            Create Collection
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className={`
                                text-text
                                cursor-pointer
                                focus:bg-warning
                            `}>
                            Delete Collection
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <FileTable></FileTable>

            {/* Dialog for creating a collection */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="bg-accent">
                    <DialogHeader>
                        <DialogTitle className="text-text">Create a Collection</DialogTitle>
                        <DialogDescription>
                            <p>Names cannot include spaces. Choose an embedding function for your collection and click save when you're done.</p>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right" />
                            <Input
                                id="name"
                                value={collectionName}
                                onChange={(e) => setCollectionName(e.target.value)}
                                className="col-span-4 bg-text text-text2"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right" />
                            <CustomDropdownMenu
                                useItemsHook={use_embeddings_store}
                                placeholder="Select an Embedding Function"
                                searchPlaceholder=""
                                emptyMessage="No Embedding Function Selected"
                                className="col-span-4"
                                onChange={setSelectedEmbedding}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            onClick={() => confirm_creation(collectionName, selectedEmbedding)}
                            className="bg-accent hover:bg-highlight hover:text-text2 text-text"
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Dialog for deleting a collection */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-accent">
                    <DialogHeader>
                        <DialogTitle className="text-text">Are you sure?</DialogTitle>
                        <DialogDescription>
                            <p>Deleting this Collection will also delete all documents and metadata inside it.</p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="submit"
                            variant="destructive"
                            onClick={confirm_deletion}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

