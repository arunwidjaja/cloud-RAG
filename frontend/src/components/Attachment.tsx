import { start_upload_deletion } from "@/api/api_files"
import { refresh_attachments } from "@/handlers/handlers_files"
import { FileData } from "@/types/types"
import { X } from "lucide-react"

const remove_attachment = (files: FileData[]) => {
    start_upload_deletion(files,true)
    refresh_attachments()
}

export const Attachment = ({ file }: { file: FileData }) => {
    return (
        <div
            className={`
                flex flex-row
                items-center text-center
                m-1 rounded-lg 
                text-xs font-extrabold
            `}>
                <X
                    onClick={() => remove_attachment([file])}
                    size={24}
                    className={`
                    shrink-0
                    m-1 p-1
                    rounded-full
                    opacity-50
                    text-warning
                    bg-text
                    hover:opacity-100
                    hover:bg-warning
                    hover:text-text
                    hover:cursor-pointer
                    transition-all
                    duration-250
                    ease-in-out
                `}>
                </X>
            <div className="mr-2">
                {file.name}
            </div>
        </div>
    )
}