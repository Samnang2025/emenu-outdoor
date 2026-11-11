import MenuPageClient from "@/components/MenuPageClient";

export function generateStaticParams() {
  return Array.from({ length: 60 }, (_, index) => ({
    projectName: "u",
    tableNumber: String(index + 1),
  }));
}

export default function TableMenuPage() {
  return (
    <MenuPageClient
      isOrderPage={true}
      initialMenu={null}
      initialSettings={null}
      initialConfig={null}
    />
  );
}
