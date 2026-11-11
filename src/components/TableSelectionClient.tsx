"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { Loading } from "@/components/core";
import { RawTableRecord } from "@/lib/api";
import {
  fetchClientMenu,
  fetchClientOrderConfig,
  fetchClientSettings,
  fetchClientTables,
  seedClientCache,
} from "@/lib/clientApi";

type TableView = {
  id: string;
  name: string;
  zone: string;
  active?: string;
};

const FALLBACK_TABLES: TableView[] = [
  { id: "3", name: "A1", zone: "Zone A", active: "0" },
  { id: "4", name: "A2", zone: "Zone A", active: "0" },
  { id: "5", name: "A3", zone: "Zone A", active: "0" },
  { id: "6", name: "A4", zone: "Zone A", active: "0" },
  { id: "7", name: "A5", zone: "Zone A", active: "0" },
  { id: "8", name: "A6", zone: "Zone A", active: "0" },
  { id: "38", name: "A7", zone: "Zone A", active: "0" },
  { id: "10", name: "A8", zone: "Zone A", active: "0" },
  { id: "11", name: "A9", zone: "Zone A", active: "0" },
  { id: "41", name: "A10", zone: "Zone A", active: "0" },
  { id: "34", name: "A11", zone: "Zone A", active: "0" },
  { id: "14", name: "A12", zone: "Zone A", active: "0" },
  { id: "35", name: "A13", zone: "Zone A", active: "0" },
  { id: "16", name: "A14", zone: "Zone A", active: "0" },
  { id: "17", name: "B1", zone: "Zone B", active: "0" },
  { id: "18", name: "B2", zone: "Zone B", active: "0" },
  { id: "40", name: "B3", zone: "Zone B", active: "0" },
  { id: "42", name: "B4", zone: "Zone B", active: "0" },
  { id: "20", name: "B5", zone: "Zone B", active: "0" },
  { id: "21", name: "B6", zone: "Zone B", active: "0" },
  { id: "22", name: "B7", zone: "Zone B", active: "0" },
  { id: "23", name: "C1", zone: "Zone C", active: "0" },
  { id: "24", name: "C2", zone: "Zone C", active: "0" },
  { id: "25", name: "C3", zone: "Zone C", active: "0" },
  { id: "26", name: "C4", zone: "Zone C", active: "0" },
  { id: "28", name: "C5", zone: "Zone C", active: "0" },
  { id: "29", name: "C6", zone: "Zone C", active: "0" },
  { id: "30", name: "C7", zone: "Zone C", active: "0" },
  { id: "31", name: "C8", zone: "Zone C", active: "0" },
  { id: "32", name: "K1", zone: "Zone K", active: "0" },
  { id: "43", name: "VIP", zone: "VIP / Special", active: "0" },
  { id: "44", name: "KTV", zone: "VIP / Special", active: "0" },
  { id: "45", name: "Boat", zone: "VIP / Special", active: "0" },
];

function mapRawTables(raw: RawTableRecord[]): TableView[] {
  return raw.map((t) => {
    let zone = "Other Zone";
    if (t.floor_id === "1") zone = "Zone A";
    else if (t.floor_id === "2") zone = "Zone B";
    else if (t.floor_id === "3") zone = "Zone C";
    else if (t.floor_id === "4") zone = "Zone K";
    else if (t.floor_id === "5") zone = "VIP / Special";
    else {
      const upper = t.name.toUpperCase();
      if (upper.startsWith("A")) zone = "Zone A";
      else if (upper.startsWith("B")) zone = "Zone B";
      else if (upper.startsWith("C")) zone = "Zone C";
      else if (upper.startsWith("K")) zone = "Zone K";
      else if (["VIP", "KTV", "BOAT"].includes(upper)) zone = "VIP / Special";
    }
    return {
      id: t.id,
      name: t.name,
      zone,
      active: t.active,
    };
  });
}

type TableSelectionClientProps = {
  initialTables: RawTableRecord[] | null;
};

export default function TableSelectionClient({ initialTables }: TableSelectionClientProps) {
  const { projectName } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const hasInitialTables = Boolean(initialTables && initialTables.length > 0);
  const [loading, setLoading] = useState(!hasInitialTables);
  const [tables, setTables] = useState<TableView[]>(() =>
    initialTables && initialTables.length > 0 ? mapRawTables(initialTables) : []
  );
  const [selectedZone, setSelectedZone] = useState("All");

  useEffect(() => {
    if (!projectName) {
      setLoading(false);
      return;
    }

    if (initialTables && initialTables.length > 0) {
      seedClientCache("tables", initialTables);
    }

    let cancelled = false;
    // Refresh live occupied status in background without blocking initial display
    fetchClientTables(true)
      .then((fresh) => {
        if (cancelled) return;
        if (Array.isArray(fresh) && fresh.length > 0) {
          setTables(mapRawTables(fresh));
        } else if (!hasInitialTables) {
          setTables(FALLBACK_TABLES);
        }
      })
      .catch(() => {
        if (!cancelled && !hasInitialTables) {
          setTables(FALLBACK_TABLES);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectName, hasInitialTables, initialTables]);

  // Warm menu route & data cache during idle time while user selects a table
  useEffect(() => {
    if (!projectName) return;
    const proj = Array.isArray(projectName) ? projectName[0] : projectName;
    const timer = window.setTimeout(() => {
      router.prefetch(`/${proj}/menu`);
      fetchClientMenu().catch(() => {});
      fetchClientSettings().catch(() => {});
      fetchClientOrderConfig().catch(() => {});
    }, 300);
    return () => window.clearTimeout(timer);
  }, [projectName, router]);

  const zones = useMemo(() => {
    const uniqueZones = Array.from(new Set(tables.map((tbl) => tbl.zone)));
    return ["All", ...uniqueZones];
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (selectedZone === "All") return tables;
    return tables.filter((table) => table.zone === selectedZone);
  }, [selectedZone, tables]);

  const handleTableSelect = (tableId: string) => {
    router.push(`/${projectName}/${tableId}`);
  };

  if (loading) {
    return (
      <Loading className="h-screen fixed w-full z-100 bg-white top-0 flex justify-center items-center left-0" />
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6 font-battambong">
      <div className="w-full max-w-[575px] flex flex-col items-center text-center mt-4 mb-6">
        <p className="text-lg text-red-500 mt-2 max-w-[80%]">{t("selectTableSubtitle")}</p>
        <button
          onClick={() => router.push(`/${projectName}/menu`)}
          className="mt-3 inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm px-4 py-2 rounded-full text-sm font-medium transition-all hover:border-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="w-4 h-4 text-gray-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <span>{t("viewMenuOnly")}</span>
        </button>
      </div>

      <div className="w-full max-w-[575px] flex-1 flex flex-col gap-4">
        <div className="w-full overflow-x-auto no-scrollbar py-2">
          <ul className="flex flex-nowrap gap-2">
            {zones.map((zone) => {
              const displayZone =
                zone === "All"
                  ? t("allZones")
                  : zone === "VIP / Special"
                  ? t("vipZone")
                  : zone;
              const isActive = selectedZone === zone;
              return (
                <li key={zone}>
                  <button
                    onClick={() => setSelectedZone(zone)}
                    className={`text-nowrap px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 ${
                      isActive
                        ? "bg-black border-black text-white shadow-md transform -translate-y-[1px]"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {displayZone}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex-1 mt-2">
          {filteredTables.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filteredTables.map((table) => {
                const isOccupied = table.active === "1";
                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableSelect(table.id)}
                    className={`group relative flex flex-col justify-center items-center py-6 px-3 border rounded-2xl transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] shadow-sm ${
                      isOccupied
                        ? "bg-red-300 border-rose-200/80 hover:border-rose-400 text-white hover:shadow-[0_8px_20px_rgba(239,68,68,0.1)]"
                        : "bg-sky-50 hover:bg-sky-100/70 border-sky-200/80 hover:border-sky-400 text-sky-950 hover:shadow-[0_8px_20px_rgba(14,165,233,0.1)]"
                    }`}
                  >
                    <span
                      className={`absolute top-2 right-2 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isOccupied ? "bg-red-500 text-white animate-pulse" : "bg-sky-500 text-white"
                      }`}
                    >
                      {isOccupied ? t("occupied") : t("available")}
                    </span>

                    <svg
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`w-12 h-12 mb-2 transition-transform duration-300 group-hover:scale-105 ${
                        isOccupied ? "text-red-600" : "text-sky-600"
                      }`}
                    >
                      <path d="M12 20h6v18h-6z M12 28h6" />
                      <path d="M15 38v8" />
                      <path d="M46 20h6v18h-6z M46 28h6" />
                      <path d="M49 38v8" />
                      <path d="M22 26h20v4H22z" />
                      <path d="M25 30v16 M39 30v16" />
                    </svg>

                    <span
                      className={`text-xl font-black font-dangrek transition-colors duration-200 ${
                        isOccupied
                          ? "text-red-950 group-hover:text-red-600"
                          : "text-sky-950 group-hover:text-sky-600"
                      }`}
                    >
                      {table.name}
                    </span>

                    <span
                      className={`text-[10px] mt-0.5 font-medium tracking-wide ${
                        isOccupied ? "text-red-600/60" : "text-sky-600/60"
                      }`}
                    >
                      {table.zone === "VIP / Special" ? t("vipZone") : table.zone}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-gray-300 mb-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.5a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z"
                />
              </svg>
              <span className="text-gray-400 text-sm font-medium">No tables match your search.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

