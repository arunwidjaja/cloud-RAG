// Components
import { DropdownMenu } from "./Dropdown_Menu"
import { FileTable } from "./Table_Files"
import { CollectionCreationButton } from "./CollectionCreationButton"
import { CollectionDeletionButton } from "./CollectionDeletionButton"

// Handlers
import { handle_choose_collection } from "@/handlers/button_handlers"

// Hooks
import { use_collections } from "@/hooks/hooks_database"

export function Tab_2_Content() {
    return (
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
    )
}

