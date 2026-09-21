import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pravopis.io — hrvatski asistent za pisanje",
  description:
    "AI asistent za pisanje na hrvatskom jeziku — pravopis, gramatika, stil i ton u stvarnom vremenu.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hr">
      <body>{children}</body>
    </html>
  );
}
