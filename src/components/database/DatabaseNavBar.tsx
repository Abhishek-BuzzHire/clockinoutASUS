'use client'

import React from 'react';
import Link from 'next/link';
import { Users, Building, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

const DatabaseNavbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className=''>
      <div className="container mx-auto px-4">
        <div className="flex justify-end items-center h-16">

          <div className="hidden md:flex space-x-4">
            <NavLink
              to="/database/bulk-upload"
              icon={<Users size={18} />}
              label="Bulk Upload"
              isActive={pathname === '/database/bulk-upload'}
            />
            <NavLink
              to="/database/add-candidate"
              icon={<Users size={18} />}
              label="Add Candidate"
              isActive={pathname === '/database/add-candidate'}
            />
          </div>

          <div className="md:hidden">
            <button className="flex items-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav - simplified for MVP */}
      <div className="md:hidden border-t border-gray-200 bg-white fixed bottom-0 w-full shadow-lg">
        <div className="flex justify-around py-2">
          <MobileNavLink
            to="/database/bulk-upload"
            icon={<Users size={20} />}
            label="Bulk"
            isActive={pathname === '/database/bulk-upload'}
          />
          <MobileNavLink
            to="/database/add-candidate"
            icon={<Users size={20} />}
            label="Add"
            isActive={pathname === '/database/add-candidate'}
          />
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link
      href={to}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
        ${isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
        }`}
    >
      <span className="mr-1.5">{icon}</span>
      {label}
    </Link>
  );
};

const MobileNavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link
      href={to}
      className={`flex flex-col items-center justify-center px-3 py-1 text-xs font-medium rounded-md transition-colors duration-150 ease-in-out
        ${isActive
          ? 'text-blue-600'
          : 'text-gray-500 hover:text-blue-600'
        }`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </Link>
  );
};

export default DatabaseNavbar;