import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
const sans=DM_Sans({variable:"--font-sans",subsets:["latin"]});
const display=Playfair_Display({variable:"--font-display",subsets:["latin"],style:["normal","italic"]});
export const metadata:Metadata={title:"Ricette 1–3 anni",description:"Cerca e filtra 100 ricette semplici per bambini da 1 a 3 anni.",icons:{icon:{url:"/favicon.svg?v=2",type:"image/svg+xml"},apple:{url:"/apple-touch-icon.png?v=1",sizes:"180x180",type:"image/png"}},other:{"codex-preview":"development"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="it"><body className={`${sans.variable} ${display.variable}`}>{children}</body></html>}
