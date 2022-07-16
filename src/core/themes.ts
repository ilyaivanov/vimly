const dark = {
  bg: "#1E1E1E",
  line: "#373B42",
  titleFont: "#FFFFFF", //"#FFFFFF",
  font: "#CBCBCB", //"#FFFFFF",
  firstLevelFont: "#FFFFFF", //"#FFFFFF",
  selected: "#B1E847",
  gridPoint: "#3C413D",
  filledCircle: "#D1D2D3",
  centerColor: "#2C392F", // #2C392F
};

const light: Theme = {
  bg: "#FAF9F7",
  line: "#D3D3D3",
  gridPoint: "#D3D3D3",
  selected: "#009EF7",
  filledCircle: "#A39E93",
  centerColor: "#EAEAEA",
  firstLevelFont: "#3F4254",
  titleFont: "#3F4254",
  font: "#6A6C79",
};

type Theme = typeof dark;

const themesOrder: Theme[] = [dark, light];
let currentTheme = 0;

export const rotateTheme = () => {
  currentTheme += 1;
  if (currentTheme > themesOrder.length - 1) currentTheme = 0;
  theme = themesOrder[currentTheme];
};

export let theme: Theme = themesOrder[currentTheme];
