import MenuPageClient from "@/components/MenuPageClient";
import { getServerMenu, getServerOrderConfig, getServerSettings } from "@/lib/api";

export default async function ViewOnlyMenuPage() {
  const [menuResult, settings, config] = await Promise.all([
    getServerMenu(),
    getServerSettings(),
    getServerOrderConfig(),
  ]);

  return (
    <MenuPageClient
      isOrderPage={false}
      initialMenu={menuResult.data}
      initialSettings={settings}
      initialConfig={config}
      initialAgeMs={menuResult.ageMs}
    />
  );
}
