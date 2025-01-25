import { useEffect } from 'react';
import { useState } from 'react';
import PDFViewer from './PDFViewer';

// Handlers

// Components

// Hooks
import { use_current_context, use_retrieved_context } from '@/hooks/hooks_retrieval';
import { stream_pdf } from '@/api/api_files';
import { Button } from './ui/button';



export function DocumentPanel() {
    const retrieved_context = use_retrieved_context();
    // const current_context = use_current_context();
    const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

    //Starts streaming the first PDF once results are fetched
    useEffect(() => {
        if (retrieved_context[0]) {
            const get_pdf = async () => {
                const buffer = await stream_pdf(retrieved_context[0].file.hash);
                setPdfData(buffer)
            };
            get_pdf();
        }
    }, [retrieved_context]);

    return (
        <div
            id="contentdiv"
            className={`
                flex flex-col h-full
                overflow-auto
                border border-red-400
            `}>
            <PDFViewer pdf_stream={pdfData}></PDFViewer>
        </div>
    )
}