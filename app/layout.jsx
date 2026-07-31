import "./globals.css";

const title = "ElectroBeaty - Game Music Portfolio";
const description =
  "Game audio, emotional tracks, label releases, project updates, and mascot fanart by ElectroBeaty.";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://electrobeaty-portfolio.vercel.app",
  ),
  applicationName: "ElectroBeaty Portfolio",
  title: {
    default: title,
    template: "%s | ElectroBeaty",
  },
  description,
  keywords: [
    "ElectroBeaty",
    "game music",
    "game audio",
    "composer",
    "anime music",
    "SVPACYBERIA",
    "MOE DANCEFLOOR",
  ],
  creator: "ElectroBeaty",
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "ElectroBeaty",
    images: [
      {
        url: "/profilbild.png",
        width: 500,
        height: 500,
        alt: "ElectroBeaty profile artwork",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/profilbild.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/profilbild.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
