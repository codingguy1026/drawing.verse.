import UniverseSettingsClient from "./settings-client";

export default async function UniverseSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <UniverseSettingsClient slug={slug} />;
}
