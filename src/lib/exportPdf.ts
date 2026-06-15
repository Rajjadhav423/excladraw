export const CANVAS_SVG_ID = "boardflow-canvas-svg";

const PX_TO_PT = 72 / 96;

function getSvgDimensions(svg: SVGSVGElement) {
  const width =
    Number(svg.getAttribute("width")) ||
    svg.viewBox.baseVal.width ||
    svg.clientWidth;
  const height =
    Number(svg.getAttribute("height")) ||
    svg.viewBox.baseVal.height ||
    svg.clientHeight;

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("Unable to determine canvas dimensions.");
  }

  return { width, height };
}

async function svgToPngDataUrl(svg: SVGSVGElement) {
  const { width, height } = getSvgDimensions(svg);
  const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
  const background = window.getComputedStyle(svg).backgroundColor;
  clonedSvg.style.background = background;

  const serialized = new XMLSerializer().serializeToString(clonedSvg);
  const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Unable to render SVG for PDF export."));
      img.src = url;
    });

    const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to create canvas context for PDF export.");
    }

    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportCanvasSvgAsPdf(svg: SVGSVGElement, filename = "boardflow-drawing.pdf") {
  const { width, height } = getSvgDimensions(svg);
  const pngDataUrl = await svgToPngDataUrl(svg);
  const { jsPDF } = await import("jspdf");

  const widthPt = width * PX_TO_PT;
  const heightPt = height * PX_TO_PT;
  const orientation = widthPt >= heightPt ? "landscape" : "portrait";

  const pdf = new jsPDF({
    orientation,
    unit: "pt",
    format: [widthPt, heightPt],
    compress: true,
  });

  pdf.addImage(pngDataUrl, "PNG", 0, 0, widthPt, heightPt, undefined, "FAST");
  pdf.save(filename);
}
