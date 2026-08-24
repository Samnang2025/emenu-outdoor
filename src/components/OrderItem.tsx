import React, { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import Item from "./Item";
import { Footer } from "./core";
import { clearCart } from "@/lib/cart/cartSlice";
import HistoryOrder from "./HistoryOrder";
import numeral from "numeral";
import { useParams } from "next/navigation";
import axios from "axios";
import { orderHistoryType } from "@/types/model";
import { toast } from 'react-toastify';
import { useTranslation } from "@/lib/i18n";


export default function OrderItem({ cur, historyOrder, setHistoryOrder, isClickOrder, setClickOrder }: any) {
  const { t } = useTranslation();
  const { projectName, tableNumber } = useParams()
  const [isLoading, setIsLoading] = useState(false);

  const { items: basket, totalItems, totalPrice } = useSelector((state: RootState) => state.cart);

  const dispatch = useDispatch()

  // Fetch table name fallback if history order is null
  const [tableName, setTableName] = useState("");

  useEffect(() => {
    if (historyOrder?.data?.table_name) {
      setTableName(historyOrder.data.table_name);
    } else if (tableNumber) {
      const fetchTableName = async () => {
        try {
          const res = await axios.get(`https://tonle-coffee.pos.tsdsolution.net/api/DriverController/tables`);
          if (res.data && Array.isArray(res.data)) {
            const currentTable = res.data.find((t: any) => t.id === tableNumber);
            if (currentTable) {
              setTableName(currentTable.name);
            }
          }
        } catch (e) {
          console.error("Error fetching table name", e);
        }
      };
      fetchTableName();
    }
  }, [historyOrder, tableNumber]);

  // my code old

  const handleOrder = async () => {
    setIsLoading(true);
    const loading = toast.info("កំពុងធ្វើការកុម្ម៉ង់...", {
      autoClose: 2000,
      position: "top-center",
      className: "font-battambang"

    });

    const product = basket.map(({ id, quantity, comment }) => ({
      id: id,
      quantity: quantity,
      comment: comment || null,
    }));

    try {
      const data = {
        data: {
          id: historyOrder ? historyOrder?.data.id : null,
          suspend_note: historyOrder ? historyOrder?.data.suspend_note : null,
          table_id: tableNumber,
        },
        items: product,
      };
      const jsonData = JSON.stringify(data)
      const response = await axios.post(
        `https://tonle-coffee.pos.tsdsolution.net/api/DriverController/order`,
        jsonData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      toast.dismiss(loading)
      toast.success("ការកុម្ម៉ង់ទទួលបានជោគជ័យ!", {
        autoClose: 2000,
        position: "top-center",
        className: "font-battambong"
      });

      // end akk
      dispatch(clearCart());
      setClickOrder(!isClickOrder);

    } catch (error) {
      console.error('Error sending order:', error);
      toast.dismiss(loading)
      toast.error("ការកុំម្ម៉ង់បរាជ័យ! សូមព្យាយាមម្តងទៀត!", {
        autoClose: 2000,
        position: "top-center",
        className: "font-battambong"
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {/* You can open the modal using document.getElementById('ID').showModal() method */}

      <dialog id={"my_modal_3"} className={`modal backdrop-blur-[2px]`}>
        <div className="modal-box p-0 bg-white text-gray-900">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn  btn-sm btn-circle btn-ghost absolute right-2 top-2 text-xl  z-10">
              ✕
            </button>
          </form>
          <div className="flex flex-col h-[100vh]  items-center relative ">
            <div>
              <h1 className="text-center font-dangrek p-2 text-xl"> {t("orderSummary")}<br />
                <span className="text-orange-400">{tableName}</span></h1>
            </div>
            <div className="w-full bg-transparent border-[1px] border-dashed border-black"></div>
            <div className="w-full px-4">

              {/* new order  */}
              {basket.length == 0 ? (<></>) : <h1 className="text-center font-dangrek p-2 mb-5">{t("newOrder")}</h1>}
              {/* item cart  */}
              {
                basket.map((item, index) => (
                  <Item key={index} cartItem={item} cur={cur} index={index} />
                ))
              }
            </div>
            {basket.length == 0 ? (<></>) : (<button onClick={handleOrder} className="bg-orange font-dangrek p-2 px-5 rounded-full text-white mt-2">{t("placeOrder")}</button>)}

            {/* history order section  */}
            {historyOrder ? (
              <div className="w-full px-3 ">
                <h1 className="font-dangrek text-center mt-5">{t("completedOrder")}</h1>
                <div className="flex flex-col w-full space-y-3">
                  {
                    historyOrder?.items?.map((item: any, index: any) => (
                      <HistoryOrder key={index} cartItem={item} cur={cur} index={index} />
                    ))
                  }
                </div>
              </div>
            ) : (<></>)
            }
            {/* summary section  */}
            <div className="w-full flex flex-col space-y-2 p-3">
              <p className="text-lg flex flex-row justify-between">
                <span className="font-dangrek  " >{t("totalItems")}:</span>
                <span className="font-bold">{historyOrder ? parseInt(historyOrder.data.totalItems) + totalItems : totalItems}</span>
              </p>
              <p className="text-xl flex flex-row text-orange-500  justify-between">
                <span className="font-dangrek  " >{t("totalAmount")}:</span>
                <span className="font-bold">{cur || "$"}{historyOrder ? numeral(parseFloat(historyOrder.data.total_price) + totalPrice).format('0.[00]') : numeral(totalPrice).format('0.[00]')}</span>
              </p>
            </div>
            <div className="mt-5">
              <Footer></Footer>
            </div>
          </div>

        </div>
      </dialog>
    </>
  );
}


