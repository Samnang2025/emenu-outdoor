import React from 'react'
import { useTranslation } from "@/lib/i18n";
type propTypes = {
  query: string
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void
}
export default function SearchBar({ onSearch, query }: propTypes) {
  const { t } = useTranslation();
  return (
    <label className="input bg-white text-gray-800 h-[50px] rounded-full flex items-center p-3 gap-1 w-full">
      <input type="text" className="grow bg-transparent border border-gray-500 rounded-full p-3 font-dangrek text-[16px] max-[500px]:text-[14px]" placeholder={t("finddrinkorfood")} value={query} onChange={onSearch} />
      
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"

        className="h-6 w-6  opacity-70 text-orange-500">
        <path
          fillRule="evenodd"
          d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
          clipRule="evenodd" />
      </svg>
    </label>
  )
}
