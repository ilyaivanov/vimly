import { spacings, theme } from "../core";

// Canvas Infra
export let xOffset = 0;

let onResizeCb: () => void;

export const setOnResizeCb = (cb: typeof onResizeCb) => (onResizeCb = cb);

export const initCanvas = () => {
  const canvas = document.createElement("canvas");

  document.body.appendChild(canvas);
  const assignDimensions = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    xOffset = Math.round(
      Math.max(spacings.gridSize, (width - spacings.viewportMaxWidth) / 2)
    );

    canvas.width = width;
    canvas.height = height;
  };

  window.addEventListener("resize", () => {
    assignDimensions();
    onResizeCb && onResizeCb();
  });
  assignDimensions();

  document.body.style.backgroundColor = theme.bg;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get 2d context from canvas");

  window.ctx = context;
};

// Canvas Drawings
export const fillCircle = (x: number, y: number, r: number, color: string) => {
  window.ctx.fillStyle = color;
  window.ctx.beginPath();
  window.ctx.arc(x, y, r, 0, 2 * Math.PI);
  window.ctx.fill();
};

export const outlineCircle = (
  x: number,
  y: number,
  r: number,
  lineWidth: number,
  color: string
) => {
  window.ctx.strokeStyle = color;
  window.ctx.beginPath();
  window.ctx.arc(x, y, r, 0, 2 * Math.PI);
  window.ctx.lineWidth = lineWidth;
  window.ctx.stroke();
};

export const fillTextAtMiddle = (
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: string
) => {
  window.ctx.fillStyle = color;
  window.ctx.textBaseline = "middle";
  setFont(fontSize);
  window.ctx.fillText(text, x, y);
};

export const setFont = (fontSize: number) => {
  window.ctx.font = `400 ${fontSize}px ${spacings.fontFace}, sans-serif`;
};

declare global {
  interface Window {
    ctx: CanvasRenderingContext2D;
  }
}
