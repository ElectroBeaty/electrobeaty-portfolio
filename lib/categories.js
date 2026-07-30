export const defaultTrackCategories = [
  { value: "combat", label: "Combat", color: "#ff4fd8" },
  { value: "atmosphere", label: "Atmosphere", color: "#00e5ff" },
  { value: "menu", label: "Menu", color: "#8b5cf6" },
  { value: "story", label: "Story", color: "#ffd6ff" },
  { value: "game-over", label: "Game Over", color: "#67e8f9" },
  { value: "personal", label: "Personal", color: "#a78bfa" },
];

const categoryAliases = {
  ambient: "atmosphere",
};

export function slugifyCategory(value, fallback = "category") {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function normalizeCategoryValue(value, fallback = "personal") {
  const slug = slugifyCategory(value, fallback);
  return categoryAliases[slug] || slug;
}

export function labelFromCategoryValue(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeCategoryColor(value, fallback = "#00e5ff") {
  const color = String(value || "").trim();

  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${color
      .slice(1)
      .split("")
      .map((char) => `${char}${char}`)
      .join("")}`;
  }

  return fallback;
}

export function getCategoryInitials(label, value) {
  const source = String(label || value || "").trim();
  const words = source.split(/[\s-]+/).filter(Boolean);

  if (!words.length) return "CAT";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();

  return words
    .slice(0, 3)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export function normalizeCategory(category, fallback = {}) {
  const fallbackValue = fallback.value || "personal";
  const fallbackLabel = fallback.label || labelFromCategoryValue(fallbackValue);
  const value = normalizeCategoryValue(category?.value || category?.label, fallbackValue);
  const label = String(category?.label || fallbackLabel || labelFromCategoryValue(value)).trim();

  return {
    value,
    label: label || labelFromCategoryValue(value),
    color: normalizeCategoryColor(category?.color, fallback.color || "#00e5ff"),
  };
}

export function mergeCategories(...groups) {
  const merged = new Map();

  groups.flat().forEach((category) => {
    const normalized = normalizeCategory(category);
    if (!normalized.value) return;

    merged.set(normalized.value, {
      ...merged.get(normalized.value),
      ...normalized,
    });
  });

  return [...merged.values()];
}
