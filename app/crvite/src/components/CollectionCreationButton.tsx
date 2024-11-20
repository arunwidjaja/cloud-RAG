import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
  import { Button } from "./ui/button"
  import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
  import { Label } from "./ui/label"
  import { Input } from "./ui/input"
  import { useState } from 'react';
  import { handle_create_collection } from '@/handlers/button_handlers';
  import { DropdownMenu } from "./Dropdown_Menu"
import { use_embeddings_store } from "@/handlers/embeddings_handlers"
  
  export function CollectionCreationButton() {
    const [collectionName, setCollectionName] = useState('New Collection');
    const [selectedEmbedding, setSelectedEmbedding] = useState('');
    const [open, setOpen] = useState(false);
  
    const handle_submit = async (collection_name: string, embedding_function: string) => {
      try {
        await handle_create_collection(collection_name, embedding_function);
        setOpen(false)
      } catch (error) {
        setOpen(true);
        console.error('Failed to create collection', error);
      }
    };
  
    return (
      <TooltipProvider>
        <Dialog open={open} onOpenChange={setOpen}>
          <Tooltip>
            <DialogTrigger asChild>
              <TooltipTrigger asChild>
                <Button className="ml-1 mt-1">+</Button>
              </TooltipTrigger>
            </DialogTrigger>
            <TooltipContent>
              <p className="text-black">Create a new Collection</p>
            </TooltipContent>
          </Tooltip>
          <DialogContent className="bg-gray-600">
            <DialogHeader>
            <DialogTitle className="text-black">Create a Collection</DialogTitle>
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
                  className="col-span-4 bg-[#18181B]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right" />
                <DropdownMenu
                  useItemsHook={use_embeddings_store}
                  placeholder="Select an Embedding Function"
                  searchPlaceholder=""
                  emptyMessage="No Embedding Function Selected"
                  className="col-span-4"
                  value={selectedEmbedding}
                  onChange={setSelectedEmbedding}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={() => handle_submit(collectionName, selectedEmbedding)}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    )
  }