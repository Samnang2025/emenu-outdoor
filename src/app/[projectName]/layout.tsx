import type { Metadata } from "next";

import "../globals.css";
import I18nProvider from "@/lib/i18n";
import "../../../public/fonts/style.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getServerSettings, IMG_BASE_URL } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getServerSettings();
    if (data?.site_name) {
      return {
        title: data.site_name,
        icons: data.logo ? `${IMG_BASE_URL}logos/${data.logo}` : "/default-icon.png",
      };
    }
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }

  return {
    title: "OUTDOOR ស៊ុបខ្យង",
    icons: "/default-icon.png",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  params: { projectName: string };
  children: React.ReactNode;
}>) {
  return (
    <html lang="kh" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://pos-outdoor.tsdsolution.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pos-outdoor.tsdsolution.net" />
      </head>
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
