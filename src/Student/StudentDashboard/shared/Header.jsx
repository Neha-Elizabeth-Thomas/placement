import React, { useState } from 'react';
import { HiOutlineChatAlt, HiOutlineSearch } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import ChatBot from '../chatbot'; // Import the ChatBot component

const Header = () => {
  const [isModalOpen, setModalOpen] = useState(false); // state for modal visibility
  const [isDropdownOpen, setDropdownOpen] = useState(false); // state for dropdown visibility
  const [isChatOpen, setChatOpen] = useState(false); // state for chatbot visibility

  const toggleModal = () => {
    setModalOpen(!isModalOpen); // toggle the modal visibility
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen); // toggle the dropdown visibility
  };

  const toggleChat = () => {
    setChatOpen(!isChatOpen); // toggle the chatbot visibility
  };

  return (
    <div className='flex h-16 px-4 justify-between items-center bg-white border-b border-gray-300'>
      {/* Div for search button */}
      <div className='relative'>
        <HiOutlineSearch fontSize={20} className='absolute top-1/2 -translate-y-1/2 left-3'/>
        <input
          type="text"
          placeholder='search company name...'
          className='text-sm h-10 w-[24rem] border border-gray-700 rounded-sm pl-11 pr-4 focus:outline-none active:outline-none'
        />
      </div>
      
      {/* Other icons and links */}
      <div className='flex items-center gap-6 mr-2'>
        <Link
          to="/"
          className="text-Navy text-lg font-bold hover:text-red-700 decoration-white outline-none hover:decoration-2"
        >
          Home
        </Link>
        
        {/* Chat Icon */}
        <HiOutlineChatAlt
          fontSize={24}
          className='hover:bg-slate-200 cursor-pointer'
          onClick={toggleChat} // Open the chatbot when clicked
        />

        {/* User Icon with Dropdown */}
        <div className='relative'>
          <button onClick={toggleDropdown} className='w-8 h-8'>
            <FaUserCircle fontSize={24} className='hover:bg-slate-200 cursor-pointer' />
          </button>

          {isDropdownOpen && (
            <div className='z-10 absolute right-0 mt-2 bg-white rounded-lg shadow w-32'>
              <ul className='py-2 text-sm text-gray-600'>
                <li>
                  <Link to="/profile" className='block px-4 py-2 hover:bg-gray-200'>
                    Profile
                  </Link>
                </li>
                {/* Add more links here if needed */}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
            <p className="text-black">
              Best Opportunity For Final year students, TCS is going to visit. Must apply for the Drive!
            </p>
            <button
              onClick={toggleModal}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Chatbot */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <ChatBot onClose={toggleChat} /> {/* Pass a function to close the chatbot */}
        </div>
      )}
    </div>
  );
};

export default Header;