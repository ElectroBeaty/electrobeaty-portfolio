import { list, put } from "@vercel/blob";
import { seedPortfolioContent } from "@/lib/seed-data";

const CONTENT_PREFIX = "portfolio/content-";

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function normalizePortfolioContent(content) {
  return {
    projects: Array.isArray(content?.projects) ? content.projects : [],
    featuredTrack: content?.featuredTrack || seedPortfolioContent.featuredTrack,
    gameTracks: Array.isArray(content?.gameTracks) ? content.gameTracks : [],
    personalTracks: Array.isArray(content?.personalTracks)
      ? content.personalTracks
      : [],
    fanart: Array.isArray(content?.fanart) ? content.fanart : [],
    contactLinks: Array.isArray(content?.contactLinks) ? content.contactLinks : [],
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
