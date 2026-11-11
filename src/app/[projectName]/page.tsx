import TableSelectionClient from "@/components/TableSelectionClient";

export function generateStaticParams() {
  return [{ projectName: "u" }];
}

export default function TableSelectionPage() {
  return <TableSelectionClient initialTables={null} />;
}
