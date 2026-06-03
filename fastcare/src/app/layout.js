import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import AuthProvider from "@/components/AuthProvider";
import Footer from "@/components/Footer";

const inter = Inter({subsets:["latin"]});

export const metadata = {
  title: "FastCare",
  description: "A AI Powered healthcare management system",
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/*header*/}
            <Header/>
          <main className="min-h-screen">{children}</main>
          {/*footer*/}
           <Footer/>
          </ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}