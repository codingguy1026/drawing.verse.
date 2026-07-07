import UniverseDetailClient from "./universe-detail-client";

export default async function UniverseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <UniverseDetailClient slug={slug} />;
}
