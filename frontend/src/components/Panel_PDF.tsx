import { useEffect } from 'react';
import { useState } from 'react';
import PDFViewer from './PDFViewer';

// Handlers

// Components

// Hooks
import { use_current_context, use_retrieved_context } from '@/hooks/hooks_retrieval';
import { stream_pdf } from '@/api/api_files';



export function Panel_PDF() {
    const retrieved_context = use_retrieved_context();
    const current_context = use_current_context();
    const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

    // Fetches the PDF when the selected file state changes.
    // The selected file state is updated through the PDFMenu component.
    useEffect(() => {
        console.log("Fetching PDF...")
        if (current_context) {
            const get_pdf = async() => {
                const buffer = await stream_pdf(current_context.file.hash);
                setPdfData(buffer)
            };
            get_pdf();
        }
    }, [retrieved_context, current_context]);

    return (
        <div id="contentdiv" className='h-full overflow-auto flex flex-col'>
            <div className='flex'>
            </div>
            <PDFViewer pdf_stream={pdfData}></PDFViewer>
        </div>
    )
}