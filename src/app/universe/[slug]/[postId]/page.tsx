import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string; postId: string }>;
};

export default async function LegacyUniversePostPage({ params }: PageProps) {
  const { postId } = await params;
  redirect(`/post/${postId}`);
}
