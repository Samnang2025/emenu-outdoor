"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

type PropType = {
  images: string[];
  imgUrl: string;
};

const NightFoodBanner: React.FC<PropType> = ({ images, imgUrl }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="night-food-banner mb-4 w-full rounded-xl overflow-hidden" style={{ height: "250px" }}>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay, Pagination]}
        className="mySwiper w-full h-full"
      >
        {images.map((image, index) => (
          <SwiperSlide key={image || index} className="w-full h-full bg-gray-100 overflow-hidden">
            <img
              className="object-cover w-full h-full"
              src={`${imgUrl}${image}`}
              alt={`Night food banner ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default React.memo(NightFoodBanner);
