"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Provider } from "react-redux";
import store from "@/lib/store";
import { Menu, MenuType, orderHistoryType } from "@/types/model";
import { useParams } from "next/navigation";
import { ImageSlider, NotFound, SearchBar } from "@/components/";
import {
  Cart,
  BasketBar,
  Footer,
  Loading,
  PageNotFound,
  NavBar,
  NightFoodCart,
  NightFoodBanner,
} from "@/components/core";

const OrderItem = dynamic(() => import("@/components/OrderItem"), { ssr: false });
const Model = dynamic(() => import("@/components/Model"), { ssr: false });
import {
  IMG_BASE_URL,
  OrderConfig,
  parseSlideShow,
  StoreSettings,
} from "@/lib/api";
import {
  fetchClientMenu,
  fetchClientSettings,
  fetchTableHistoryOrder,
  getCachedClientEntry,
  seedClientCache,
} from "@/lib/clientApi";

const NIGHT_FOOD_CATEGORY = "ម្ហូបយប់";
const RIVER_SNACK_CATEGORY = "គ្រឿងក្លែមទន្លេ";
const CLIENT_REVALIDATE_MS = 15_000;

type SubcategoryGroup = {
  subName: string;
  items: Menu[];
};

function groupItemsBySubcategory(items: Menu[]): SubcategoryGroup[] {
  const map = new Map<string, Menu[]>();
  for (const item of items) {
    const sub = item.subcategory?.trim();
    const subName = sub && sub.length > 0 ? sub : "ផ្សេងៗ";
    const list = map.get(subName);
    if (list) {
      list.push(item);
    } else {
      map.set(subName, [item]);
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => (a === "ផ្សេងៗ" ? 1 : b === "ផ្សេងៗ" ? -1 : 0))
    .map(([subName, groupedItems]) => ({ subName, items: groupedItems }));
}

export type MenuPageClientProps = {
  isOrderPage: boolean;
  initialMenu: MenuType | null;
  initialSettings: StoreSettings | null;
  initialConfig: OrderConfig | null;
  initialAgeMs?: number;
};

export default function MenuPageClient({
  isOrderPage,
  initialMenu,
  initialSettings,
  initialConfig,
  initialAgeMs = 0,
}: MenuPageClientProps) {
  const { projectName, tableNumber } = useParams();
  const resolvedTableNumber = Array.isArray(tableNumber) ? tableNumber[0] : tableNumber;

  const hasInitialMenu = Boolean(initialMenu && initialMenu.length > 0);
  const [data, setData] = useState<MenuType>(() => initialMenu || []);
  const [loading, setLoading] = useState<boolean>(() => !hasInitialMenu);
  const [isNotFound, setNotFound] = useState(false);

  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);
  const [historyOrder, setHistoryOrder] = useState<orderHistoryType | null>(null);
  const [historyOrderLoaded, setHistoryOrderLoaded] = useState(false);
  const [isClickOrder, setClickOrder] = useState(false);

  const [activeSection, setActiveSection] = useState<number>(0);
  const [activeSubSection, setActiveSubSection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<(HTMLDivElement | null)[]>([]);
  const subRef = useRef<Record<string, HTMLDivElement | null>>({});

  // Seed client caches and handle fallback / background refresh
  useEffect(() => {
    let cancelled = false;

    if (initialSettings) {
      seedClientCache("setting", initialSettings);
    } else {
      const cachedSettings = getCachedClientEntry<StoreSettings>("setting")?.data;
      if (cachedSettings) {
        setSettings(cachedSettings);
      } else {
        fetchClientSettings()
          .then((res) => {
            if (!cancelled && res) setSettings(res);
          })
          .catch((err) => console.error("Error fetching settings:", err));
      }
    }

    if (initialConfig) {
      seedClientCache("e_orderConfig", initialConfig);
    }

    if (hasInitialMenu && initialMenu) {
      seedClientCache("menu", initialMenu, Date.now() - initialAgeMs);
      if (initialAgeMs >= CLIENT_REVALIDATE_MS) {
        fetchClientMenu(true)
          .then((fresh) => {
            if (cancelled || !fresh || fresh.length === 0) return;
            setData((prev) =>
              JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh
            );
          })
          .catch(() => {
            // Keep rendered SSR menu if background refresh fails
          });
      }
    } else {
      const cachedMenu = getCachedClientEntry<MenuType>("menu");
      if (cachedMenu?.data?.length) {
        setData(cachedMenu.data);
        setLoading(false);
      }

      const needsRefresh =
        !cachedMenu?.data?.length || Date.now() - cachedMenu.fetchedAt >= CLIENT_REVALIDATE_MS;

      if (needsRefresh) {
        fetchClientMenu(true)
          .then((fresh) => {
            if (cancelled) return;
            if (!fresh || fresh.length === 0) {
              if (!cachedMenu?.data?.length) {
                setNotFound(true);
              }
            } else {
              setData(fresh);
            }
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching menu data:", err);
            if (!cancelled) {
              if (!cachedMenu?.data?.length) {
                setNotFound(true);
              }
              setLoading(false);
            }
          });
      }
    }

    return () => {
      cancelled = true;
    };
  }, [projectName, hasInitialMenu, initialMenu, initialSettings, initialConfig, initialAgeMs]);

  // Fetch live suspended order history for this table when in ordering mode
  useEffect(() => {
    if (!isOrderPage || !projectName || !resolvedTableNumber) return;
    let cancelled = false;
    fetchTableHistoryOrder(resolvedTableNumber)
      .then((res) => {
        if (!cancelled) {
          setHistoryOrder(res);
          setHistoryOrderLoaded(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching history order:", error);
        if (!cancelled) {
          setHistoryOrderLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOrderPage, projectName, resolvedTableNumber, isClickOrder]);

  const images = useMemo(() => parseSlideShow(settings?.slide_Show), [settings?.slide_Show]);
  const cur = settings?.symbol ?? null;

  const activeSubcategories = useMemo(() => {
    const current = data[activeSection];
    if (!current) return [];
    const seen = new Set<string>();
    for (const item of current.items) {
      const sub = item.subcategory?.trim();
      seen.add(sub && sub.length > 0 ? sub : "ផ្សេងៗ");
    }
    return Array.from(seen).sort((a, b) => (a === "ផ្សេងៗ" ? 1 : b === "ផ្សេងៗ" ? -1 : 0));
  }, [data, activeSection]);

  const groupedFilteredMenu = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data
      .map((category) => {
        const items = q
          ? category.items.filter(
              (item) =>
                item.name.toLowerCase().includes(q) ||
                (item.second_name ? item.second_name.toLowerCase().includes(q) : false)
            )
          : category.items;

        if (items.length === 0) return null;

        const isListStyle =
          category.category === NIGHT_FOOD_CATEGORY || category.category === RIVER_SNACK_CATEGORY;
        const bannerImages = isListStyle
          ? Array.from(
              new Set(
                items.map((item) => item.imagePath).filter((img) => img && img.trim() !== "")
              )
            )
          : [];

        return {
          category: category.category,
          isListStyle,
          bannerImages,
          subgroups: groupItemsBySubcategory(items),
        };
      })
      .filter((section): section is NonNullable<typeof section> => section !== null);
  }, [searchQuery, data]);

  const handleSearchInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleScroll = useCallback((index: number) => {
    ref.current[index]?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(index);
    setActiveSubSection("");
  }, []);

  const handleSubScroll = useCallback((subName: string) => {
    subRef.current[subName]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSubSection(subName);
  }, []);

  if (isNotFound) {
    return <PageNotFound error="404 Page Not Found" />;
  }

  if (loading) {
    return (
      <Loading className="h-screen fixed w-full z-100 bg-white top-0 flex justify-center items-center left-0" />
    );
  }

  let priorityCardBudget = 6;

  return (
    <Provider store={store}>
      <div
        className={`w-full px-3 py-1 fixed flex flex-col gap-2 max-w-[575px] bg-white z-10 ${
          isOrderPage ? "" : "shadow-sm"
        }`}
      >
        <NavBar
          isViewOnly={!isOrderPage}
          initialSettings={settings}
          initialConfig={initialConfig}
        />

        <ul
          className="no-scrollbar flex flex-nowrap gap-2 overflow-x-scroll"
          style={{
            paddingBottom: "5px",
            borderBottom: isOrderPage ? "1px solid #4d4f55ff" : "1px solid #e5e7eb",
          }}
        >
          {data.map((item, index) => (
            <li
              key={item.category}
              onClick={() => handleScroll(index)}
              className={
                isOrderPage
                  ? "font-dangrek cursor-pointer text-nowrap max-[500px]:text-[14px] text-[17px] py-[5px] px-3 w-fit rounded-full border-black border-2 text-black"
                  : `font-dangrek cursor-pointer text-nowrap max-[500px]:text-[14px] text-[17px] py-[5px] px-3 w-fit rounded-full border transition-all ${
                      activeSection === index
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-white text-gray-800 border-gray-300 hover:border-black"
                    }`
              }
            >
              {item.category}
            </li>
          ))}
        </ul>

        {activeSubcategories.length > 0 && data[activeSection] && (
          <ul
            className="no-scrollbar flex flex-nowrap gap-2 overflow-x-scroll"
            style={{ margin: isOrderPage ? "0px 60px" : "0px 10px", paddingBottom: "5px" }}
          >
            {activeSubcategories.map((subName) => {
              const subKey = `${data[activeSection].category}-${subName}`;
              const isActive = activeSubSection === subKey;
              return (
                <li
                  key={subName}
                  onClick={() => handleSubScroll(subKey)}
                  className={
                    isOrderPage
                      ? `font-battambong cursor-pointer text-nowrap max-[500px]:text-[16px] text-[16px] py-[3px] px-3 w-fit rounded-full border-gray-300 border ${
                          isActive ? "bg-black text-white border-black" : "text-gray-900"
                        }`
                      : `font-battambong cursor-pointer text-nowrap max-[500px]:text-[15px] text-[15px] py-[3px] px-3 w-fit rounded-full border transition-all ${
                          isActive
                            ? "bg-black text-white border-black"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400"
                        }`
                  }
                >
                  {subName}
                </li>
              );
            })}
          </ul>
        )}

        <SearchBar query={searchQuery} onSearch={handleSearchInput} />
      </div>

      <main
        className={`${
          isOrderPage ? "pb-[200px]" : "pb-16"
        } fixed top-3 h-full w-full mt-52 max-[600px]:mt-48 max-w-[575px] overflow-scroll scroll-smooth scroll-pt-0`}
      >
        <section className="px-3 mt-5">
          {searchQuery.trim().length <= 0 && <ImageSlider images={images} />}

          <div className="mt-2">
            {groupedFilteredMenu.map((section, categoryIndex) => (
              <div
                key={section.category}
                ref={(el) => {
                  ref.current[categoryIndex] = el;
                }}
              >
                <div
                  className={
                    isOrderPage
                      ? "flex gap-3 justify-center items-center mb-5"
                      : "flex gap-3 justify-center items-center my-6"
                  }
                >
                  <div
                    className={
                      isOrderPage
                        ? "w-20 h-[2px] rounded-full bg-gray-300"
                        : "w-16 h-[2px] rounded-full bg-gray-200"
                    }
                  ></div>
                  <h1
                    id={section.category}
                    className={`font-bold font-dangrek text-[26px] text-nowrap max-[400px]:text-[20px] ${
                      isOrderPage ? "" : "text-gray-900"
                    }`}
                  >
                    {section.category}
                  </h1>
                  <div
                    className={
                      isOrderPage
                        ? "w-20 h-[2px] rounded-full bg-gray-300"
                        : "w-16 h-[2px] rounded-full bg-gray-200"
                    }
                  ></div>
                </div>

                {section.isListStyle ? (
                  <div className="night-food-section">
                    {section.bannerImages.length > 0 && (
                      <NightFoodBanner images={section.bannerImages} imgUrl={IMG_BASE_URL} />
                    )}
                    <div className="grid grid-cols-1 gap-x-4">
                      {section.subgroups.map(({ subName, items }) => (
                        <div
                          key={subName}
                          className="mb-4"
                          ref={(el) => {
                            subRef.current[`${section.category}-${subName}`] = el;
                          }}
                        >
                          <h2
                            className={`font-battambong ${
                              isOrderPage ? "text-[24px]" : "text-[22px]"
                            } font-semibold mb-1 px-1 text-black`}
                          >
                            {subName}
                          </h2>
                          <div
                            className={`flex flex-col w-full ${
                              isOrderPage ? "" : "divide-y divide-gray-100"
                            }`}
                          >
                            {items.map((item) => (
                              <NightFoodCart
                                key={item.id}
                                cartItem={item}
                                isOrderPage={isOrderPage}
                                cur={cur}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {section.subgroups.map(({ subName, items }) => (
                      <div
                        key={subName}
                        className="mb-8"
                        ref={(el) => {
                          subRef.current[`${section.category}-${subName}`] = el;
                        }}
                      >
                        <h2
                          className={`font-battambong text-[20px] font-semibold ${
                            isOrderPage ? "mb-2" : "mb-3"
                          } px-1 text-black`}
                        >
                          {subName}
                        </h2>
                        <div className="flex flex-wrap flex-row justify-between gap-y-4">
                          {items.map((item) => {
                            const isPriority = priorityCardBudget > 0;
                            if (isPriority) priorityCardBudget -= 1;
                            return (
                              <Cart
                                key={item.id}
                                cartItem={item}
                                isOrderPage={isOrderPage}
                                cur={cur}
                                priority={isPriority}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {isOrderPage && (
          <div className="fixed bottom-0 px-4 py-4 max-w-[575px] z-[50] items-center w-full cursor-pointer rounded-t-2xl bg-white flex justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
            <OrderItem
              cur={cur}
              historyOrder={historyOrder}
              historyOrderLoaded={historyOrderLoaded}
              isClickOrder={isClickOrder}
              setClickOrder={setClickOrder}
            />
            <BasketBar cur={cur} historyOrder={historyOrder} />

            <button
              onClick={() => {
                try {
                  (document.getElementById("my_modal_10") as HTMLDialogElement | null)?.showModal();
                } catch (error) {
                  console.error("Error opening modal:", error);
                }
              }}
              className="bg-gray-200 w-14 h-14 flex justify-center items-center rounded-full border-black border-2"
            >
              <img
                className="w-10 h-10 max-[450px]:w-8"
                src="/icons/service-bell.svg"
                alt=""
                width={100}
                height={100}
              />
            </button>
            <Model />
          </div>
        )}

        <footer className={isOrderPage ? "mt-16 pb-[120px]" : "mt-12 pb-16"}>
          {groupedFilteredMenu.length <= 0 && <NotFound />}
          <Footer />
        </footer>
      </main>
    </Provider>
  );
}

