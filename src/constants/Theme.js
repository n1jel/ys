import { DefaultTheme } from '@react-navigation/native';

const LightTheme = {
  ...DefaultTheme,
  Appcolor: {
    ...DefaultTheme.Appcolor,
    primary: "#947e4b",
    primop: "rgba(212, 164, 46, 0.8)",
    yellowop: "rgba(242, 217, 158, 0.8)",
    white: "#FFFFFF",
    green: "#64C57D",
    whiteop: "rgba(256,256,256,0.6)",
    blackop: "rgba(0,0,0,0.8)",
    txt: "#222222",
    place: "#474747",
    grad1: "#F2D99E",
    grad2: "#D4A42E",
    red: "rgba(255, 71, 71, 1)",
    blackcolor: 'black',
    whitecolor: 'white',
    modal: 'white',
    lessDark: "#292929",
    yellow: "#D4A42E",
    newgrad1: "#B8860B",
    newgrad2: "#BDAE70",
    grey: "#A6A6A6",
  },
};

const DarkTheme = {
  ...DefaultTheme,
  Appcolor: {
    ...DefaultTheme.Appcolor,
    primary: "#947e4b",
    primop: "rgba(212, 164, 46, 0.8)",
    yellow: "#D4A42E",
    yellowop: "rgba(242, 217, 158, 0.8)",
    white: "black",
    green: "#64C57D",
    whiteop: "rgba(0,0,0,0.8)",
    blackop: "rgba(256,256,256,0.8)",
    txt: "white",
    place: "#474747",
    grad1: "#F2D99E",
    grad2: "#D4A42E",
    red: "rgba(255, 71, 71, 1)",
    blackcolor: 'black',
    whitecolor: 'white',
    modal: '#222222',
    lessDark: "#292929",
    newgrad1: "#B8860B",
    newgrad2: "#BDAE70",
    grey: "#A6A6A6",
  },
};

export { LightTheme, DarkTheme };