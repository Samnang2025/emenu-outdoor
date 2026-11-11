import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import Item from "./Item";
import { Footer } from "./core";
import { clearCart } from "@/lib/cart/cartSlice";
import HistoryOrder from "./HistoryOrder";
import numeral from "numeral";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslation } from "@/lib/i18n";
import { RawTableRecord } from "@/lib/api";
import { fetchClientTables, getCachedClientEntry, submitTableOrder } from "@/lib/clientApi";

export default function OrderItem({
  cur,
  historyOrder,
  historyOrderLoaded = false,
  isClickOrder,
  setClickOrder,
}: any) {
  const { t } = useTranslation();
  const { tableNumber } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const { items: basket, totalItems, totalPrice } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const [tableName, setTableName] = useState(() => {
    if (historyOrder?.data?.table_name) return historyOrder.data.table_name;
    const cachedTables = getCachedClientEntry<RawTableRecord[]>("tables")?.data;
    const match = cachedTables?.find((item) => item.id === tableNumber);
    return match?.name || "";
  });

  useEffect(() => {
    if (historyOrder?.data?.table_name) {
      setTableName(historyOrder.data.table_name);
      return;
    }

    const tblNum = Array.isArray(tableNumber) ? tableNumber[0] : tableNumber;
    if (!historyOrderLoaded || !tblNum) return;

    let cancelled = false;
    fetchClientTables()
      .then((tables) => {
        if (cancelled || !Array.isArray(tables)) return;
        const currentTable = tables.find((tbl) => tbl.id === tblNum);
        if (currentTable) {
          setTableName(currentTable.name);
        }
      })
      .catch((e) => {
        console.error("Error fetching table name", e);
      });

    return () => {
      cancelled = true;
    };
  }, [historyOrder, historyOrderLoaded, tableNumber]);

  const handleOrder = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const loadingToast = toast.info("កំពុងធ្វើការកុម្ម៉ង់...", {
      autoClose: 2000,
      position: "top-center",
      className: "font-battambong",
    });

    const product = basket.map(({ id, quantity, comment }) => ({
      id,
      quantity,
      comment: comment || null,
    }));

    try {
      const payload = {
        data: {
          id: historyOrder?.data?.id ?? null,
          suspend_note: historyOrder?.data?.suspend_note ?? null,
          table_id: tableNumber,
        },
        items: product,
      };
      await submitTableOrder(payload);

      toast.dismiss(loadingToast);
      toast.success("ការកុម្ម៉ង់ទទួលបានជោគជ័យ!", {
        autoClose: 2000,
        position: "top-center",
        className: "font-battambong",
      });

      dispatch(clearCart());
      setClickOrder(!isClickOrder);
    } catch (error) {
      console.error("Error sending order:", error);
      toast.dismiss(loadingToast);
      toast.error("ការកុំម្ម៉ង់បរាជ័យ! សូមព្យាយាមម្តងទៀត!", {
        autoClose: 2000,
        position: "top-center",
        className: "font-battambong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <dialog id="my_modal_3" className="modal backdrop-blur-[2px]">
        <div className="modal-box p-0 bg-white text-gray-900">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-xl z-10">
              ✕
            </button>
          </form>
          <div className="flex flex-col h-[100vh] items-center relative">
            <div>
              <h1 className="text-center font-dangrek p-2 text-xl">
                {t("orderSummary")}
                <br />
                <span className="text-orange-400">{tableName}</span>
              </h1>
            </div>
            <div className="w-full bg-transparent border-[1px] border-dashed border-black"></div>
            <div className="w-full px-4">
              {basket.length === 0 ? (
                <></>
              ) : (
                <h1 className="text-center font-dangrek p-2 mb-5">{t("newOrder")}</h1>
              )}
              {basket.map((item, index) => (
                <Item key={item.cartItemId || index} cartItem={item} cur={cur} index={index} />
              ))}
            </div>
            {basket.length === 0 ? (
              <></>
            ) : (
              <button
                onClick={handleOrder}
                disabled={isLoading}
                className="bg-black font-dangrek p-2 px-5 rounded-full text-white mt-2 disabled:opacity-60"
              >
                {t("placeOrder")}
              </button>
            )}

            {historyOrder?.data ? (
              <div className="w-full px-3">
                <h1 className="font-dangrek text-center mt-5">{t("completedOrder")}</h1>
                <div className="flex flex-col w-full space-y-3">
                  {historyOrder?.items?.map((item: any, index: number) => (
                    <HistoryOrder key={`${item.id}-${index}`} cartItem={item} cur={cur} index={index} />
                  ))}
                </div>
              </div>
            ) : (
              <></>
            )}

            <div className="w-full flex flex-col space-y-2 p-3">
              <p className="text-lg flex flex-row justify-between">
                <span className="font-dangrek">{t("totalItems")}:</span>
                <span className="font-bold">
                  {historyOrder?.data
                    ? parseInt(historyOrder.data.totalItems || "0", 10) + totalItems
                    : totalItems}
                </span>
              </p>
              <p className="text-xl flex flex-row text-orange-500 justify-between">
                <span className="font-dangrek">{t("totalAmount")}:</span>
                <span className="font-bold">
                  {cur || "$"}
                  {historyOrder?.data
                    ? numeral(parseFloat(historyOrder.data.total_price || "0") + totalPrice).format("0.[00]")
                    : numeral(totalPrice).format("0.[00]")}
                </span>
              </p>
            </div>
            <div className="mt-5">
              <Footer />
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
