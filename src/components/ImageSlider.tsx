// components/ImageSlider.tsx
import React, { useEffect, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import axios from 'axios';

type propsType = {
  images: any[]
}


const ImageSlider = ({ images }: propsType) => {
  const { projectName } = useParams()

  const imgUrl = `https://tonle-coffee.pos.tsdsolution.net/assets/uploads/`;

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
          return `<span class="${className} bg-orange-500"></span>`;
        },
      }}
      modules={[Autoplay, Pagination]}
      className="mySwiper h-52 w-full rounded-xl overflow-hidden "
    >

      {images.map((image, index) => (
        <SwiperSlide key={index} className='w-full bg-gray-300  overflow-hidden '>
          <img className=' object-cover w-full h-full' src={`${imgUrl}/${image.name}`} alt='' width={250} height={1000} />
        </SwiperSlide>
      ))}
      {/* Add more slides as needed */}
    </Swiper>
  );
};

export default ImageSlider;
