import React from 'react'
import Footer from '../../components/Footer'
import HowItWorks from '../../components/HowItWorks'
import Navbar from '../../components/Navbar'

function ServiceProviders() {
  return (
    <>
    <Navbar/>
    <div className='flex flex-col justify-center items-center '>
      <h1 className='text-3xl font-bold text-textprimary mt-5 '>Professtional and 100% Trusted Workers</h1>
      <p>Here are the best workers that are provided to you for you any work</p>
    <HowItWorks/>
    </div>
    <Footer/>
    </>
  )
}

export default ServiceProviders