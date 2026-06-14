import { NextResponse } from "next/server";
import { getAdminPassword, setAdminSession } from "@/lib/auth";

export async function POST(request) {
  const { password } = await request.json();
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD ist noch nicht gesetzt." },
      { status: 500 },
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
