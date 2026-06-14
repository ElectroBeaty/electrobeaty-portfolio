import { Portfolio } from "@/components/Portfolio";
import { getPortfolioContent } from "@/lib/portfolio-content";

export const revalidate = 60;

export default async function HomePage() {
  const content = await getPortfolioContent();

  return <Portfolio content={content} />;
}
