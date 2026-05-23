import { DM_Sans } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata = {
  title: "FastCare",
  description: "A healthcare management system",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en" className="h-full antialiased">
        <body className={`${dmSans.className} min-h-full flex flex-col`}>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </body>
      </html>
  );
}