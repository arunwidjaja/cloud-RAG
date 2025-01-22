import useFilesStore from '../stores/filesStore';
import {
    set_selected_files,
    set_selected_uploads
} from '../handlers/handlers_files';
import { FileData } from '../types/types';
import React from 'react';



interface UploadsListProps {
    uploads: FileData[];
}
interface UploadsListItemProps {
    upload: FileData;
    isSelected: boolean;
    onToggle: () => void;
}
interface FilesListProps {
    files: FileData[];
}
interface FilesListItemProps {
    file: FileData;
    isSelected: boolean;
    onToggle: () => void;
}

// Parent Component
export const UploadsList: React.FC<UploadsListProps> = ({ uploads }) => {
    const selected_uploads = useFilesStore(state => state.selected_uploads);
    // Toggle selection function
    const toggle_selected_uploads = (upload: FileData) => {
        set_selected_uploads(selected_uploads.includes(upload)
            ? selected_uploads.filter((item) => item !== upload)
            : [...selected_uploads, upload]);
    };

    return (
        <ul id="uploads-list-ul">
            {uploads.map((upload, index) => (
                <UploadsListItem
                    key={index}
                    upload={upload}
                    isSelected={selected_uploads.includes(upload)}
                    onToggle={() => toggle_selected_uploads(upload)}
                />
            ))}
        </ul>
    );
};

// Child Component
export const UploadsListItem: React.FC<UploadsListItemProps> = ({ upload, isSelected, onToggle }) => {
    return (
        <li
            className="upload-item"
            data-name={upload.name}
            data-hash={upload.hash}
            data-word-count={upload.word_count}
            onClick={onToggle}
            style={{
                cursor: 'pointer',
                fontWeight: isSelected ? 'bold' : 'normal', // Style change if selected
            }}
        >
            {upload.name}
        </li>
    );
};

// Parent Component

export const FilesList: React.FC<FilesListProps> = ({ files }) => {
    const selected_files = useFilesStore(state => state.selected_files);

    // Toggle selection function
    const toggle_selected_files = (file: FileData) => {
        set_selected_files(selected_files.includes(file)
            ? selected_files.filter((item) => item !== file)
            : [...selected_files, file]);
    };

    return (
        <ul id="file-list-ul">
            {files.map((file, index) => (
                <FilesListItem
                    key={index}
                    file={file}
                    isSelected={selected_files.includes(file)}
                    onToggle={() => toggle_selected_files(file)}
                />
            ))}
        </ul>
    );
};

// Child Component
export const FilesListItem: React.FC<FilesListItemProps> = ({ file, isSelected, onToggle }) => {
    return (
        <li
            className="file-item"
            data-name={file.name}
            data-hash={file.hash}
            data-word-count={file.word_count}
            onClick={onToggle}
            style={{
                cursor: 'pointer',
                fontWeight: isSelected ? 'bold' : 'normal', // Style change if selected
            }}
        >
            {file.name}
        </li>
    );
};
