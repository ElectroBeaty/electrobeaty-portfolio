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

  const content = await getPortfolioContent();
  return NextResponse.json({ content });
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }

  const body = await request.json();
  const result = await savePortfolioContent(body.content);

  revalidatePath("/");
  return NextResponse.json(result);
}
