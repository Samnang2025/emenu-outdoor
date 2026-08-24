"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import { Logo } from '@/components';
import InforCard from '../InfoCard';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

interface PropType {
  title: string;
  icons: string;
}

export default function NavBar() {
  const { t } = useTranslation();
  const [metadata, setMetadata] = useState<PropType | undefined>();
  const { projectName } = useParams();
  const router = useRouter();
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`https://tonle-coffee.pos.tsdsolution.net/api/DriverController/setting`);
        const data = response.data;
        // Set metadata state with fetched data
        setMetadata({ title: data.site_name, icons: data.logo });
      } catch (error) {
        console.error('Error fetching metadata:', error);
        // Handle error fetching metadata
        setMetadata({ title: 'Default Title', icons: '/default-logo.png' });
      }
    };

    fetchMetadata();
  }, [projectName]);

  return (
    <nav className='bg-white px-3 m-1 flex flex-row justify-between items-center pb-0 z-10 max-w-[575px] w-full '>
      {/* Logo and Title Section */}
      <div className='flex flex-row items-center space-x-2'>
        {/* <Logo className={"max-[600px]:h-[31.2px] max-[600px]:w-[62.4px] h-[100px] w-[100px]"} image={`https://tonle-coffee.pos.tsdsolution.net/assets/uploads/logos/${metadata?.icons}`} /> */}
        <div>
          <p className='font-extrabold w-40 font-akbalthom-moul-4 text-xl max-[600px]:text-sm max-[450px]:text-[20px]'>{metadata?.title}</p>
        </div>
      </div>

      {/* Information Card Section */}
      <InforCard title={metadata?.title || ''} logo={metadata?.icons || ''}>
        <div className='flex justify-center items-center gap-2 h-[22px] rounded-md py-4 px-2'>
          <button
            onClick={() => router.push(`/${projectName}`)}
            className='flex items-center gap-1 font-battambong text-[14px] text-gray-500 border border-gray-400 rounded-full px-2 py-1 hover:bg-gray-50 transition-colors whitespace-nowrap'
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            <span>{t("changeTable")}</span>
          </button>
          <button
            onClick={() => (document.getElementById("my_modal_2") as HTMLDialogElement).showModal()}
            className='flex items-center gap-1 font-battambong text-[14px] text-gray-500 border border-gray-400 rounded-full px-2 py-1 hover:bg-gray-50 transition-colors whitespace-nowrap'
          >
            <span>ព័ត៏មានហាង</span>
          </button>
          <LanguageSwitcher />
        </div>
      </InforCard>
    </nav>
  );
}
