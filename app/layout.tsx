import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Vazirmatn } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
});

const title = "Wrapmode Car Wrap Studio | طراحی کاور بدنه خودرو";
const description =
  "استودیوی کاور بدنه خودروی رپ‌مود — طرح کاور دلخواه را روی سدان یا هاچبک خودتان ببینید، قیمت را چک کنید و درخواست نصب دهید.";

export const metadata: Metadata = {
  metadataBase: new URL("https://studio.wrapmode.ir"),
  title,
  description,
  applicationName: "Wrapmode Studio",
  keywords: ["car wrap", "vinyl wrap", "رپ خودرو", "کاور بدنه خودرو", "wrapmode", "استودیو رپ"],
  openGraph: {
    title,
    description,
    type: "website",
    locale: "fa_IR",
    siteName: "Wrapmode Car Wrap Studio",
    url: "https://studio.wrapmode.ir",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#08080b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="ltr"
      className={`${grotesk.variable} ${vazir.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink">{children}</body>
    </html>
  );
}
