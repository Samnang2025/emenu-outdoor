import React from 'react'

export default function PageNotFound({ error }: { error: string }) {
  return (
    <div className='h-screen fixed w-full z-100 bg-white top-0 text-xl text-center flex justify-center items-center  left-0 '>
      {error}
    </div>
  )
}
