import TableSelectionClient from "@/components/TableSelectionClient";
import { getServerTables } from "@/lib/api";

export default async function TableSelectionPage() {
  const tables = await getServerTables();

  return <TableSelectionClient initialTables={tables} />;
}
