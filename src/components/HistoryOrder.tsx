import React from 'react';
import Image from 'next/image';
import numeral from "numeral";
import { useParams } from 'next/navigation';
import { orderHistory } from '@/types/model';
import { useTranslation } from '@/lib/i18n';

type PropsType = {
    cartItem: orderHistory;
    cur?: any;
    index?: number;
};

export default function HistoryOrder({ cartItem, cur, index }: PropsType) {
    const { locale } = useTranslation();
    const { projectName, tableNumber } = useParams();
    const { name, second_name, price, id, imagePath, quantity, promo_price } = cartItem;

    const displayName = (locale === 'en' && second_name) ? second_name : name;
    // Format prices
    const real_price = numeral(promo_price).format('0.[00]');
    const actual_price = numeral(price).format('0.[00]');
    const qty = numeral(quantity).format('0')
    // Construct image URL
    const imgUrl = `https://tonle-coffee.pos.tsdsolution.net/assets/uploads/`;

    return (
        <>
            <div className="flex flex-row justify-between w-full px-3 py-1 mt-1">
                {/* Item information (image, name, price, promo_price) */}
                <div className='flex flex-row items-center space-x-4'>
                    {index !== undefined && (
                        <span className="text-gray-500 font-semibold text-sm">
                            {index + 1}.
                        </span>
                    )}
                    {/* Image */}
                    <div className='h-[62px] w-[62px] rounded-lg overflow-hidden'>
                        <img src={`${imgUrl}/${imagePath}`} alt="" width={1000} height={1000} className="object-cover w-full h-full" />
                    </div>
                    {/* Item details (name, price, promo_price) */}
                    <div>
                        <p className='font-battambong text-sm'>{displayName}</p>
                        <div className="space-x-3">
                            <span className='text-orange-600 font-bold'>{cur || "$"}{promo_price ? real_price : actual_price}</span>
                            {
                                promo_price && promo_price != price ? <span className="line-through">{cur || "$"}{actual_price}</span> : (<></>)
                            }
                        </div>
                    </div>
                </div>
                {/* Quantity */}
                <div className='flex flex-row items-center space-x-2'>
                    <p>X{qty}</p>
                </div>
            </div>
            {/* Divider */}
            <div className='h-[1px] w-full mt-1 bg-gray-200'></div>
        </>
    );
}
