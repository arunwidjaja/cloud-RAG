import { FileData } from "@/types/types"
import { X } from "lucide-react"

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