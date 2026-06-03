import React from 'react'

const AuthLayout=({children})=> {
  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col">{children}</div>
  )
}

export default AuthLayout;