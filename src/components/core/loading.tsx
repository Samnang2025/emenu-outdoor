import React from 'react'

export default function Loading({ className }: { className: string }) {
  return (
    <div className={className}>
      <div className='flex justify-center items-center flex-col'>
        <div className='h-10 w-10 border-4 rounded-full border-black border-dotted animate-spin '></div>
        <p className='font-battambong'>សូមរង់ចាំបន្តិច...</p>
      </div>
    </div>
  )
}
