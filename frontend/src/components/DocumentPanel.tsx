import { useEffect, useRef } from 'react';
import { useState } from 'react';
import PDFViewer from './PDFViewer';

// Handlers

// Components

// Hooks
import { use_current_context, use_retrieved_context } from '@/hooks/hooks_retrieval';
import { stream_pdf } from '@/api/api_files';
import { Button } from './ui/button';


export function DocumentPanel() {
    // UI Flow:
    // User asks a question
    // An answer is generated with retrieved context
    // The dropdown menu populates automatically. (Parent component)
    // User can view it themselves by selecting from the dropdown menu OR
    // User can click on the context selection bubble to make it appear.

    // So rendering should start when the current_context changes.
    //      This is modified either through the DDM or the chat bubble.

    const prevFileHash = useRef("");
    const retrieved_context = use_retrieved_context();
    const current_context = use_current_context();

    const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

    //Starts streaming a file once a context is selected.
    useEffect(() => {
        if (current_context) {
            const get_pdf = async () => {
                const buffer = await stream_pdf(current_context.file.hash);
                setPdfData(buffer)
            };
            // Only loads a new PDF if the selected context is from a different file.
            if (prevFileHash.current !== current_context.file.hash) {
                prevFileHash.current = current_context.file.hash;
                get_pdf();
            }
        }
    }, [current_context]);

    return (
        <div
            id="contentdiv"
            className={`
                flex flex-col h-full
                overflow-auto
                border border-red-400
            `}>
            <PDFViewer
                pdf_stream={pdfData}
                context={current_context}>
            </PDFViewer>
        </div>
    )
}