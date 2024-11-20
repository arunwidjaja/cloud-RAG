import { use_current_retrieved } from "@/handlers/retrieved_handlers";


export function FileDisplay({}) {
    return (
        <div>{use_current_retrieved().text}</div>
    )
}