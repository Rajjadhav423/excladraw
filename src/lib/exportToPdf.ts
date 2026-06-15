import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Export canvas drawing to PDF
 * @param svgElement - The SVG element containing the drawing
 * @param fileName - Name of the PDF file (without extension)
 * @param title - Optional title for the PDF
 */
export async function exportToPdf(
  svgElement: SVGSVGElement | null,
  fileName: string = "drawing",
  title?: string
): Promise<void> {
  if (!svgElement) {
    throw new Error("SVG element not found");
  }

  try {
    // Get SVG dimensions
    const svgRect = svgElement.getBoundingClientRect();
    const svgWidth = svgElement.viewBox?.baseVal.width || svgRect.width || 800;
    const svgHeight = svgElement.viewBox?.baseVal.height || svgRect.height || 600;

    // Convert SVG to canvas using html2canvas
    const canvas = await html2canvas(svgElement as unknown as HTMLElement, {
      backgroundColor: "#ffffff",
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/png");

    // Calculate dimensions for PDF
    // A4 page size in mm: 210 x 297
    const pdfWidth = 210;
    const pdfHeight = 297;

    // Calculate scaling to fit on page
    const svgAspectRatio = svgWidth / svgHeight;

    let pdfImgWidth = pdfWidth - 20; // 10mm margins
    let pdfImgHeight = pdfImgWidth / svgAspectRatio;

    // If height exceeds page height, scale down
    if (pdfImgHeight > pdfHeight - 20) {
      pdfImgHeight = pdfHeight - 20;
      pdfImgWidth = pdfImgHeight * svgAspectRatio;
    }

    // Center the image on the page
    const xOffset = (pdfWidth - pdfImgWidth) / 2;
    const yOffset = title ? 20 : (pdfHeight - pdfImgHeight) / 2;

    // Create PDF document
    const pdf = new jsPDF({
      orientation: pdfImgWidth > pdfImgHeight ? "landscape" : "portrait",
      unit: "mm",
      format: "a4",
    });

    // Add title if provided
    if (title) {
      pdf.setFontSize(16);
      pdf.text(title, pdfWidth / 2, 15, { align: "center" });
    }

    // Add image to PDF
    pdf.addImage(
      imgData,
      "PNG",
      xOffset,
      yOffset,
      pdfImgWidth,
      pdfImgHeight
    );

    // Save the PDF
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw new Error("Failed to export to PDF: " + (error instanceof Error ? error.message : String(error)));
  }
}
