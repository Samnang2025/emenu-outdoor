import React from 'react'
import Image from 'next/image'

type PropsType = {
  image: string
  className?: any
}

export default function Logo({ image, className }: PropsType) {
  return (
    <div className={`h-100 w-100 ${className}`}>
      <img
        alt=''
        className='w-full h-full object-contain cursor-pointer'
        src="/images/tonle.jpg"
        width={100}
        height={100}
        onClick={() => (document.getElementById('my_modal_2') as HTMLDialogElement).showModal()}
      />
    </div>
  );
}
