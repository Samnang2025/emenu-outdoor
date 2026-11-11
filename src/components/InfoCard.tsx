"use client";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IMG_BASE_URL, OrderConfig } from "@/lib/api";
import { fetchClientOrderConfig, getCachedClientEntry, seedClientCache } from "@/lib/clientApi";

type propTypes = {
  children: ReactNode;
  title: string;
  logo: string;
  initialConfig?: OrderConfig | null;
};

export default function InforCard({ children, title, logo, initialConfig }: propTypes) {
  const [info, setInfo] = useState<OrderConfig | undefined>(() => {
    if (initialConfig) return initialConfig;
    return getCachedClientEntry<OrderConfig>("e_orderConfig")?.data;
  });
  const [hasOpened, setHasOpened] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (initialConfig) {
      seedClientCache("e_orderConfig", initialConfig);
      setInfo(initialConfig);
      return;
    }

    let cancelled = false;
    fetchClientOrderConfig()
      .then((data) => {
        if (!cancelled && data) {
          setInfo(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [initialConfig]);

  // Defer rendering heavy modal assets (841KB well.jpg, 107KB map.svg, logo) until modal opens
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (dialog.hasAttribute("open")) {
      setHasOpened(true);
    }
    const observer = new MutationObserver(() => {
      if (dialog.hasAttribute("open")) {
        setHasOpened(true);
      }
    });
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {children}
      <dialog id="my_modal_2" ref={dialogRef} className="modal backdrop-blur-[2px]">
        <div className="modal-box p-0 bg-white">
          <form method="dialog">
            <button className="text-white bg-black w-8 h-8 rounded-full absolute right-2 top-2 text-xl flex items-center justify-center z-10 hover:bg-gray-800 transition-colors">
              ✕
            </button>
          </form>
          {hasOpened && (
            <div className="flex flex-col items-center">
              <div className="h-[200px] w-full mb-20 relative">
                <img
                  src="/images/well.jpg"
                  className="object-cover w-full h-full"
                  width={1000}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  alt=""
                />
                <div className="w-28 h-28 rounded-full flex justify-center items-center absolute bottom-[-60px] left-1/2 transform -translate-x-1/2">
                  {logo && (
                    <img
                      className="object-cover"
                      src={`${IMG_BASE_URL}logos/${logo}`}
                      alt=""
                      width={1000}
                      height={1000}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
              </div>
              <p className="font-akbalthom-moul-4 text-center text-2xl text-gray-800">{title}</p>
              <p className="px-5 font-battambong font-light mt-5 text-sm text-center text-gray-600">
                ទំនាក់ទំនងយើងខ្ញុំតាមរយៈបណ្តាញសង្គម <br />
                Contact us through our official social media channels
              </p>
              <div className="flex flex-row space-x-6 mt-5">
                <Link href={info?.googlemap || "#"}>
                  <img
                    className="w-10 h-10 hover:scale-110 transition-transform"
                    src="/icons/map.svg"
                    alt="Google Map"
                    width={40}
                    height={40}
                  />
                </Link>
                <Link href={info?.telegram || "#"}>
                  <img
                    className="w-10 h-10 hover:scale-110 transition-transform"
                    src="/icons/telegram.svg"
                    alt="Telegram"
                    width={40}
                    height={40}
                  />
                </Link>
                <Link href={info?.tiktok || "#"}>
                  <img
                    className="w-10 h-10 hover:scale-110 transition-transform"
                    src="/icons/tiktok.svg"
                    alt="Tiktok"
                    width={40}
                    height={40}
                  />
                </Link>
              </div>

              <div className="flex font-battambong space-x-2 mt-5 p-4 w-full justify-center bg-gray-200">
                <img className="w-5" src="/icons/call.svg" alt="" width={100} height={100} />
                <h1 className="text-orange-500">
                  លេខទំនាក់ទំនង / Hotline:{" "}
                  <Link href={`tel:+855${info?.phone_num}`}>{info?.phone_num}</Link>
                </h1>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
