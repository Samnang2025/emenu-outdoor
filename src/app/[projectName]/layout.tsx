import type { Metadata } from "next";

import "../globals.css";
import I18nProvider from "@/lib/i18n";
import "../../../public/fonts/style.css";
import { API_BASE, IMG_BASE_URL } from "@/lib/api";

export const metadata: Metadata = {
  title: "OUTDOOR ស៊ុបខ្យង",
  icons: `${IMG_BASE_URL}logos/Forth_Out_door1.png`,
};

export function generateStaticParams() {
  return [{ projectName: "u" }];
}

const HEAD_PREFETCH_SCRIPT = `(function(){try{var b="${API_BASE}";var p=window.location.pathname.replace(/\\/+$/,"").split("/").filter(Boolean);var s=p.length>=2?p[1]:null;var c=window.__emenuPrefetch=window.__emenuPrefetch||{};var g=function(u){return fetch(u,{cache:"no-store"}).then(function(r){return r.ok?r.text():null}).then(function(t){return t?JSON.parse(t):null}).catch(function(){return null})};if(!s){c.tables=g(b+"/tables")}else{c.menu=g(b+"/GetAllProductWithCat");c.setting=g(b+"/setting");c.config=g(b+"/e_orderConfig");if(s!=="menu"){var f=new FormData();f.append("table_num",s);c.ordersTable=s;c.orders=fetch(b+"/orders",{method:"POST",body:f,cache:"no-store"}).then(function(r){return r.ok?r.text():null}).then(function(t){return t?JSON.parse(t):null}).catch(function(){return null})}}}catch(e){}})();`;

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
        <script dangerouslySetInnerHTML={{ __html: HEAD_PREFETCH_SCRIPT }} />
      </head>
      <body className="m-auto max-w-[575px]">
        <div className=" h-screen bg-white overflow-auto max-w-[575px] w-full ">
          <I18nProvider>{children}</I18nProvider>
        </div>
      </body>
    </html>
  );
}
