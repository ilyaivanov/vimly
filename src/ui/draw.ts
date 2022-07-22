import {
  AppState,
  ItemView,
  hasChildren,
  spacings,
  theme,
  Item,
} from "../core";
import { fillCircle, fillTextAtMiddle, outlineCircle, xOffset } from "./canvas";
import { itemEdited } from "./input";
import { drawSidebar } from "./leftSidebar";

const { circleRadius, circleLineWidth } = spacings;

export const drawApp = (app: AppState) => {
  window.ctx.fillStyle = theme.bg;
  window.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  drawSidebar(app);
  // make overflow hidden for sidebar
  window.ctx.fillStyle = theme.bg;
  window.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  window.ctx.translate(xOffset, spacings.offsetFromTop);

  for (const view of app.views.values()) {
    const parentView = view.item.parent ? view.item.parent.view : undefined;
    viewItem(app, view, parentView);
  }
  window.ctx.resetTransform();
};

const viewItem = (
  app: AppState,
  view: ItemView,
  parentView: ItemView | undefined
) => {
  const x = view.x;
  const y = view.y;
  const { item } = view;

  const isItemFocused = item == app.itemFocused;

  const r = getCircleRadius(item);
  if (!isItemFocused) {
    if (item.image) {
      drawImage(view);
    } else {
      if (hasChildren(item)) fillCircle(x, y, r, view.circleColor);

      outlineCircle(x, y, r, circleLineWidth, view.circleColor);
    }
  }

  if (item !== itemEdited) {
    const textYOffset = 1;
    const textXOffset = r + spacings.textFromCircleDistance;

    const textX = x + textXOffset;
    const textY = y + textYOffset;
    fillTextAtMiddle(item.title, textX, textY, view.fontSize, view.textColor);
  }

  const isParentFocused = parentView?.item == app.itemFocused;
  if (parentView && !isItemFocused && !isParentFocused)
    lineBetween(view, parentView);
};

const getCircleRadius = (item: Item) =>
  item.type === "YTchannel" ? 18 : circleRadius;

const lineBetween = (view1: ItemView, view2: ItemView) => {
  const { lineToCircleDistance } = spacings;

  const x1 = view1.x - getCircleRadius(view1.item) - lineToCircleDistance;
  const y1 = view1.y;

  const x2 = view2.x;
  const y2 = view2.y + getCircleRadius(view2.item) + lineToCircleDistance;

  const ctx = window.ctx;
  ctx.lineWidth = spacings.lineWidth;
  ctx.strokeStyle = theme.line;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y1);
  ctx.lineTo(x2, y2);

  ctx.stroke();
};

const drawImage = (view: ItemView) => {
  const imageR = 18;
  window.ctx.save();
  window.ctx.beginPath();
  window.ctx.arc(view.x, view.y, imageR, 0, Math.PI * 2);
  window.ctx.closePath();
  window.ctx.clip();
  const viewImage = view.item.image || "";
  window.ctx.drawImage(
    loadImage(viewImage),
    (320 - 180) / 2,
    0,
    180,
    180,
    view.x - imageR,
    view.y - imageR,
    imageR * 2,
    imageR * 2
  );
  window.ctx.restore();
};

// TODO: memory leak
const images = new Map<string, HTMLImageElement>();
const loadImage = (url: string): HTMLImageElement => {
  const existingImage = images.get(url);
  if (existingImage) return existingImage;
  else {
    const image = new Image();

    image.src = url;
    images.set(url, image);
    return image;
  }
};
