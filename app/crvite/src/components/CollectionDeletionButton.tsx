import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "./ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"

import { useState } from 'react';
import { handle_delete_collection } from '@/handlers/button_handlers';


export function CollectionDeletionButton() {

  const [open, setOpen] = useState(false);

  const handle_submit = async () => {
    try {
      await handle_delete_collection();
      setOpen(false)
    } catch (error) {
      setOpen(true);
      console.error('Failed to delete collection', error);
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button variant="destructive" className="ml-1 mt-1"> - </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent>
            <p className="text-black">Delete this Collection</p>
          </TooltipContent>
        </Tooltip>
        <DialogContent className="bg-gray-600">
          <DialogHeader>
            <DialogTitle className="text-black">Are you sure?</DialogTitle>
            <DialogDescription>
              <p>Deleting this Collection will also delete all documents and metadata inside it.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="submit"
              variant="destructive"
              onClick={handle_submit}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}