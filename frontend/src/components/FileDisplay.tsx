import { use_current_context } from "@/hooks/hooks_retrieval";
import { Button } from "./ui/button";
// import { LoremIpsum } from 'lorem-ipsum';

import { handle_download_retrieved_file } from "@/handlers/handlers_retrieval";

// const lorem = new LoremIpsum();
// const filler_text = lorem.generateWords(500);


export function FileDisplay({ }) {
    const retrieved = use_current_context();

    const retrieved_context = retrieved.text;
    const retrieved_id = retrieved.file.hash;
    const retrieved_source = retrieved.file.name;
    const retrieved_collection = retrieved.file.collection;


    let retrieved_subtitle;
    if (retrieved_id) {
        retrieved_subtitle =
            '"' + retrieved_source + '"' +
            " from collection: " + retrieved_collection
    } else {
        retrieved_subtitle = ""
    }

    return (
        <div id="file_display_component" className="flex flex-col flex-1 overflow-auto min-h-0">
            <div id="file_preview" className="mt-2 flex-1 min-h-0 bg-accent rounded-md p-2 overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-highlight [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="whitespace-pre-wrap h-full text-text">
                    {retrieved_context}
                </div>
            </div>
            <div id="file_subtitle" className="mt-1 pt-1 text-xs">
                <p className="text-text">{retrieved_subtitle}</p>
            </div>
            <div id="file_controls" className="mt-2">
                <Button
                    className="bg-accent text-text hover:bg-highlight hover:text-text2"
                    variant="default"
                    onClick={handle_download_retrieved_file}>
                    Download Full Document
                </Button>
            </div>
        </div>
    )
}