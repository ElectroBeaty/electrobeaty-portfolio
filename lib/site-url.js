const preferredSiteUrl = "https://www.electrobeaty.com";
const legacyHostnames = ["electrobeaty.vercel.app", "electrobeaty-portfolio.vercel.app"];

export function getSiteUrl() {
  const configuredSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || preferredSiteUrl).replace(/\/$/, "");

  return legacyHostnames.some((hostname) => configuredSiteUrl.includes(hostname))
    ? preferredSiteUrl
    : configuredSiteUrl;
}
