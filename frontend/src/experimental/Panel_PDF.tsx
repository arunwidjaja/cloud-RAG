import { RefObject, useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import PDFViewer from './PDFViewer';

// Handlers
import { refresh_uploads, set_selected_file } from '@/handlers/handlers_files';

// Components
import { PDFMenu } from "./Menu_PDF"
import { Button } from "./ui/button"
import { Upload } from "lucide-react"
import { FileUploadWindow } from "./FileUpload"

// Hooks
import { use_current_file, use_uploads } from '@/hooks/hooks_files';
import { FileData } from '@/types/types';
import { current_user_id } from '@/api/api_init';




// Launches upload window
const handle_accept_uploads = (uploadRef: RefObject<HTMLInputElement>): void => {
    if (uploadRef && uploadRef.current) {
        uploadRef.current.click();
    }
};

export function PDFPanel() {
    const uploadRef = useRef(null);
    
    const current_file = use_current_file();
    const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

    // Fetches the uploads upon loading.
    useEffect(() => {
        refresh_uploads()
    }, []);

    // Fetches the PDF when the selected file state changes.
    // The selected file state is updated through the PDFMenu component.
    useEffect(() => {
        if(current_file.hash){
            fetch_PDF(current_file.hash)
        }
    }, [current_file]);

    // Handler for the PDFMenu selection behavior
    const handle_select_file = (file: FileData) => {
        set_selected_file(file)
    }

    // Streams the PDF to the user.
    const fetch_PDF = async (pdf_id: string) => {
        try {
            const query = `pdf_id=${encodeURIComponent(pdf_id)}`
            const url = `${import.meta.env.VITE_API_BASE_URL}/pdf?${query}`
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    'uuid': current_user_id
                }
            });
            const data = await response.arrayBuffer();
            console.log('PDF data received:', data.byteLength); // Should show the size of the PDF
            setPdfData(data);
        } catch (error) {
            console.error("Error fetching PDF: ", error);
        }
    }

    return (
        <div id="contentdiv" className='h-full overflow-auto flex flex-col'>
            <div id='tab_header'>
                <p className='text-xl text-text'>PDF Viewer</p>
                <p className='text-sm mt-1 mb-3 text-text'>Once you upload a PDF, it will be displayed here.</p>
            </div>
            <div className='flex'>
                <PDFMenu
                    useItemsHook={use_uploads}
                    placeholder='Select a document'
                    searchPlaceholder='Search uploaded PDFs...'
                    className='flex-1 m-1 mb-4'
                    onChange={handle_select_file}>
                </PDFMenu>
            </div>
            {/* <FileDisplay></FileDisplay> */}
            <PDFViewer pdf_stream={pdfData}></PDFViewer>
            
            <FileUploadWindow ref={uploadRef} />
            <Button
                className='w-full mt-4 mb-1 bg-text hover:bg-highlight'
                onClick={() => handle_accept_uploads(uploadRef)}>
                <Upload></Upload>
            </Button>
        </div>
    )
}