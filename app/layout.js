import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FinTrak",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/logo-sm.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />

          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600 space-y-2">
              <p className="text-shadow-sky-300">Made with 💗 by DjDanger</p>
              <p className="text-xs"><b>Disclaimer:</b> This is a personal, non-commercial project and is not affiliated with, endorsed by, or associated with any company using the &quot;FinTrak&quot;.</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}