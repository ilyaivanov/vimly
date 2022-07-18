const dark = {
  bg: "#1E1E1E",
  line: "#373B42",
  titleFont: "#FFFFFF", //"#FFFFFF",
  font: "#CBCBCB", //"#FFFFFF",
  firstLevelFont: "#FFFFFF", //"#FFFFFF",
  selected: "#73C991", //"#B1E847", rgb(62, 166, 255)
  gridPoint: "#3C413D",
  filledCircle: "#D1D2D3",
  centerColor: "#2C392F", // #2C392F
};

const light: Theme = {
  bg: "#FAF9F7",
  line: "#D3D3D3",
  gridPoint: "#D3D3D3",
  selected: "#065fd4",
  filledCircle: "#A39E93",
  centerColor: "#EAEAEA",
  firstLevelFont: "#000000",
  titleFont: "#000000",
  font: "#3F4254",
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
