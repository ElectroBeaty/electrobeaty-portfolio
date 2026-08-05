import { list, put } from "@vercel/blob";
import { seedPortfolioContent } from "@/lib/seed-data";
import {
  getBlobStorageErrorMessage,
  hasBlobStorageConfig,
} from "@/lib/blob-storage";
import {
  defaultTrackCategories,
  labelFromCategoryValue,
  mergeCategories,
  normalizeCategory,
  normalizeCategoryColor,
  normalizeCategoryValue,
} from "@/lib/categories";

const CONTENT_PREFIX = "portfolio/content-";
const FALLBACK_HREF = "#";
const ITCH_HOST_SUFFIX = "itch.io";
const PREVIEW_REVALIDATE_SECONDS = 86400;
const ANIMA_FIGHT_SOUNDTRACK_URL =
  "https://electrobeaty.bandcamp.com/album/anima-fight-original-soundtrack";
const ANIMA_FIGHT_SOUNDTRACK_LABEL = "Full OST";

function cleanString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function cleanList(value) {
  return Array.isArray(value) ? value.map((item) => cleanString(item)).filter(Boolean) : [];
}

function safeHref(value) {
  let url = cleanString(value);
  if (!url) return FALLBACK_HREF;

  if (/^#https?:\/\//i.test(url)) {
    url = url.slice(1);
  }

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

function normalizeProjectStatus(value) {
  const status = cleanString(value);
  const normalized = status.toLowerCase();

  if (normalized === "game project - in progress") return "PRIVATE GAME AUDIO";
  if (normalized === "game project - released") return "RELEASED GAME PROJECT";

  return status;
}

function normalizeProjectDescription(value) {
  const description = cleanString(value);

  if (description === "Currently working on story and menu music.") {
    return "Story and menu music for an unreleased cafe project.";
  }

  return description;
}

function normalizeProjectNote(value) {
  const note = cleanString(value);

  if (note === "Not released yet") {
    return "Preview will be added when the project is public.";
  }

  return note;
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

function normalizeProjectLinks(project, links) {
  const withoutInternalTracks = links.filter((link) => {
    const label = link.label.toLowerCase();
    return !(link.href === "#music" || (label === "tracks" && link.href.startsWith("#")));
  });
  const title = cleanString(project?.title).toLowerCase();

  if (title !== "anima fight") return withoutInternalTracks;

  const hasSoundtrackLink = withoutInternalTracks.some(
    (link) => link.href === ANIMA_FIGHT_SOUNDTRACK_URL,
  );
  const linksWithSoundtrack = hasSoundtrackLink
    ? withoutInternalTracks.map((link) =>
        link.href === ANIMA_FIGHT_SOUNDTRACK_URL
          ? { ...link, label: ANIMA_FIGHT_SOUNDTRACK_LABEL }
          : link,
      )
    : [
        ...withoutInternalTracks,
        { label: ANIMA_FIGHT_SOUNDTRACK_LABEL, href: ANIMA_FIGHT_SOUNDTRACK_URL },
      ];

  return [
    ...linksWithSoundtrack.filter((link) => link.href !== ANIMA_FIGHT_SOUNDTRACK_URL),
    ...linksWithSoundtrack.filter((link) => link.href === ANIMA_FIGHT_SOUNDTRACK_URL),
  ];
}

function normalizeTrack(track, fallback = {}) {
  const source = track || fallback;
  const category = normalizeCategoryValue(source.category, fallback.category || "personal");
  return {
    title: cleanString(source.title, fallback.title || "Untitled Track"),
    badge: cleanString(source.badge),
    description: cleanString(source.description),
    file: safeMediaUrl(source.file || fallback.file),
    category,
    tags: cleanList(source.tags),
    kicker: cleanString(source.kicker, fallback.kicker || ""),
  };
}

function categoryFromTrack(track) {
  const value = normalizeCategoryValue(track?.category);
  const defaultCategory = defaultTrackCategories.find((category) => category.value === value);
  const label = cleanString(track?.tags?.[0], defaultCategory?.label || labelFromCategoryValue(value));

  return {
    value,
    label,
    color: normalizeCategoryColor(defaultCategory?.color),
    icon: defaultCategory?.icon,
  };
}

function normalizeCategories(content, normalizedTracks) {
  const savedCategories = Array.isArray(content?.categories)
    ? content.categories.map((category) => normalizeCategory(category))
    : [];
  const usedCategories = normalizedTracks
    .filter(Boolean)
    .map(categoryFromTrack);

  return mergeCategories(defaultTrackCategories, usedCategories, savedCategories);
}

function normalizeProject(project) {
  const links = normalizeLinks(project?.links);

  return {
    status: normalizeProjectStatus(project?.status),
    title: cleanString(project?.title, "Untitled Project"),
    description: normalizeProjectDescription(project?.description),
    note: normalizeProjectNote(project?.note),
    date: cleanString(project?.date),
    image: safeMediaUrl(project?.image),
    links: normalizeProjectLinks(project, links),
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
  const featuredTrack = normalizeTrack(
    content?.featuredTrack,
    seedPortfolioContent.featuredTrack,
  );
  const gameTracks = Array.isArray(content?.gameTracks)
    ? content.gameTracks.map((track) => normalizeTrack(track))
    : seedPortfolioContent.gameTracks;
  const personalTracks = Array.isArray(content?.personalTracks)
    ? content.personalTracks.map((track) => normalizeTrack(track))
    : seedPortfolioContent.personalTracks;
  const categories = normalizeCategories(content, [featuredTrack, ...gameTracks, ...personalTracks]);

  return {
    categories,
    projects: Array.isArray(content?.projects)
      ? content.projects.map(normalizeProject)
      : seedPortfolioContent.projects,
    featuredTrack,
    gameTracks,
    personalTracks,
    fanart: Array.isArray(content?.fanart)
      ? content.fanart.map(normalizeFanart)
      : seedPortfolioContent.fanart,
    contactLinks: normalizeLinks(content?.contactLinks || seedPortfolioContent.contactLinks),
  };
}

function decodeHtmlAttribute(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#039;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function findMetaImage(html, pageUrl) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];

  for (const tag of metaTags) {
    const isPreviewMeta = /\b(?:property|name)=["'](?:og:image|twitter:image)["']/i.test(tag);
    if (!isPreviewMeta) continue;

    const content = tag.match(/\bcontent=["']([^"']+)["']/i)?.[1];
    if (!content) continue;

    try {
      return new URL(decodeHtmlAttribute(content), pageUrl).toString();
    } catch {
      return "";
    }
  }

  return "";
}

function getItchProjectUrl(project) {
  const links = Array.isArray(project.links) ? project.links : [];

  for (const link of links) {
    try {
      const url = new URL(link.href);
      if (url.hostname === ITCH_HOST_SUFFIX || url.hostname.endsWith(`.${ITCH_HOST_SUFFIX}`)) {
        return url.toString();
      }
    } catch {
      // Ignore non-URL project anchors.
    }
  }

  return "";
}

async function fetchPreviewImage(url) {
  if (!url) return "";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ElectroBeaty portfolio preview bot",
      },
      next: { revalidate: PREVIEW_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(2500),
    });

    if (!response.ok) return "";

    const html = await response.text();
    return safeMediaUrl(findMetaImage(html, url));
  } catch {
    return "";
  }
}

async function enrichProjectPreviewImages(content) {
  const projects = await Promise.all(
    content.projects.map(async (project) => {
      if (project.image) return project;

      const previewImage = await fetchPreviewImage(getItchProjectUrl(project));
      return previewImage ? { ...project, previewImage } : project;
    }),
  );

  return { ...content, projects };
}

async function getLatestContentUrl() {
  if (!hasBlobStorageConfig()) return null;

  const result = await list({ prefix: CONTENT_PREFIX, limit: 100 });
  const latest = result.blobs
    .filter((blob) => blob.pathname.endsWith(".json"))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];

  return latest?.url || null;
}

export async function getPortfolioContent() {
  try {
    const url = process.env.PORTFOLIO_CONTENT_URL || (await getLatestContentUrl());
    if (!url) return enrichProjectPreviewImages(normalizePortfolioContent(seedPortfolioContent));

    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return enrichProjectPreviewImages(normalizePortfolioContent(seedPortfolioContent));

    const content = await response.json();
    return enrichProjectPreviewImages(normalizePortfolioContent(content));
  } catch {
    return normalizePortfolioContent(seedPortfolioContent);
  }
}

export async function savePortfolioContent(content) {
  const normalized = normalizePortfolioContent(content);
  const filename = `${CONTENT_PREFIX}${Date.now()}.json`;

  try {
    const blob = await put(filename, JSON.stringify(normalized, null, 2), {
      access: "public",
      contentType: "application/json",
    });

    return { content: normalized, url: blob.url };
  } catch (error) {
    throw new Error(getBlobStorageErrorMessage(error));
  }
}
