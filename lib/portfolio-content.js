import { list, put } from "@vercel/blob";
import { seedPortfolioContent } from "@/lib/seed-data";

const CONTENT_PREFIX = "portfolio/content-";
const FALLBACK_HREF = "#";

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function cleanString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function cleanList(value) {
  return Array.isArray(value) ? value.map((item) => cleanString(item)).filter(Boolean) : [];
}

function safeHref(value) {
  const url = cleanString(value);
  if (!url) return FALLBACK_HREF;

  if (
    url.startsWith("#") ||
    url.startsWith("/") ||
    url.startsWith("https://") ||
    url.startsWith("http://") ||
    url.startsWith("mailto:")
  ) {
    return url;
  }

  return FALLBACK_HREF;
}

function safeMediaUrl(value) {
  const url = cleanString(value);
  if (!url) return "";

  if (url.startsWith("/") || url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }

  return "";
}

function normalizeLinks(links) {
  return Array.isArray(links)
    ? links
        .map((link) => ({
          label: cleanString(link?.label, "Link"),
          href: safeHref(link?.href),
        }))
        .filter((link) => link.label)
    : [];
}

function normalizeTrack(track, fallback = {}) {
  const source = track || fallback;
  return {
    title: cleanString(source.title, fallback.title || "Untitled Track"),
    badge: cleanString(source.badge),
    description: cleanString(source.description),
    file: safeMediaUrl(source.file || fallback.file),
    category: cleanString(source.category, fallback.category || "personal"),
    tags: cleanList(source.tags),
    kicker: cleanString(source.kicker, fallback.kicker || ""),
  };
}

function normalizeProject(project) {
  return {
    status: cleanString(project?.status),
    title: cleanString(project?.title, "Untitled Project"),
    description: cleanString(project?.description),
    note: cleanString(project?.note),
    links: normalizeLinks(project?.links),
  };
}

function normalizeFanart(item) {
  return {
    title: cleanString(item?.title, "Untitled Artwork"),
    description: cleanString(item?.description),
    image: safeMediaUrl(item?.image),
    artist: cleanString(item?.artist),
    credit: cleanString(item?.credit),
    artistLinks: normalizeLinks(item?.artistLinks),
    versionsTitle: cleanString(item?.versionsTitle),
    versions: cleanList(item?.versions).map(safeMediaUrl).filter(Boolean),
    note: cleanString(item?.note),
  };
}

export function normalizePortfolioContent(content) {
  return {
    projects: Array.isArray(content?.projects)
      ? content.projects.map(normalizeProject)
      : seedPortfolioContent.projects,
    featuredTrack: normalizeTrack(
      content?.featuredTrack,
      seedPortfolioContent.featuredTrack,
    ),
    gameTracks: Array.isArray(content?.gameTracks)
      ? content.gameTracks.map((track) => normalizeTrack(track))
      : seedPortfolioContent.gameTracks,
    personalTracks: Array.isArray(content?.personalTracks)
      ? content.personalTracks.map((track) => normalizeTrack(track))
      : seedPortfolioContent.personalTracks,
    fanart: Array.isArray(content?.fanart)
      ? content.fanart.map(normalizeFanart)
      : seedPortfolioContent.fanart,
    contactLinks: normalizeLinks(content?.contactLinks || seedPortfolioContent.contactLinks),
  };
}

async function getLatestContentUrl() {
  if (!hasBlobToken()) return null;

  const result = await list({ prefix: CONTENT_PREFIX, limit: 100 });
  const latest = result.blobs
    .filter((blob) => blob.pathname.endsWith(".json"))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];

  return latest?.url || null;
}

export async function getPortfolioContent() {
  try {
    const url = process.env.PORTFOLIO_CONTENT_URL || (await getLatestContentUrl());
    if (!url) return seedPortfolioContent;

    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return seedPortfolioContent;

    const content = await response.json();
    return normalizePortfolioContent(content);
  } catch {
    return seedPortfolioContent;
  }
}

export async function savePortfolioContent(content) {
  if (!hasBlobToken()) {
    throw new Error("BLOB_READ_WRITE_TOKEN fehlt.");
  }

  const normalized = normalizePortfolioContent(content);
  const filename = `${CONTENT_PREFIX}${Date.now()}.json`;

  const blob = await put(filename, JSON.stringify(normalized, null, 2), {
    access: "public",
    contentType: "application/json",
  });

  return { content: normalized, url: blob.url };
}
