import "./globals.css";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://electrobeaty-portfolio.vercel.app",
  ),
  title: "electrobeaty - Game Music Portfolio",
  description:
    "Game music, emotional tracks, project work, and fanart by electrobeaty.",
  openGraph: {
    title: "electrobeaty - Game Music Portfolio",
    description:
      "Game music, emotional tracks, project work, and fanart by electrobeaty.",
    images: ["/profilbild.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
