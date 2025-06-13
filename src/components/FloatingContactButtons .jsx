import React, { useState } from "react";
import phone from "../assets copy/slider/banner/phone.png";
import meseger from "../assets copy/slider/banner/meseger.png";
import { FaCommentDots } from "react-icons/fa";

const FloatingContactButtons = () => {
  const [showButtons, setShowButtons] = useState(false);

  const toggleButtons = () => setShowButtons(!showButtons);

  const buttonBaseClass =
    "flex items-center bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-300 transform";

  return (
    <div className='fixed right-4 bottom-4 flex flex-col items-end gap-3 z-50'>
      {/* Toggle button */}
      <button
        onClick={toggleButtons}
        className='bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition duration-300'>
        <FaCommentDots size={24} />
      </button>

      {/* Animated buttons */}
      <div className='flex flex-col gap-3'>
        <div
          className={`${buttonBaseClass} ${
            showButtons
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 pointer-events-none"
          } transition duration-300 delay-100`}>
          <a
            href='https://m.me/yourpageusername'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center'>
            <div className='bg-blue-500 rounded-full p-2'>
              <img src={meseger} alt='messenger' className='w-6 h-6' />
            </div>
            <span className='ml-2 mr-2 text-gray-700 font-medium'>
              Messenger
            </span>
          </a>
        </div>

        <div
          className={`${buttonBaseClass} ${
            showButtons
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 pointer-events-none"
          } transition duration-300 delay-200`}>
          <a
            href='https://zalo.me/yourphonenumber'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center'>
            <div
              className='bg-blue-400 rounded-full p-2 flex items-center justify-center'
              style={{ width: "36px", height: "36px" }}>
              <span className='text-white font-bold text-sm'>Zalo</span>
            </div>
            <span className='ml-2 mr-2 text-gray-700 font-medium'>
              Chat Zalo
            </span>
          </a>
        </div>

        <div
          className={`${buttonBaseClass} ${
            showButtons
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 pointer-events-none"
          } transition duration-300 delay-300`}>
          <a href='tel:078608494' className='flex items-center'>
            <div className='bg-blue-500 rounded-full p-2'>
              <img src={phone} alt='phone' className='w-6 h-6' />
            </div>
            <span className='ml-2 mr-2 text-gray-700 font-medium'>Phone</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FloatingContactButtons;
