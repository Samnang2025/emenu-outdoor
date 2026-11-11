import MenuPageClient from "@/components/MenuPageClient";

export function generateStaticParams() {
  return [{ projectName: "u" }];
}

export default function ViewOnlyMenuPage() {
  return (
    <MenuPageClient
      isOrderPage={false}
      initialMenu={null}
      initialSettings={null}
      initialConfig={null}
    />
  );
}
