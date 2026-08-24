"use client";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import numeral from "numeral";
import { useTranslation } from "@/lib/i18n";

export default function BasketBar({ cur, historyOrder }: any) {
  const { t } = useTranslation();
  const { totalItems, totalPrice } = useSelector((state: RootState) => state.cart);

  const displayPrice = historyOrder?.data ? (parseFloat(historyOrder.data.total_price || "0") + totalPrice) : totalPrice;
  const displayItems = historyOrder?.data ? (parseInt(historyOrder.data.totalItems || "0") + totalItems) : totalItems;

  return (
    <>
      <div className="flex space-x-1 rounded-full p-2 bg-orange text-[18px] max-[450px]:text-[17px] max-[415px]:text-[16px] text-white w-10/12 flex-row justify-between items-center">
        <div
          className="flex flex-row justify-between items-center w-full"
          onClick={() => {
            // Show modal only if there are items in the basket

            (document.getElementById("my_modal_3") as HTMLDialogElement).showModal();
          }
          }
        >
          <h1 className="text-nowrap font-dangrek text-white">{t("viewOrder")}</h1>
          <div className="max-[450px]:text-[17px] max-[415px]:text-[16px] flex items-center gap-x-3 text-[18px] text-white">
            <span>{cur || "$"}{numeral(displayPrice).format('0.[00]')}</span> {/* Sok Thean popup Component */}
            <p className="w-8 h-8 flex justify-center items-center bg-white text-orange rounded-full">
              {displayItems !== 0 ? displayItems : "0"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
