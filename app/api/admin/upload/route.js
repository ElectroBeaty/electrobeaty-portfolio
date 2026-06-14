import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

const UPLOAD_RULES = {
  audio: {
    maxSize: 30 * 1024 * 1024,
    extensions: new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]),
    types: new Set([
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/ogg",
      "audio/mp4",
      "audio/aac",
      "audio/flac",
    ]),
  },
  image: {
    maxSize: 10 * 1024 * 1024,
    extensions: new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]),
    types: new Set([
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
    ]),
  },
};

function safeFileName(name) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || "upload";
}

function getExtension(name) {
  const match = String(name || "").toLowerCase().match(/\.[a-z0-9]+$/);
  return match?.[0] || "";
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN ist noch nicht gesetzt." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const type = formData.get("type") === "image" ? "image" : "audio";

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Keine Datei erhalten." }, { status: 400 });
  }

  const rules = UPLOAD_RULES[type];
  const extension = getExtension(file.name);
  if (!rules.types.has(file.type) && !rules.extensions.has(extension)) {
    return NextResponse.json(
      { error: "Dieser Dateityp ist nicht erlaubt." },
      { status: 400 },
    );
  }

  if (file.size > rules.maxSize) {
    const maxMegabytes = Math.floor(rules.maxSize / 1024 / 1024);
    return NextResponse.json(
      { error: `Die Datei ist zu gross. Maximum: ${maxMegabytes} MB.` },
      { status: 400 },
    );
  }

  const filename = safeFileName(file.name || "upload");
  const blob = await put(`uploads/${type}/${Date.now()}-${filename}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
