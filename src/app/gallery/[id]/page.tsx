import GalleryDetailClient from "./gallery-detail-client";

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GalleryDetailClient id={id} />;
}
