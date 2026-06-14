import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

function safeFileName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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

  const filename = safeFileName(file.name || "upload");
  const blob = await put(`uploads/${type}/${Date.now()}-${filename}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
