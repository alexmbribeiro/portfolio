import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { person } from "@/lib/profile";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-alexandreribeiro.vercel.app"),
  title: `${person.name} — ${person.role}`,
  description: person.headline,
  openGraph: {
    title: `${person.name} — ${person.role}`,
    description: person.headline,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* The hero light reaches past the content column to the window edge.
            Clipping here rather than on <body> matters: body overflow is
            propagated to the viewport, where some mobile browsers still let
            the page pan sideways. */}
        <div className="relative overflow-x-clip">{children}</div>
      </body>
    </html>
  );
}
