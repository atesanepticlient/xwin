/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules";

const Slider = ({
  sliders,
}: {
  sliders: { image: string; link: string }[];
}) => {
  return (
    <div className="mb-3 md:mb-5 lg:mb-8 px-3">
      <Swiper
        spaceBetween={10}
        slidesPerView={"auto"}
        className="mySwiper"
        autoplay={{
          delay: 2000,
          disableOnInteraction: true,
          pauseOnMouseEnter: true,
        }}
        modules={[Autoplay]}
      >
        {sliders.map((slider, i) => (
          <SwiperSlide key={i} className="rounded-lg overflow-hidden">
            <a
              href={slider.link}
              className="block w-full overflow-hidden rounded-lg"
            >
              <img
                src={slider.image}
                className="w-full aspect-[16/8] object-cover select-none rounded-lg"
                alt="Slider image"
              />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;
