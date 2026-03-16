"use client";

import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { getFilePlugin } from "@react-pdf-viewer/get-file";
import { printPlugin } from "@react-pdf-viewer/print";


type Props = {
    fileUrl: string;
};

export default function PdfView({ fileUrl }: Props) {
    const zoomPluginInstance = zoomPlugin();
    const { ZoomIn, ZoomOut, ZoomPopover } = zoomPluginInstance;

    const getFilePluginInstance = getFilePlugin();
    const { Download } = getFilePluginInstance;

    const printPluginInstance = printPlugin();
    const { Print } = printPluginInstance;

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-end px-4 py-2 border-b gap-2 border-gray-100">
                <ZoomOut />
                {/* <ZoomPopover /> */}
                <ZoomIn />
                <Print />
                <Download />
            </div>
            <div className="h-[900px] border rounded-md shadow-md">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer fileUrl={fileUrl} defaultScale={SpecialZoomLevel.PageFit} plugins={[zoomPluginInstance, getFilePluginInstance, printPluginInstance]} />
                </Worker>
            </div>
        </div>
    );
}




































// "use client";

// import { useState } from "react";
// import { Document, Page, pdfjs } from "react-pdf";
// import "react-pdf/dist/Page/AnnotationLayer.css";
// import "react-pdf/dist/Page/TextLayer.css";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


// export default function PdfView({fileUrl}: {fileUrl: string}) {
//   const [numPages, setNumPages] = useState<number>(0);

//   return (
//       <div className="overflow-y-auto max-h-[600px] border">
//         <Document
//           file={fileUrl}
//           onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//           className="flex flex-col items-center"
//         >
//           {Array.from(new Array(numPages), (_el, index) => (
//             <Page
//               key={`page_${index + 1}`}
//               pageNumber={index + 1}
//               renderTextLayer={false}
//               renderAnnotationLayer={false}
//               width={600}
//               className="mb-4"
//             />
//           ))}
//         </Document>
//       </div>
//   );
// }
