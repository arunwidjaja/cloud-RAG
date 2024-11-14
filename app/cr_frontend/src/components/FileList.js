import useFilesStore from '../stores/filesStore';
import {
    set_selected_files,
    set_selected_uploads
} from '../handlers/file_handlers';

// Parent Component
export const UploadsList = ({ uploads }) => {
    const selected_uploads = useFilesStore(state => state.selected_uploads);
    // Toggle selection function
    const toggle_selected_uploads = (upload) => {
        set_selected_uploads(selected_uploads.includes(upload)
            ? selected_uploads.filter((item) => item !== upload)
            : [...selected_uploads, upload]);
    };

    return (
        <ul id="uploads-list-ul">
            {uploads.map((upload, index) => (
                <UploadListItem
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
export const UploadListItem = ({ upload, isSelected, onToggle }) => {
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
export const FilesList = ({ files }) => {
    const selected_files = useFilesStore(state => state.selected_files);

    // Toggle selection function
    const toggle_selected_files = (file) => {
        set_selected_files(selected_files.includes(file)
            ? selected_files.filter((item) => item !== file)
            : [...selected_files, file]);
    };

    return (
        <ul id="file-list-ul">
            {files.map((file, index) => (
                <FileListItem
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
export const FileListItem = ({ file, isSelected, onToggle }) => {
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
