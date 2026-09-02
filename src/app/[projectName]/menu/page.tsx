"use client";

import { ImageSlider, NotFound, SearchBar } from "@/components/";
import { Cart, Footer, Loading, PageNotFound, NavBar, NightFoodCart, NightFoodBanner } from "@/components/core";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Provider } from "react-redux";
import store from "@/lib/store";
import { MenuType } from "@/types/model";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

// Special category names for custom UI rendering
const NIGHT_FOOD_CATEGORY = "ម្ហូបយប់";
const RIVER_SNACK_CATEGORY = "គ្រឿងក្លែមទន្លេ";

export default function ViewOnlyMenuPage() {
  const { projectName } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [activeSubSection, setActiveSubSection] = useState<string>("");
  const ref = useRef<(HTMLDivElement | null)[]>([]);
  const subRef = useRef<Record<string, HTMLDivElement | null>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<MenuType>([]);
  const [filteredMenu, setFilteredMenu] = useState<MenuType>([]);
  const isOrderPage = false; // View-only mode: disable POS ordering
  const [images, setImages] = useState<any[]>([]);
  const [isNotFound, setNotFound] = useState(false);
  const [cur, setCur] = useState(null);

  const imgUrl = `https://pos-outdoor.tsdsolution.net/assets/uploads/`;

  // Fetch settings & menu data on component mount
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`https://pos-outdoor.tsdsolution.net/api/DriverController/setting`);
        const settingData = response.data;
        if (settingData?.slide_Show) {
          const correctedSlideShow = settingData.slide_Show.replace(/,\s*]$/, ']');
          const slideShowArray = JSON.parse(correctedSlideShow);
          setImages(slideShowArray);
        }
        if (settingData?.symbol) {
          setCur(settingData.symbol);
        }
      } catch (err) {
        console.log("Error fetching settings data", err);
      }
    };

    fetchImages();

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://pos-outdoor.tsdsolution.net/api/DriverController/GetAllProductWithCat?t=${Date.now()}`
        );

        const dataJson: MenuType = response.data;
        setData(dataJson);
        setFilteredMenu(dataJson);

        if (!dataJson || dataJson.length === 0) {
          setNotFound(true);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching menu data:", error);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [projectName]);

  // Filter items based on search query
  useEffect(() => {
    const filteredItems = data
      .map((category) => ({
        category: category.category,
        items: category.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.second_name && item.second_name.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
      }))
      .filter((category) => category.items.length > 0);

    setFilteredMenu(filteredItems);
  }, [searchQuery, data]);

  const handleSearchInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;
      setSearchQuery(query);
    },
    []
  );

  const handleScroll = (index: number) => {
    ref.current[index]?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(index);
    setActiveSubSection("");
  };

  const handleSubScroll = (subName: string) => {
    subRef.current[subName]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSubSection(subName);
  };

  if (isNotFound) {
    return <PageNotFound error="404 Page Not Found" />;
  }

  if (loading) {
    return <Loading className="h-screen fixed w-full z-100 bg-white top-0 flex justify-center items-center left-0" />;
  }

  return (
    <Provider store={store}>
      {/* Sticky Header Navigation */}
      <div className="w-full px-3 py-1 fixed flex flex-col gap-2 max-w-[575px] bg-white z-10 shadow-sm">
        <NavBar isViewOnly={true} />

        {/* Categories Bar */}
        <ul className="no-scrollbar flex flex-nowrap gap-2 overflow-x-scroll" style={{ paddingBottom: "5px", borderBottom: "1px solid #e5e7eb" }}>
          {data.map((item, index) => (
            <li
              key={item.category}
              onClick={() => handleScroll(index)}
              className={`font-dangrek cursor-pointer text-nowrap max-[500px]:text-[14px] text-[17px] py-[5px] px-3 w-fit rounded-full border transition-all ${activeSection === index
                  ? "bg-black text-white border-black shadow-sm"
                  : "bg-white text-gray-800 border-gray-300 hover:border-black"
                }`}
            >
              {item.category}
            </li>
          ))}
        </ul>

        {/* Subcategories Bar */}
        {data[activeSection] && (
          <ul className="no-scrollbar flex flex-nowrap gap-2 overflow-x-scroll" style={{ margin: "0px 10px", paddingBottom: "5px" }}>
            {Array.from(new Set(data[activeSection].items.map(item => {
              const sub = item.subcategory;
              return sub && sub.trim() !== "" ? sub.trim() : "ផ្សេងៗ";
            })))
              .sort((a, b) => a === "ផ្សេងៗ" ? 1 : b === "ផ្សេងៗ" ? -1 : 0)
              .map((subName) => (
                <li
                  key={subName}
                  onClick={() => handleSubScroll(`${data[activeSection].category}-${subName}`)}
                  className={`font-battambong cursor-pointer text-nowrap max-[500px]:text-[15px] text-[15px] py-[3px] px-3 w-fit rounded-full border transition-all ${activeSubSection === `${data[activeSection].category}-${subName}`
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400"
                    }`}
                >
                  {subName}
                </li>
              ))}
          </ul>
        )}

        {/* Search Bar */}
        <SearchBar query={searchQuery} onSearch={handleSearchInput} />
      </div>

      {/* Main Content Area */}
      <main className="pb-16 fixed top-3 h-full w-full mt-52 max-[600px]:mt-48 max-w-[575px] overflow-scroll scroll-smooth scroll-pt-0">
        <section className="px-3 mt-5">
          {/* Banner Image Slider */}
          {searchQuery.trim().length <= 0 && <ImageSlider images={images} />}

          {/* Menu Sections */}
          <div className="mt-2">
            {filteredMenu.map((category, categoryIndex) => {
              const isListStyle = category.category === NIGHT_FOOD_CATEGORY || category.category === RIVER_SNACK_CATEGORY;

              return (
                <div
                  key={categoryIndex}
                  ref={(el) => {
                    ref.current[categoryIndex] = el;
                  }}
                >
                  {/* Category Header */}
                  {category.items.length > 0 && (
                    <div className="flex gap-3 justify-center items-center my-6">
                      <div className="w-16 h-[2px] rounded-full bg-gray-200"></div>
                      <h1
                        id={`${category.category}`}
                        className="font-bold font-dangrek text-[26px] text-nowrap max-[400px]:text-[20px] text-gray-900"
                      >
                        {category.category}
                      </h1>
                      <div className="w-16 h-[2px] rounded-full bg-gray-200"></div>
                    </div>
                  )}

                  {/* List Style for Night Food & Snack Categories */}
                  {isListStyle ? (
                    <div className="night-food-section">
                      {category.items.length > 0 && (
                        <NightFoodBanner
                          images={Array.from(
                            new Set(
                              category.items
                                .map((item) => item.imagePath)
                                .filter((img) => img && img.trim() !== "")
                            )
                          )}
                          imgUrl={imgUrl}
                        />
                      )}

                      <div className="grid grid-cols-1 gap-x-4">
                        {Array.from(new Set(category.items.map(item => {
                          const sub = item.subcategory;
                          return sub && sub.trim() !== "" ? sub.trim() : "ផ្សេងៗ";
                        })))
                          .sort((a, b) => a === "ផ្សេងៗ" ? 1 : b === "ផ្សេងៗ" ? -1 : 0)
                          .map((subName) => (
                            <div
                              key={subName}
                              className="mb-4"
                              ref={(el) => {
                                subRef.current[`${category.category}-${subName}`] = el;
                              }}
                            >
                              <h2 className="font-battambong text-[22px] font-semibold mb-1 px-1 text-black">
                                {subName}
                              </h2>
                              <div className="flex flex-col w-full divide-y divide-gray-100">
                                {category.items
                                  .filter(item => {
                                    const sub = item.subcategory;
                                    const normalizedSub = sub && sub.trim() !== "" ? sub.trim() : "ផ្សេងៗ";
                                    return normalizedSub === subName;
                                  })
                                  .map((item) => (
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
                    /* Grid Style for Standard Food & Drinks */
                    <>
                      {Array.from(new Set(category.items.map(item => {
                        const sub = item.subcategory;
                        return sub && sub.trim() !== "" ? sub.trim() : "ផ្សេងៗ";
                      })))
                        .sort((a, b) => a === "ផ្សេងៗ" ? 1 : b === "ផ្សេងៗ" ? -1 : 0)
                        .map((subName) => (
                          <div
                            key={subName}
                            className="mb-8"
                            ref={(el) => {
                              subRef.current[`${category.category}-${subName}`] = el;
                            }}
                          >
                            <h2 className="font-battambong text-[20px] font-semibold mb-3 px-1 text-black">
                              {subName}
                            </h2>
                            <div className="flex flex-wrap flex-row justify-between gap-y-4">
                              {category.items
                                .filter(item => {
                                  const sub = item.subcategory;
                                  const normalizedSub = sub && sub.trim() !== "" ? sub.trim() : "ផ្សេងៗ";
                                  return normalizedSub === subName;
                                })
                                .map((item) => (
                                  <Cart
                                    key={item.id}
                                    cartItem={item}
                                    isOrderPage={isOrderPage}
                                    cur={cur}
                                  />
                                ))}
                            </div>
                          </div>
                        ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pb-16">
          {filteredMenu.length <= 0 && <NotFound />}
          <Footer />
        </footer>
      </main>
    </Provider>
  );
}
