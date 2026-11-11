// AKK Night Food Cart
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
};

function NightFoodCart({ cartItem, isOrderPage, cur }: PropType) {
  const { locale } = useTranslation();
  const { id, name, second_name, imagePath, price, promo_price, code, type, subcategory, brand } = cartItem;

  const displayName = locale === "en" && second_name ? second_name : name;
  const real_price = numeral(promo_price).format("0.[00]");
  const actual_price = numeral(price).format("0.[00]");

  const dispatch = useDispatch();
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
      <div
        className="w-full py-1 cursor-pointer flex justify-between items-start gap-2"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="font-battambong text-[20px] text-black">
          - {displayName}
        </span>
        <div className="flex flex-col items-end">
          <span className="text-[17px] text-black whitespace-nowrap font-bold">
            {cur || "$"}
            {promo_price ? real_price : actual_price}
          </span>
          {promo_price && (
            <span className="text-[15px] text-gray-400 line-through">
              {cur || "$"}
              {actual_price}
            </span>
          )}
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

export default React.memo(NightFoodCart);
