// components/ImageSlider.tsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { IMG_BASE_URL, SlideImage } from "@/lib/api";

type propsType = {
  images: SlideImage[];
};

const ImageSlider = ({ images }: propsType) => {
  if (!images || images.length === 0) return null;

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
        renderBullet: function (index, className) {
          return `<span class="${className} bg-black"></span>`;
        },
      }}
      modules={[Autoplay, Pagination]}
      className="mySwiper h-52 w-full rounded-xl overflow-hidden"
    >
      {images.map((image, index) => (
        <SwiperSlide key={image.name || index} className="w-full bg-gray-300 overflow-hidden">
          <img
            className="object-cover w-full h-full"
            src={`${IMG_BASE_URL}${image.name}`}
            alt=""
            width={250}
            height={1000}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default React.memo(ImageSlider);
