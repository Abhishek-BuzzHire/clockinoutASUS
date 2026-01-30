import Image from "next/image";
import { useState } from "react";

const ActionButton = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className=''>
        <div className="relative">
        <div
          className="bg-indigo-600 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer shadow-md hover:bg-indigo-700 transition-colors"
          onClick={() => {
            setIsCreateOpen(!isCreateOpen);
          }}
        >
          <Image className="invert brightness-0" src="/plus.png" alt="Create" width={20} height={20} />
        </div>
        {isCreateOpen && (
          <div className="absolute text-sm top-5 right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-10 transition-all duration-200 ease-in-out">
            <ul className="py-2">
              <li className="px-4 py-1 hover:bg-gray-100 cursor-pointer">Add Candidate</li>
              <li className="px-4 py-1 hover:bg-gray-100 cursor-pointer">Add Event</li>
              <li className="px-4 py-1 hover:bg-gray-100 cursor-pointer">Add Job</li>
              <li className="px-4 py-1 hover:bg-gray-100 cursor-pointer">Add Client</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActionButton