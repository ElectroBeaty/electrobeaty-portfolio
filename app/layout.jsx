import "./globals.css";

const preferredSiteUrl = "https://electrobeaty.vercel.app";
const configuredSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || preferredSiteUrl).replace(/\/$/, "");
const siteUrl = configuredSiteUrl.includes("electrobeaty-portfolio.vercel.app")
  ? preferredSiteUrl
  : configuredSiteUrl;
const title = "ElectroBeaty - Game Music Portfolio";
const description =
  "ElectroBeaty is an Austrian electronic music composer and producer creating funky, anime-inspired, and J-core-heavy electronic music, with recent work in game audio.";
const profileImage = `${siteUrl}/profilbild.png`;
const socialLinks = [
  "https://www.youtube.com/@ElectroBeaty",
  "https://open.spotify.com/intl-de/artist/75g7C74FQ7UaWhFqH0viPC",
  "https://soundcloud.com/electrobeaty",
  "https://www.instagram.com/erik_hrdl/",
  "https://linktr.ee/electrobeaty",
  "https://ebeaty.itch.io",
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#electrobeaty`,
      name: "ElectroBeaty",
      alternateName: ["EBeaty", "Beaty"],
      url: siteUrl,
      image: profileImage,
      description,
      jobTitle: "Electronic music composer and producer",
      nationality: {
        "@type": "Country",
        name: "Austria",
      },
      knowsAbout: [
        "electronic music production",
        "funky electronic music",
        "anime-inspired music",
        "J-core",
        "game audio",
        "video game music",
        "cinematic music",
        "experimental sound design",
      ],
      sameAs: socialLinks,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "ElectroBeaty",
      description,
      publisher: {
        "@id": `${siteUrl}/#electrobeaty`,
      },
      inLanguage: "en",
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: title,
      description,
      isPartOf: {
        "@id": `${siteUrl}/#website`,
      },
      mainEntity: {
        "@id": `${siteUrl}/#electrobeaty`,
      },
      about: {
        "@id": `${siteUrl}/#electrobeaty`,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: profileImage,
      },
      inLanguage: "en",
    },
  ],
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "ElectroBeaty Portfolio",
  title: {
    default: title,
    template: "%s | ElectroBeaty",
  },
  description,
  keywords: [
    "ElectroBeaty",
    "EBeaty",
    "Beaty",
    "Austrian electronic music composer",
    "funky electronic music",
    "anime inspired music",
    "J-core",
    "game music",
    "game audio",
    "video game music composer",
    "composer",
    "electronic music producer",
    "anime music",
    "SVPACYBERIA",
    "MOE DANCEFLOOR",
  ],
  creator: "ElectroBeaty",
  authors: [{ name: "ElectroBeaty", url: siteUrl }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
    locale: "en_US",
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
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
