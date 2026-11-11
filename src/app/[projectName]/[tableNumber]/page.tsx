import MenuPageClient from "@/components/MenuPageClient";
import { getServerMenu, getServerOrderConfig, getServerSettings } from "@/lib/api";

export default async function TableMenuPage() {
  const [menuResult, settings, config] = await Promise.all([
    getServerMenu(),
    getServerSettings(),
    getServerOrderConfig(),
  ]);

  return (
    <MenuPageClient
      isOrderPage={true}
      initialMenu={menuResult.data}
      initialSettings={settings}
      initialConfig={config}
      initialAgeMs={menuResult.ageMs}
    />
  );
}
