import { Item, spacings, theme } from "../../core";

const all = <T>(arr: T[], predicate: (a: T) => boolean): boolean => {
  //not using reduce here because I want to have the ability not to traverse whole array
  //and return result as long as I get predicate returning false
  //same goes for any
  for (let i = 0; i < arr.length; i++) {
    if (!predicate(arr[i])) return false;
  }
  return true;
};

const traverseChildrenBFS = <T>(
  item: Item,
  filterMap: (item: Item) => T | undefined,
  maxResults: number
): T[] => {
  const results: T[] = [];
  const queue: Item[] = [];
  const traverse = () => {
    const item = queue.shift();

    if (!item || results.length >= maxResults) return queue;

    const resultingItem = filterMap(item);

    if (resultingItem) results.push(resultingItem);
    if (item.children) item.children.forEach((subitem) => queue.push(subitem));
    traverse();
  };

  queue.push(item);
  traverse();
  return results;
};

//BFS on items tree finding items with case-insensitive term
export const findLocalItems = (
  rootItem: Item,
  term: string
): LocalSearchResults => {
  const MAX_ITEMS_TO_FIND = 25;

  const terms = term
    .toLocaleLowerCase()
    .split(" ")
    .filter((x) => x);

  const isMatchingTerms = (item: Item): LocalSearchEntry | undefined => {
    const loweredTitle = item.title.toLocaleLowerCase();
    const indexes = terms.map((term) => loweredTitle.indexOf(term));

    if (all(indexes, (index) => index >= 0))
      return {
        item,
        highlights: createTermsFound(item.title, terms),
      };
    return undefined;
  };

  return {
    items: traverseChildrenBFS(rootItem, isMatchingTerms, MAX_ITEMS_TO_FIND),
    term,
  };
};

const createTermsFound = (title: string, terms: string[]): Highlight[] => {
  const indexes = terms.map((term) => title.toLocaleLowerCase().indexOf(term));
  return createTitleHighlightsFromFoundTerms(
    terms
      .map((term, termIndex) => ({
        term,
        foundAt: indexes[termIndex],
      }))
      .sort((prev, next) => prev.foundAt - next.foundAt)
  );
};

const createTitleHighlightsFromFoundTerms = (
  terms: TermsFound[]
): { from: number; to: number }[] => {
  const foundsAt: Map<number, string> = new Map();

  terms.forEach((termFound) => {
    if (
      !foundsAt.has(termFound.foundAt) ||
      foundsAt.get(termFound.foundAt)!.length < termFound.term.length
    )
      foundsAt.set(termFound.foundAt, termFound.term);
  });

  return Array.from(foundsAt.entries()).map(([key, value]) => ({
    from: key,
    to: key + value.length,
  }));
};
type TermsFound = { term: string; foundAt: number };

export const drawTextAt = (
  x: number,
  y: number,
  { highlights, item }: LocalSearchEntry,
  isSelected: boolean
) => {
  const { ctx } = window;

  const parts = createRowTitleWithHighlightsFromTerms(highlights, item.title);

  let offset = x;

  ctx.fillStyle = isSelected ? theme.selected : theme.font;

  window.ctx.textBaseline = "alphabetic";
  parts.forEach((part) => {
    if (part.isBold) ctx.font = `600 14px ${spacings.fontFace}`;
    else ctx.font = `300 14px ${spacings.fontFace}`;

    const measure = ctx.measureText(part.text);
    ctx.fillText(part.text, offset, y);

    const yOffset = 4;
    if (part.isBold) {
      const yL = y + yOffset;
      drawLine(offset, yL, offset + measure.width, yL, theme.selected, 2);
    }
    offset += measure.width;
  });
};

const createRowTitleWithHighlightsFromTerms = (
  highlights: Highlight[],
  title: string
): { text: string; isBold: boolean }[] =>
  highlights
    .map((term, index) => {
      const prevIndex = index == 0 ? 0 : highlights[index - 1].to;
      return [
        { text: title.slice(prevIndex, term.from), isBold: false },
        { text: title.slice(term.from, term.to), isBold: true },
      ];
    })
    .flat()
    .concat({
      text: title.slice(highlights[highlights.length - 1].to),
      isBold: false,
    });

export type LocalSearchEntry = {
  item: Item;
  highlights: Highlight[];
};

type Highlight = { from: number; to: number };

export type LocalSearchResults = {
  items: LocalSearchEntry[];
  term: string;
};

const drawLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number
) => {
  const { ctx } = window;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};
