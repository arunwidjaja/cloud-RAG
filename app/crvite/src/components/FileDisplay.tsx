import { use_current_retrieved } from "@/handlers/retrieved_handlers";
import { Button } from "./ui/button";
import { LoremIpsum } from 'lorem-ipsum';

const lorem = new LoremIpsum();
const filler_text = lorem.generateWords(500);


export function FileDisplay({ }) {
    return (
        <div id="file_display_component" className="border border-red-500 flex flex-col flex-1 overflow-auto min-h-0">
            <div id="file_preview" className="border border-green-500 m-2 flex-1 overflow-auto min-h-0">
                <div className="max-h-full overflow-auto">
                    {use_current_retrieved().text}
                    <br></br>
                    <br></br>
                    {filler_text}
                </div>
            </div>
            <div id="file_subtitle" className="border border-white m-2 text-xs">
                <p>Content Subtitle</p>
            </div>
            <div id="file_controls" className="border border-yellow-500 m-2">
                <Button> 0 </Button>
                <Button> 1 </Button>
                <Button> 2 </Button>
            </div>
        </div>
    )
}