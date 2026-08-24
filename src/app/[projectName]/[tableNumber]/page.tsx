"use client";
import { ImageSlider, Model, NotFound, SearchBar } from "@/components/";
import { Cart, BasketBar, Footer, Loading, PageNotFound, NavBar, NightFoodCart, NightFoodBanner } from "@/components/core"; //Sok Thean Night Food
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import OrderItem from "@/components/OrderItem";
import { Provider } from "react-redux";
import store from "@/lib/store";
import { MenuType } from "@/types/model";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

// Special category names for custom UI rendering
const NIGHT_FOOD_CATEGORY = "ម្ហូបយប់"; //Sok Thean
const RIVER_SNACK_CATEGORY = "គ្រឿងក្លែមទន្លេ"; //Sok Thean

export default function Home() {

  const { projectName, tableNumber } = useParams();
  const { t } = useTranslation();
  const project = Array.isArray(projectName) ? projectName[0] : projectName;
  const [loading, setLoading] = useState(true); // Loading state
  const [historyOrder, setHistoryOrder] = useState<any>(null);
  const [isClickOrder, setClickOrder] = useState(false);

  // Fetch history order details (suspend order) on component mount and when an order is placed
  useEffect(() => {
    if (!projectName || !tableNumber) return;
    const fetchHistoryOrder = async () => {
      try {
        const formData = new FormData();
        formData.append("table_num", `${tableNumber}`);
        const response = await axios.post(
          `https://tonle-coffee.pos.tsdsolution.net/api/DriverController/orders`,
          formData
        );
        setHistoryOrder(response.data);
      } catch (error) {
        console.error("Error fetching history order:", error);
      }
    };
    fetchHistoryOrder();
  }, [projectName, tableNumber, isClickOrder]);

  //Sok Thean Subcategory
  const [activeSection, setActiveSection] = useState<number>(0); // State to track active section
  const [activeSubSection, setActiveSubSection] = useState<string>(""); // State to track active sub-section
  const ref = useRef<(HTMLDivElement | null)[]>([]); // Ref to store section elements
  const subRef = useRef<Record<string, HTMLDivElement | null>>({}); // Ref to store sub-section elements
  //End ST Subcategory
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [data, setData] = useState<MenuType>([]); // State for fetched data
  const [filteredMenu, setFilteredMenu] = useState<MenuType>([]); // State for filtered menu items
  const isOrderPage = true; // Flag for order page
  const [images, setImages] = useState<any[]>([])
  const [isNotFound, setNotFound] = useState(false);
  const [cur, setCur] = useState(null);


  const imgUrl = `https://tonle-coffee.pos.tsdsolution.net/assets/uploads/`;

  // Fetch data on component mount
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`https://tonle-coffee.pos.tsdsolution.net/api/DriverController/setting`);
        const data = response.data
        console.log("Data fetched successfully", response.data);
        const correctedSlideShow = data.slide_Show.replace(/,\s*]$/, ']');
        const slideShowArray = JSON.parse(correctedSlideShow);
        setImages(slideShowArray);
        setCur(data.symbol);
        // Handle the fetched data here
      } catch (err) {
        console.log("Error fetching data", err);
      }
    };

    fetchImages();
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://tonle-coffee.pos.tsdsolution.net/api/DriverController/GetAllProductWithCat?t=${Date.now()}` //Sok Thean Add t=${Date.now()} to prevent caching
        );

        const dataJson: MenuType = response.data;
        console.log(dataJson)
        setData(dataJson); // Set fetched data
        setFilteredMenu(dataJson); // Initialize filteredMenu with fetched data

        if (dataJson.length == 0) {
          setNotFound(true)
        }
        setLoading(false); // Data fetched, set loading to false
      } catch (error) {
        console.error("Error fetching data:", error);
        setNotFound(true)
        setLoading(false); // Error occurred, set loading to false
      }
    };

    fetchData();
  }, [projectName]); // Dependency array ensures fetch occurs when projectName changes

  // Filter items based on search query and update filteredMenu
  useEffect(() => {
    const filteredItems = data
      .map((category) => ({
        category: category.category,
        items: category.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((category) => category.items.length > 0);

    setFilteredMenu(filteredItems);
  }, [searchQuery, data]); // Update filteredMenu when searchQuery or data changes

  // Memoized handler for search input change
  const handleSearchInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;
      setSearchQuery(query);
    },
    []
  );

  // Scroll to a section based on index
  const handleScroll = (index: number) => {
    ref.current[index]?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(index);
    // Sok Thean Subcategory
    setActiveSubSection(""); // Reset sub-section when changing main section
  };

  // Scroll to a sub-section based on sub-category name
  const handleSubScroll = (subName: string) => {
    // Standard scrolling behavior for non-filtered categories
    subRef.current[subName]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSubSection(subName);
  };


  if (isNotFound) {
    return <>
      <PageNotFound error="404 Page Not Found" />
    </>
  }



  // Render loading indicator while fetching data
  if (loading) {
    return <Loading className="h-screen fixed w-full z-100 bg-white top-0 flex justify-center items-center  left-0" />;
  }

  // Render the main content once data is loaded
  return (
    <Provider store={store}>

      <div className="w-full  px-3 py-1 fixed flex flex-col gap-2 max-w-[575px] bg-white z-10">
        <NavBar />
        <ul className="no-scrollbar flex flex-nowrap gap-2 overflow-x-scroll" style={{ "paddingBottom": "5px", "borderBottom": "1px solid #4d4f55ff" }}>
          {data.map((item, index) => (
            <li
              key={item.category}
              onClick={() => handleScroll(index)}
              className={`font-dangrek cursor-pointer text-nowrap max-[500px]:text-[14px] text-[17px] py-[5px] px-3 w-fit rounded-full border-orange-600 border-2 ${activeSection === index ? "text-orange-600" : "text-black"
                }`}
            >
              {item.category}
            </li>
          ))}
        </ul>
        {/* Sok Thean Subcategory */}
        {/* SubCategory section */}
        {data[activeSection] && (
          <ul className="no-scrollbar flex flex-nowrap gap-2 overflow-x-scroll" style={{ "margin": "0px 60px", "paddingBottom": "5px" }}>
            {Array.from(new Set(data[activeSection].items.map(item => {
              // akk Other Subcate
              const sub = item.subcategory;
              return sub && sub.trim() !== "" ? sub.trim() : "ផ្សេងៗ";
            })))
              .sort((a, b) => a === "ផ្សេងៗ" ? 1 : b === "ផ្សេងៗ" ? -1 : 0)
              // end Other Subcate
              .map((subName) => (
                <li
                  key={subName}
                  onClick={() => handleSubScroll(`${data[activeSection].category}-${subName}`)}
                  className={`font-battambong cursor-pointer text-nowrap max-[500px]:text-[16px] text-[16px] py-[3px] px-3 w-fit rounded-full border-gray-300 border ${activeSubSection === `${data[activeSection].category}-${subName}` ? "bg-orange-600 text-white border-orange-600" : "text-gray-900"
                    }`}
                >
                  {subName}
                </li>
              ))}
          </ul>
        )}
        {/*End ST Subcategory*/}
        {/* Search bar component */}
        <SearchBar query={searchQuery} onSearch={handleSearchInput} />
      </div>

      <main className=" pb-[200px] fixed top-3 h-full w-full mt-52 max-[600px]:mt-48  max-w-[575px] overflow-scroll scroll-smooth scroll-pt-0"> {/* Sok Thean popup Component */}
        {/* Navigation and search bar */}


        {/* Main content section */}
        <section className="px-3 mt-5   ">
          {/* Display image slider when no search query */}
          {searchQuery.trim().length <= 0 && <ImageSlider images={images} />}

          <div className="mt-2">
            {/* Render filtered menu items */}
            {/*Sok Thean Night Food 3L*/}
            {filteredMenu.map((category, categoryIndex) => {
              const isListStyle = category.category === NIGHT_FOOD_CATEGORY || category.category === RIVER_SNACK_CATEGORY;

              return (
                <div
                  key={categoryIndex}
                  className=""
                  ref={(el) => {
                    ref.current[categoryIndex] = el;
                  }}
                >
                  {/* Display category header if items exist */}
                  {category.items.length > 0 && (
                    <div className="flex gap-3 justify-center  items-center mb-5">
                      <div className="w-20 h-[2px] rounded-full bg-gray-300"></div>
                      <h1
                        id={`${category.category}`}
                        className={`font-bold font-dangrek text-[26px]  text-nowrap  max-[400px]:text-[20px]`}
                      >
                        {category.category}
                      </h1>
                      <div className="w-20 h-[2px] rounded-full bg-gray-300"></div>
                    </div>
                  )}
                  {/*Sok Thean Night Food*/}
                  {/* === Custom UI for list style categories === */}
                  {isListStyle ? (
                    <div className="night-food-section">
                      {/* akk Banner images comment*/}
                      {/* Banner images - retrieve all unique food images in this category */}
                      {category.items.length > 0 && (
                        <NightFoodBanner
                          images={Array.from(
                            new Set(
                              category.items
                                .map((item) => item.imagePath)
                                .filter((img) => img && img.trim() !== "")
                            )
                          )}
                          // {/* end Banner images comment*/}
                          imgUrl={imgUrl}
                        />
                      )}

                      {/* Items listed without images, grouped by subcategory */}
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
                              <h2 className="font-battambong text-[24px] font-semibold mb-1 px-1 text-black">
                                {subName}
                              </h2>
                              <div className="flex flex-col w-full">
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
                    <>
                      {/* Sok Thean Subcategory */}
                      {/* Display items grouped by sub-category */}
                      {Array.from(new Set(category.items.map(item => {
                        // akk Other Subcategory
                        const sub = item.subcategory;
                        return sub && sub.trim() !== "" ? sub.trim() : "ផ្សេងៗ";
                        // end akk Other Subcategory
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
                            <h2 className="font-battambong text-[20px] font-semibold mb-2 px-1 text-black">
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
                      {/*End ST Subcategory*/}
                    </>
                  )}
                </div>
              );
            })}
            {/*End ST Night Food*/}
          </div>
        </section>

        {/* Bottom action bar */}
        <div className="fixed bottom-0 px-4 py-4 max-w-[575px] z-[50] items-center w-full cursor-pointer rounded-t-2xl bg-white flex justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.1)]"> {/* Sok Thean popup Component */}
          {/* Display order item component */}
          <OrderItem
            cur={cur}
            historyOrder={historyOrder}
            setHistoryOrder={setHistoryOrder}
            isClickOrder={isClickOrder}
            setClickOrder={setClickOrder}
          />
          {/* Basket bar component */}
          <BasketBar cur={cur} historyOrder={historyOrder} />

          {/* Button to trigger modal */}
          <button
            onClick={async () => {
              try {
                (document.getElementById(
                  "my_modal_10"
                ) as HTMLDialogElement).showModal();
                // await axios.post(""); // Placeholder post request
              } catch (error) {
                console.error("Error posting data:", error);
              }
            }}
            className="bg-gray-200 w-14 h-14 flex justify-center items-center rounded-full border-orange-600 border-2"
          >
            {/* Image icon */}
            <img
              className="w-10 h-10 max-[450px]:w-8"
              src={"/icons/service-bell.svg"}
              alt=""
              width={100}
              height={100}
            />
          </button>
          {/* Model component */}
          <Model />
        </div>

        {/* Footer section */}
        <footer className="mt-16 pb-[120px]">
          {/* Display not found message when no items */}
          {filteredMenu.length <= 0 && <NotFound />}
          <Footer />
        </footer>
      </main>
    </Provider>
  );
}
