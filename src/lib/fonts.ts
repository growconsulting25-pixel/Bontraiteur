import { Bricolage_Grotesque, Hanken_Grotesk, Instrument_Serif } from "next/font/google";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap", weight: ["500", "700", "800"] });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

export const fontVariables = `${bricolage.variable} ${hanken.variable} ${instrument.variable}`;
