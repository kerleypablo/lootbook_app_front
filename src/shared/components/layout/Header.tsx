"use client";
import React from "react";
import { motion } from "framer-motion";
import GoblinSymbol from "@/assets/goblinsymbol.svg";
import Logo from "@/assets/logo.svg";

interface HeaderProps {
  profileName: string;
  profileImage: string;
}

const Header: React.FC<HeaderProps> = ({ profileName, profileImage }) => {
  return (
    <header
      className="flex w-full items-center justify-between px-4 py-4"
      style={{ justifyContent: "space-between" }}
    >
      <div className="flex flex-shrink-0 items-center gap-2">
        <GoblinSymbol
          className="block flex-shrink-0"
          style={{ display: "block", width: 44, height: 42, color: "#ef4444" }}
        />
        <Logo
          className="block flex-shrink-0"
          style={{ display: "block", width: 146, height: 35, color: "#ef4444" }}
        />
      </div>

      <div className="ml-auto flex flex-shrink-0 items-start gap-4">
        <div className="flex flex-col items-end text-right leading-none">
          <p className="text-[14px] font-normal text-[#9CA3AF]">Profile</p>
          <p className="mt-[6px] text-[15px] font-semibold text-white">
            {profileName}
          </p>
        </div>
        <motion.div
          className="mt-[4px] flex-shrink-0 overflow-hidden rounded-full"
          style={{ width: 46, height: 46, borderRadius: 9999 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Profile"
          title={profileName}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              backgroundImage: `url(${profileImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
