// Components
import { DocumentPanel } from "@/components/DocumentPanel"
import { DropdownMenuContext } from "./Dropdown_Menu_Context"

// Hooks
import { use_retrieved_context, use_retrieved_context_unique_files } from "@/hooks/hooks_retrieval"
import { Button } from "./ui/button"

export function Tab_1_Content() {
    return (
        <div id="contentdiv" className='h-full overflow-auto flex flex-col'>
            <div id='tab_header'>
                <p className='text-xl text-text'>Retrieved Documents</p>
                <p className='text-sm mt-1 mb-3 text-text'>Once you submit a query, any relevant documents will be displayed here.</p>
            </div>
            <div className='flex'>
                <DropdownMenuContext
                    useItemsHook={use_retrieved_context}
                    placeholder='Select document'
                    searchPlaceholder='Search retrieved documents...'
                    className='flex-1 mt-1'>
                </DropdownMenuContext>
            </div>
            <DocumentPanel></DocumentPanel>
            <Button
                onClick={()=>alert("Implement This.")}
                className={`
                    bg-text text-text2
                    hover:bg-highlight
                `}>
                Download Original File
            </Button>
        </div>
    )
}