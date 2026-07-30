export const defaultTrackCategories = [
  { value: "combat", label: "Combat", color: "#ff4fd8", icon: "bolt" },
  { value: "atmosphere", label: "Atmosphere", color: "#00e5ff", icon: "orbit" },
  { value: "menu", label: "Menu", color: "#8b5cf6", icon: "grid" },
  { value: "story", label: "Story", color: "#ffd6ff", icon: "book" },
  { value: "game-over", label: "Game Over", color: "#67e8f9", icon: "cross" },
  { value: "personal", label: "Personal", color: "#a78bfa", icon: "sparkle" },
];

export const categoryIconOptions = [
  { value: "bolt", label: "Lightning" },
  { value: "orbit", label: "Orbit" },
  { value: "grid", label: "Grid" },
  { value: "book", label: "Book" },
  { value: "cross", label: "Cross" },
  { value: "sparkle", label: "Sparkle" },
  { value: "wave", label: "Wave" },
  { value: "disc", label: "Disc" },
  { value: "flame", label: "Flame" },
  { value: "target", label: "Target" },
  { value: "shield", label: "Shield" },
  { value: "heart", label: "Heart" },
  { value: "moon", label: "Moon" },
  { value: "sun", label: "Sun" },
  { value: "cafe", label: "Cafe" },
  { value: "gamepad", label: "Gamepad" },
  { value: "headphones", label: "Headphones" },
  { value: "note", label: "Music Note" },
  { value: "keyboard", label: "Keyboard" },
  { value: "pulse", label: "Pulse" },
  { value: "diamond", label: "Diamond" },
];

const categoryAliases = {
  ambient: "atmosphere",
};

const defaultCategoryIcons = Object.fromEntries(
  defaultTrackCategories.map((category) => [category.value, category.icon]),
);

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

export function normalizeCategoryIcon(value, fallback = "sparkle") {
  const icon = String(value || "").trim().toLowerCase();
  return categoryIconOptions.some((option) => option.value === icon) ? icon : fallback;
}

export function normalizeCategory(category, fallback = {}) {
  const fallbackValue = fallback.value || "personal";
  const fallbackLabel = fallback.label || labelFromCategoryValue(fallbackValue);
  const value = normalizeCategoryValue(category?.value || category?.label, fallbackValue);
  const label = String(category?.label || fallbackLabel || labelFromCategoryValue(value)).trim();
  const fallbackIcon = fallback.icon || defaultCategoryIcons[value] || "sparkle";

  return {
    value,
    label: label || labelFromCategoryValue(value),
    color: normalizeCategoryColor(category?.color, fallback.color || "#00e5ff"),
    icon: normalizeCategoryIcon(category?.icon, fallbackIcon),
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
