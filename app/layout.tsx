import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Football Admin",
    description: "Enkel frontend for football-backend",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="no">
        <body>{children}</body>
        </html>
    );
}
