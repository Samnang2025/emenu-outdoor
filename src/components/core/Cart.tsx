"use client";
import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Menu } from "@/types/model";
import { addToCart } from "@/lib/cart/cartSlice";
import { RootState } from "@/lib/store";
import numeral from "numeral";
import { useTranslation } from "@/lib/i18n";
import { IMG_BASE_URL } from "@/lib/api";
import FoodItemModal from "./FoodItemModal";

type PropType = {
  cartItem: Menu;
  isOrderPage?: boolean;
  cur?: any;
  priority?: boolean;
};

function Cart({ cartItem, isOrderPage, cur, priority = false }: PropType) {
  const { locale } = useTranslation();
  const { id, name, second_name, imagePath, price, promo_price, code, type, subcategory, brand } = cartItem;

  const displayName = locale === "en" && second_name ? second_name : name;
  const real_price = numeral(promo_price).format("0.[00]");
  const actual_price = numeral(price).format("0.[00]");

  const dispatch = useDispatch();
  // Select only the scalar quantity for this item so unrelated cart updates do not re-render every card
  const currentQuantity = useSelector((state: RootState) =>
    isOrderPage
      ? state.cart.items.reduce((sum, item) => (item.id === id ? sum + item.quantity : sum), 0)
      : 0
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOrder = useCallback(
    (comment?: string) => {
      const cartData = {
        id,
        name,
        second_name,
        imagePath,
        price,
        quantity: currentQuantity + 1,
        promo_price,
        code,
        type,
        subcategory,
        brand,
        comment: comment || null,
      };
      dispatch(addToCart(cartData));
    },
    [id, name, second_name, imagePath, price, currentQuantity, promo_price, code, type, subcategory, brand, dispatch]
  );

  return (
    <>
      <div className="card w-[49%]">
        <div className="w-full rounded-xl overflow-hidden relative bg-gray-100">
          <button onClick={() => setIsModalOpen(true)} className="w-full h-full">
            <img
              className="object-cover w-full h-[200px]"
              src={`${IMG_BASE_URL}${imagePath}`}
              alt={name}
              width={250}
              height={250}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority ? "high" : "auto"}
            />
          </button>
          {isOrderPage && (
            <button
              className={`absolute bottom-2 right-2 flex justify-center items-center w-[40px] h-[40px] rounded-full z-20 border-2 border-white shadow-lg transition-all active:scale-90 ${
                currentQuantity > 0 ? "bg-black text-white" : "bg-white text-black"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              {currentQuantity > 0 ? currentQuantity : "+"}
            </button>
          )}
        </div>
        <div
          className="card-body px-1 py-1 flex justify-between items-start gap-y-0 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <h2 className="card-title text-[16px] font-battambong font-extralight leading-tight text-black">
            {displayName}
          </h2>
          <div className="flex flex-col items-end">
            <span className="text-[15px] text-black font-bold whitespace-nowrap">
              {cur || "$"}
              {promo_price ? real_price : actual_price}
            </span>
            {promo_price && (
              <span className="text-[13px] text-gray-500 line-through">
                {cur || "$"}
                {actual_price}
              </span>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <FoodItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cartItem={cartItem}
          cur={cur}
          onAdd={handleOrder}
          imgUrl={IMG_BASE_URL}
          isOrderPage={isOrderPage}
        />
      )}
    </>
  );
}

export default React.memo(Cart);
