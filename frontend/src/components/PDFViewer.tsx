import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.js';

// Components
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Hooks
import { ContextData } from '@/types/types';




interface TextItem {
  str: string;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
}

interface PDFViewerProps {
  pdf_stream: ArrayBuffer | null;
  context: ContextData | null;
}

const PDFViewer = ({pdf_stream, context}: PDFViewerProps): JSX.Element => {

  console.log("Rendering PDFViewer component...")
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const highlightLayerRef = useRef<HTMLDivElement>(null);

  // The PDF itself and the number of pages it has
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  
  // Content and positional data of the text snippet
  const [textItems, setTextItems] = useState<TextItem[]>([]);

  // User's current page and zoom level
  const [scale, setScale] = useState<number>(1.0);
  const [currentPage, setCurrentPage] = useState(1);

  // Utilities
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const currentContext = context

  // Load PDF document when the selected PDF changes.
  // Does not reload the entire file every time a different context is selected;
  useEffect(() => {
    console.log("Loading PDF...")
    const loadPDF = async () => {
      if (!pdf_stream) {
        setError('');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Convert ArrayBuffer to Uint8Array for PDF.js
        const uint8Array = new Uint8Array(pdf_stream);
        const loadingTask = pdfjsLib.getDocument(uint8Array);
        const pdf = await loadingTask.promise;

        setNumPages(pdf.numPages);
        setPdfDoc(pdf);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Error loading PDF. Please try again.');
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdf_stream]);

  // Updates the current page if the user selects a different context to view.
  useEffect(() => {
    if (currentContext) {
      setCurrentPage(Number(currentContext.page) + 1);
    }
  }, [currentContext])

  // Renders the current page and extracts the text and positional data
  // The text and positional data are stored in textItems.
  // Needs to run when the changes page or the file
  // Reminder: page can be changed through buttons or context selection.
  useEffect(() => {
    console.log("Rendering page #" + currentPage)
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current || !highlightLayerRef.current) return;

      try {
        setLoading(true);

        const pdf_page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Cannot get canvas context');
        }

        // Scale is set to 1.0 by default at the top of the component.
        const viewport = pdf_page.getViewport({ scale });
        const height = viewport.height;
        const width = viewport.width;

        // PDF and Highlight layer should be the same dimensions.
        canvas.height = height;
        canvas.width = width;
        highlightLayerRef.current.style.height = `${height}px`;
        highlightLayerRef.current.style.width = `${width}px`;

        // Render the page content
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // Get text content.
        // This parses out the PDF and stores position information for each word.
        const textContent = await pdf_page.getTextContent();
        const items = textContent.items.map((item: any) => ({
          str: item.str,
          pos_x: item.transform[4],
          pos_y: item.transform[5],
          width: item.width || 20, // arbitrary default width
          height: item.height || 0
        }));

        setTextItems(items);

        await pdf_page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Error rendering page. Please try again.');
        setLoading(false);
      }
    };
    renderPage();
  }, [currentPage, scale, pdfDoc]); // Rerenders when user zooms, changes page, or changes documents

  // Hook for rendering highlights.
  // Renders a highlight layer over the current page.
  // Needs to run when user changes the context or file.
  useEffect(() => {
    console.log("Rendering highlights...")
    if (!currentContext || !highlightLayerRef.current || !textItems.length || !pdfDoc) return;

    const renderHighlights = async () => {

      const pdf_page = await pdfDoc.getPage(currentPage);
      const viewport = pdf_page.getViewport({ scale });
      const highlightLayer = highlightLayerRef.current;

      if (!highlightLayer) return;

      console.log("Current page: " + currentPage)
      console.log("Context current page plus 1: " + (Number(currentContext.page) + 1))
      if (currentPage != (Number(currentContext.page) + 1)){
        highlightLayer.innerHTML = ''; // Clear existing highlights
        return;
      }      

      highlightLayer.innerHTML = ''; // Clear existing highlights

      const page_text = currentContext.text.toLowerCase();

      textItems.forEach((item) => {
        const text = item.str.toLowerCase();
        if (text.length > 0 && page_text.includes(text)) {

          // x and y start from the bottom-left.
          // They need to be converted to start from top-left.
          // Also need to scale coordinates and widths by the scale
          const x_raw = item.pos_x;
          const y_raw = item.pos_y;

          const x = x_raw * scale;
          const y = viewport.height - y_raw * scale - item.height * scale;
          const w = item.width * scale;
          const h = item.height * scale;

          // Create the highlight overlay
          const highlight = document.createElement('div');
          highlight.style.left = `${x}px`;
          highlight.style.top = `${y}px`;
          highlight.style.width = `${w}px`;
          highlight.style.height = `${h}px`;
          highlight.className = `
            absolute z-10
            opacity-50
            bg-yellow-200
          `;
          highlightLayer.appendChild(highlight);
        }
      });
    };

    renderHighlights();
  }, [textItems, currentContext, scale, pdfDoc]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleNextPage = () => setCurrentPage(Math.min(currentPage + 1, numPages));
  const handlePrevPage = () => setCurrentPage(Math.max(currentPage - 1, 1));

  return (
    <Card className={`
      flex flex-1 min-h-0 min-w-0
      justify-center p-4
      bg-accent
      border border-green-400
    `}>
      <div className="flex flex-1 flex-col items-center w-full min-w-0 overflow-auto">
        {/* Controls */}
        <div
          className={`
                    flex
                    items-center
                    gap-4
                    text-text
                  `}>
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className={`
              p-2 m-1
              bg-text text-text2 rounded-lg
              hover:bg-white
              disabled:opacity-50
            `}
          >
            <ChevronLeft></ChevronLeft>
          </button>
          <span className='text-sm'>
            Page: {currentPage} of {numPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            className={`
              p-2 m-1
              bg-text text-text2 rounded-lg
              hover:bg-white
              disabled:opacity-50
            `}
          >
            <ChevronRight></ChevronRight>
          </button>
          <button
            onClick={handleZoomOut}
            className={`
              p-2 m-1
              bg-text2 text-text rounded-lg
              hover:text-white
              hover:opacity-80
            `}
          >
            <ZoomOut></ZoomOut>
          </button>
          <button
            onClick={handleZoomIn}
            className={`
              p-2 m-1
              bg-text2 text-text rounded-lg
              hover:text-white
              hover:opacity-80
            `}
          >
            <ZoomIn></ZoomIn>
          </button>
        </div>
        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto relative w-full min-h-0 min-w-0 justify-items-center">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              Loading...
            </div>
          )}
          {!pdf_stream && !loading && (
            <div className="p-8 text-center text-gray-500">
              Please select a PDF to view
            </div>
          )}
          <div className="relative inline-block">
            <canvas ref={canvasRef} />
            <div
              ref={highlightLayerRef}
              className="absolute top-0 left-0 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PDFViewer;