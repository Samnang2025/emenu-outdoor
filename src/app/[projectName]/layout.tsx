import type { Metadata } from "next";

import "../globals.css"
import { NavBar } from "@/components/core";
import I18nProvider from "@/lib/i18n";
import '../../../public/fonts/style.css';
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export async function generateMetadata({ params }: { params: { projectName: string } }): Promise<Metadata> {
  try {
    const response = await axios.get(`https://tonle-coffee.pos.tsdsolution.net/api/DriverController/setting`);
    const data = response.data;
    return {
      title: data.site_name,
      icons: `https://tonle-coffee.pos.tsdsolution.net/assets/uploads/logos/${data.logo}`
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    // Return default metadata or handle the error as per your requirement
    return {
      title: "Default Title",
      icons: "/default-icon.png"
    };
  }
}

export default function RootLayout({
  params,
  children,
}: Readonly<{
  params: { projectName: string }
  children: React.ReactNode;
}>) {
  return (
    <html lang="kh" className="scroll-smooth">
      <body className="m-auto max-w-[575px]">
        <div className=" h-screen bg-white overflow-auto max-w-[575px] w-full ">
          <I18nProvider>

            <ToastContainer />
            {children}
          </I18nProvider>
        </div>
      </body>
    </html>
  );
}
