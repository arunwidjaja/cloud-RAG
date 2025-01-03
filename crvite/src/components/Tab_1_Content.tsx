import { DropdownMenuContext } from "./Dropdown_Menu_Context"
import { FileDisplay } from "./FileDisplay"
import { use_retrieved_files } from "@/hooks/hooks"

export function Tab_1_Content() {
    return (
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
    )
}