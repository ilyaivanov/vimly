import { AppState, ItemView, hasChildren, spacings, theme } from "../core";
import { fillCircle, fillTextAtMiddle, outlineCircle, xOffset } from "./canvas";
import { itemEdited } from "./input";

const { circleRadius, circleLineWidth } = spacings;

export const drawApp = (app: AppState) => {
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

  if (!isItemFocused) {
    if (hasChildren(item)) fillCircle(x, y, circleRadius, view.circleColor);

    outlineCircle(x, y, circleRadius, circleLineWidth, view.circleColor);
  }

  if (item !== itemEdited) {
    const textYOffset = 1;
    const textXOffset = spacings.textFromCircleDistance;

    const textX = x + textXOffset;
    const textY = y + textYOffset;
    fillTextAtMiddle(item.title, textX, textY, view.fontSize, view.textColor);
  }

  const isParentFocused = parentView?.item == app.itemFocused;
  if (parentView && !isItemFocused && !isParentFocused)
    lineBetween(view, parentView);
};

const lineBetween = (view1: ItemView, view2: ItemView) => {
  const { circleRadius, lineToCircleDistance } = spacings;

  const x1 = view1.x - circleRadius - lineToCircleDistance;
  const y1 = view1.y;

  const x2 = view2.x;
  const y2 = view2.y + circleRadius + lineToCircleDistance;

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
