import { use_current_retrieved } from "@/handlers/retrieved_handlers";
import { Button } from "./ui/button";
import { LoremIpsum } from 'lorem-ipsum';
import { use_current_collection } from "@/handlers/collection_handlers";

const lorem = new LoremIpsum();
const filler_text = lorem.generateWords(500);


export function FileDisplay({ }) {
    const retrieved = use_current_retrieved();
    const retrieved_context = retrieved.text;
    const retrieved_source = retrieved.file.name;
    const retrieved_id = retrieved.file.hash;
    
    let retrieved_subtitle;
    if(retrieved_id) {
        retrieved_subtitle = retrieved_source + ": " + retrieved_id
    } else {
        retrieved_subtitle = ""
    }
    
    return (
        <div id="file_display_component" className="flex flex-col flex-1 overflow-auto min-h-0">
            <div id="file_preview" className="mt-2 flex-1 overflow-auto min-h-0 bg-blue-200 rounded-md p-2">
                <div className="max-h-full overflow-auto text-black [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black [&::-webkit-scrollbar-thumb]:rounded-full">
                    {retrieved_context}
                    {/* {filler_text} */}
                </div>
            </div>
            <div id="file_subtitle" className="mt-1 pt-1 text-xs">
                <p className="text-blue-200">{retrieved_subtitle}</p>
            </div>
            <div id="file_controls" className="mt-2">
                <Button> 0 </Button>
                <Button> 1 </Button>
                <Button> 2 </Button>
            </div>
        </div>
    )
}