import { Syncopate, Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Providers } from "../providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const syncopate = Syncopate({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-syncopate",
});

const inter = Inter({
  weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Master Bingo | O bingo para eventos, festas e streams",
  description: "Master Bingo — organize rodadas de bingo em tempo real para eventos, festas e streams.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      className={`${syncopate.variable} ${inter.variable}`}
    >
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
        <style dangerouslySetInnerHTML={{__html: `
          ::placeholder { color: rgba(255,255,255,0.6) !important; opacity: 1 !important; }
        `}} />
      </head>
      <body>
        <Providers>
          <div className="min-vh-100 d-flex flex-column" style={{ 
            background: 'radial-gradient(circle at top right, #0a192f, #020617)', 
            color: 'white',
            overflowX: 'hidden'
          }}>
            <Header />
            <main className="flex-grow-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
