import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getPortfolioContent,
  savePortfolioContent,
} from "@/lib/portfolio-content";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }

  try {
    const content = await getPortfolioContent();
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json(
      { error: "Inhalte konnten nicht geladen werden." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await savePortfolioContent(body.content);

    revalidatePath("/");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Speichern fehlgeschlagen." },
      { status: 500 },
    );
  }
}
