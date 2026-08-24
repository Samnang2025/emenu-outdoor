"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import "@/app/globals.css";
import { Menu } from "@/types/model";
import { addToCart } from "@/lib/cart/cartSlice";
import { RootState } from "@/lib/store";
import { useParams } from "next/navigation";
import numeral from "numeral";
import { useTranslation } from "@/lib/i18n";
import FoodItemModal from "./FoodItemModal"; // Sok Thean popup Cofmponent

type PropType = {
  cartItem: Menu;
  isOrderPage?: boolean;
  cur?: any
};


export default function Cart({ cartItem, isOrderPage, cur }: PropType) {
  //AKK Translation
  const { locale } = useTranslation();
  const { id, name, second_name, imagePath, price, promo_price, code, type, subcategory, brand } = cartItem; //Sok Thean Subcategory

  const displayName = (locale === 'en' && second_name) ? second_name : name;
  //End AKK Translation
  const real_price = numeral(promo_price).format("0.[00]");
  const actual_price = numeral(price).format("0.[00]");

  const { projectName } = useParams();
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);

  // Find existing items in cart and sum their quantities
  const currentQuantity = cart.items
    .filter((item) => item.id === id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const [eachItemOrderNumber, setOrderItem] = useState(currentQuantity);

  const [isModalOpen, setIsModalOpen] = useState(false); // Sok Thean popup Component

  // Base URL for image
  const imgUrl = `https://tonle-coffee.pos.tsdsolution.net/assets/uploads/`;

  // Handle adding item to cart
  const handleOrder = (comment?: string) => { //Sok Thean Add comment
    setOrderItem((prev) => prev + 1); // Increment local quantity state
    const cartData = {
      id,
      name,
      second_name, //AKK Translation
      imagePath,
      price,
      quantity: eachItemOrderNumber + 1,
      promo_price,
      code,
      type,
      //Sok Thean Subcategory
      subcategory,
      brand,
      comment: comment || null, //Sok Thean Add comment
    };

    dispatch(addToCart(cartData)); // Dispatch action to add item to Redux store
  };

  // Reset local quantity state when currentQuantity changes
  useEffect(() => {
    setOrderItem(currentQuantity);
  }, [currentQuantity]);

  return (
    <>
      <div className="card w-[49%]">
        <div className="w-full rounded-xl overflow-hidden  relative">
          <button onClick={() => isOrderPage && setIsModalOpen(true)} className="w-full h-full "> {/* Sok Thean popup Component */}
            <img
              className="object-cover w-full h-[200px]"
              src={`${imgUrl}${cartItem.imagePath}`}
              alt={cartItem.name}
              width={250}
              height={250}
            />
          </button>
          {/* Button to add item to basket (visible only if isOrderPage is true) */}
          {isOrderPage && (
            <button
              // Sok Thean popup Component
              className={`absolute bottom-2 right-2 flex justify-center items-center w-[40px] h-[40px] rounded-full z-20 border-2 border-white shadow-lg transition-all active:scale-90 ${eachItemOrderNumber > 0 ? "bg-orange text-black" : "bg-white text-orange"
                }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            // End popup Component
            >
              {eachItemOrderNumber > 0 ? eachItemOrderNumber : "+"}
            </button>
          )}
        </div>
        <div className="card-body px-1 py-1 flex justify-between items-start gap-y-0" onClick={() => isOrderPage && setIsModalOpen(true)}> {/* Sok Thean popup Component */}
          <h2 className="card-title text-[16px] font-battambong font-extralight leading-tight text-black">
            {displayName}
          </h2>
          <div className="flex flex-col items-end">
            <span className="text-[15px] text-orange-600 font-bold whitespace-nowrap">
              {cur || "$"}{promo_price ? real_price : actual_price}
            </span>
            {promo_price && (
              <span className="text-[13px] text-gray-500 line-through">
                {cur || "$"}{actual_price}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Sok Thean popup Component */}
      <FoodItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cartItem={cartItem}
        cur={cur}
        onAdd={(comment) => handleOrder(comment)} //Sok Thean Add comment
        imgUrl={imgUrl}
      />
      {/* End popup Component */}
    </>
  );
}
