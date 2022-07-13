import { AppState, isRoot, Item } from "../core/app";
import { xOffset } from "./draw";
import { spacings, theme } from "./ui";

export let itemEdited: Item | undefined = undefined;
export const showInput = (app: AppState) => {
  if (app.selectedItem) {
    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("text-input");
    const view = app.views.get(app.selectedItem)!;

    //TODO: extract duplicate from view
    const x =
      view.gridX * spacings.gridSize +
      xOffset +
      spacings.textFromCircleDistance -
      2;
    const y =
      view.gridY * spacings.gridSize +
      spacings.offsetFromTop -
      0.8 * spacings.fontSize +
      (!isRoot(app.itemFocused) ? spacings.focusedTitleOffset : 0);

    Object.assign(input.style, {
      top: y + "px",
      left: x + "px",
      color: theme.selected,
      fontSize: spacings.fontSize + "px",
      fontFamily: spacings.fontFace,
      overflow: "hidden",
      width: "600px",
    });

    document.body.appendChild(input);

    input.value = app.selectedItem.title;
    itemEdited = app.selectedItem;
    input.focus();
    placeCarretAtStart(input);

    const finishEdit = () => {
      if (app.selectedItem) app.selectedItem.title = input.value;
      input.remove();

      itemEdited = undefined;
    };

    input.addEventListener("blur", finishEdit);
    input.addEventListener("keydown", (e) => {
      if (e.code === "Enter" || e.code === "Escape") {
        input.removeEventListener("blur", finishEdit);
        finishEdit();
      }
    });
  }
};

const placeCarretAtStart = (input: HTMLInputElement) => {
  input.scrollTo({ left: 0 });
  input.setSelectionRange(0, 0);
};
