import "./globals.css";
import Providers from "@/components/Providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automated Timetable System",
  description: "FYP Prototype",
  icons: {
    icon: "/faviconVU.png", // will automatically resolve from public/
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
