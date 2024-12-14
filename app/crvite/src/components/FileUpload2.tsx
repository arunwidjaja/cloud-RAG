import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { CloudUpload } from 'lucide-react';

interface FileUploadProps {
    onFilesChange?: (files: File[]) => void;
    max_files?: number;
    file_types?: string[];
}

export default function FileUpload2({
    onFilesChange,
    max_files,
    file_types,
}: FileUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
        const uploaded_files = Array.from(event.target.files || []);
        setFiles(uploaded_files);
        onFilesChange?.(uploaded_files);
    };

    const handleDragEnter = (event: DragEvent<HTMLDivElement>): void => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>): void => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(event.dataTransfer.files);
        setFiles(droppedFiles);
        onFilesChange?.(droppedFiles);
    };

    const handleClick = (): void => {
        fileInputRef.current?.click();
    };

    const removeFile = (index: number): void => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onFilesChange?.(newFiles);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept={file_types?.join(',')}
                />
                <CloudUpload className="mx-auto h-12 w-12 text-gray-400"></CloudUpload>

                <p className="mt-4 text-lg text-gray-600">
                    Drop files here or
                    <button
                        type="button"
                        onClick={handleClick}
                        className="mx-2 text-blue-500 hover:text-blue-700 font-medium"
                    >
                        browse
                    </button>
                    to upload
                </p>
            </div>

            {files.length > 0 && (
                <div className="mt-6">
                    <ul className="space-y-2">
                        {files.map((file, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <span className="truncate">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700 ml-4"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}