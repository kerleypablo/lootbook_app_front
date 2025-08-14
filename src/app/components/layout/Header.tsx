"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import GoblinSymbol from '@/assets/goblinsymbol.svg';
import Logo from '@/assets/logo.svg';


interface HeaderProps {
  profileName: string;
  profileImage: string;
}

const Header: React.FC<HeaderProps> = ({ profileName, profileImage }) => {
  return (
    <header className="w-full flex justify-between items-center p-4">
      <div className="flex items-center space-x-2">
        {/* SVG como componente React */}
        <div className="flex items-center justify-center w-15 h-8 text-teal-400">
          <GoblinSymbol className="w-25 h-100 text-red-500" />
        </div>

        <div className="flex items-center justify-center w-90 h-8 text-teal-400">
          <Logo className="w-25 h-100 text-red-500" />
        </div>
      </div>

      {/* Perfil do usuário */}
      <div className="flex items-center gap-2">
        <div className="text-right mr-2">
          <p className="text-sm text-gray-400">Profile</p>
          <p className="text-sm font-medium">{profileName}</p>
        </div>
        <motion.div
          className="w-10 h-10 rounded-full overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Image
            src={profileImage || '/images/default-avatar.png'}
            alt="Profile"
            width={40}
            height={40}
            className="object-cover"
          />
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
