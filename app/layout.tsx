import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
const sans=DM_Sans({variable:"--font-sans",subsets:["latin"]});
const display=Playfair_Display({variable:"--font-display",subsets:["latin"],style:["normal","italic"]});
const title="Buonissimo! · Ricette da 1 a 3 anni";
const description="Trova ricette per bambini da 1 a 3 anni partendo dagli ingredienti che hai in casa.";
export const metadata:Metadata={title,description,openGraph:{title,description,type:"website",locale:"it_IT"},twitter:{card:"summary",title,description},icons:{icon:{url:"/favicon.svg?v=2",type:"image/svg+xml"},apple:{url:"/apple-touch-icon.png?v=1",sizes:"180x180",type:"image/png"}},other:{"codex-preview":"development"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="it"><body className={`${sans.variable} ${display.variable}`}>{children}</body></html>}
