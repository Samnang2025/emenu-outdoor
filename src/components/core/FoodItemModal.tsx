// Sok Thean popup Component
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Menu } from "@/types/model";
import numeral from "numeral";
import { useTranslation } from "@/lib/i18n"; //AKK Translation
import { createPortal } from "react-dom";

type PropType = {
  cartItem: Menu;
  cur: any;
  onAdd?: (comment: string) => void;
  isOpen: boolean;
  onClose: () => void;
  imgUrl: string;
  isOrderPage?: boolean;
};

const FoodItemModal: React.FC<PropType> = ({
  cartItem,
  cur,
  onAdd,
  isOpen,
  onClose,
  imgUrl,
  isOrderPage = true,
}) => {
  const [comment, setComment] = useState("");
  const [sugarLevel, setSugarLevel] = useState("");
  const [iceLevel, setIceLevel] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  //AKK Translation
  const { locale, t } = useTranslation();

  const { name, second_name, imagePath, price, promo_price, brand } = cartItem;
  const displayName = (locale === 'en' && second_name) ? second_name : name;
  //End AKK Translation
  const real_price = numeral(promo_price).format("0.[00]");
  const actual_price = numeral(price).format("0.[00]");

  if (!isOpen || !mounted) return null;

  const handleAdd = () => {
    let finalComment = comment;
    if (brand === "Drinks" || brand === "Drink") {
      const selections = [];
      if (sugarLevel) selections.push(`Sugar: ${sugarLevel}`);
      if (iceLevel) selections.push(`Ice: ${iceLevel}`);
      
      if (selections.length > 0) {
        const customization = `[${selections.join(", ")}]`;
        finalComment = comment ? `${customization} ${comment}` : customization;
      }
    }
    if (onAdd) {
      onAdd(finalComment);
    }
    setComment(""); // Reset comment after adding
    setSugarLevel(""); // Reset sugar
    setIceLevel(""); // Reset ice
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-90 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Section */}
        <div className="w-full h-60 relative">
          <img
            src={`${imgUrl}${imagePath}`}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="p-3">
          <div className="flex flex-row justify-between items-center gap-2 mb-4">
            <h2 className="text-2xl font-dangrek font-bold text-black leading-tight">
              {displayName}
            </h2>
            <div className="flex flex-col items-end shrink-0 pt-1">
              <span className="text-2xl text-start font-bold text-black">
                {cur || "$"}{promo_price ? real_price : actual_price}
              </span>
              {promo_price && (
                <span className="text-sm text-gray-400 line-through">
                  {cur || "$"}{actual_price}
                </span>
              )}
            </div>
          </div>

          {/* Drink Customization (Ordering mode only) */}
          {isOrderPage && brand === "Drinks" && (
            <div className="mb-6 space-y-4">
              {/* Sugar Level */}
              <div>
                <label className="block text-sm font-battambong font-semibold text-gray-700 mb-2">
                  {t("sugarLevelLabel")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {["0%","10%","20%","30%", "50%","70%","80%","100%"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSugarLevel(sugarLevel === level ? "" : level)}
                      className={`px-4 py-2 rounded-full text-sm font-battambong transition-all ${
                        sugarLevel === level
                          ? "bg-black text-white shadow-md scale-105"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ice Level */}
              <div>
                <label className="block text-sm font-battambong font-semibold text-gray-700 mb-2">
                  {t("iceLevelLabel")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Lots ice", "less ice"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setIceLevel(iceLevel === level ? "" : level)}
                      className={`px-4 py-2 rounded-full text-sm font-battambong transition-all ${
                        iceLevel === level
                          ? "bg-black text-white shadow-md scale-105"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {level === "Lots ice" ? t("lotsIceLabel") : t("lessIceLabel")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comment Field (Ordering mode only) */}
          {isOrderPage && (
            <div className="mb-2">
              <label htmlFor="item-comment" className="block text-sm font-battambong font-semibold text-gray-700 mb-2">
                {t("optionalCommentLabel")}
              </label>
              <textarea
                id="item-comment"
                rows={1}
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:border-black focus:ring-4 focus:ring-black/10 outline-none transition-all duration-300 resize-none text-gray-800 placeholder:text-gray-400 font-battambong shadow-inner hover:shadow-md"
                placeholder={t("commentPlaceholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          )}

          {/* Action Button */}
          {isOrderPage ? (
            <button
              onClick={handleAdd}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-black/90 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-battambong" style={{"fontWeight": "normal"}}>{t("addToBasketLabel")}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-medium text-base hover:bg-gray-200 transition-colors flex items-center justify-center font-battambong"
            >
              {t("close")}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FoodItemModal;
