import { useEffect } from 'react';
import { useState } from 'react';
import PDFViewer from './PDFViewer';

// Handlers

// Components

// Hooks
import { use_current_retrieved, use_retrieved_files } from '@/hooks/hooks_retrieved';
import { stream_pdf } from '@/api/api_files';



export function PDFPanel() {
    const retrieved_files = use_retrieved_files();
    const currently_retrieved_file = use_current_retrieved();
    const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

    // Fetches the PDF when the selected file state changes.
    // The selected file state is updated through the PDFMenu component.
    useEffect(() => {
        if (currently_retrieved_file.file.hash) {
            const get_pdf = async() => {
                const buffer = await stream_pdf(currently_retrieved_file.file.hash);
                setPdfData(buffer)
            };
            get_pdf();
        }
    }, [retrieved_files, currently_retrieved_file]);

    return (
        <div id="contentdiv" className='h-full overflow-auto flex flex-col'>
            <div id='tab_header'>
                <p className='text-xl text-text'>PDF Viewer</p>
                <p className='text-sm mt-1 mb-3 text-text'>Once you upload a PDF, it will be displayed here.</p>
            </div>
            <div className='flex'>
            </div>
            <PDFViewer pdf_stream={pdfData}></PDFViewer>
        </div>
    )
}