import React from "react";
import Navbar from "./Navbar";

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-1 fixed top-0 left-0 w-full z-10">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl font-serif p-1 rounded-md">InfraFlow Sample</h1>
        <Navbar />
      </div>
    </header>
  );
};

export default Header;
