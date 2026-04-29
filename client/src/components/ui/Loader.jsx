import React from 'react'

function Loader() {
  return (
    // 1. Full Screen Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      
      {/* Container for Loader Elements */}
      <div className="flex flex-col items-center">
        
        {/* The Animation Wrapper */}
        <div className="relative flex items-center justify-center h-24 w-24">
          
          {/* 2. The Spinning Ring */}
          <div className="absolute h-full w-full rounded-full border-4 border-gray-200 border-t-blue-500 border-r-blue-500 animate-spin"></div>
          
          {/* 3. The House Icon (Static/Pulsing) */}
          <div className="z-10 animate-pulse text-slate-700">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="h-10 w-10"
            >
              <path d="M11.03 2.59a1.501 1.501 0 0 1 1.94 0l7.5 5.5a1.5 1.5 0 0 1 .53 1.15v10.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5v-4h-2v4a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 2 19.74V9.24c0-.4.16-.78.44-1.06l8.59-5.59Z" />
            </svg>
          </div>
          
        </div>

        {/* 4. Loading Text */}
        {/* <span className="mt-4 text-sm font-semibold text-slate-500 animate-pulse">
          Finding Professionals...
        </span> */}

      </div>
    </div>
  )
}

export default Loader
