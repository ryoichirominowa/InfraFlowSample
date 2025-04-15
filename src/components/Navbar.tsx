import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-gray-800 text-white p-4">
      {/* ハンバーガーアイコン */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white focus:outline-none md:hidden"
        >
          {/* 三本線のアイコン */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
      </div>

      {/* ナビゲーションメニュー */}
      <ul
        className={`mt-2 md:flex md:space-x-4 md:mt-0 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {[
          { path: "/", label: "Model 1" },
          { path: "/sample2", label: "Model 2" },
          { path: "/sample3", label: "Model 3" },
          { path: "/sample4", label: "Model 4" },
          { path: "/sample5", label: "Model 5" },
          { path: "/sample6", label: "Model 6" },
          { path: "/sample7", label: "Model 7" },
          { path: "/sample8", label: "Model 8" },
          { path: "/sample9", label: "Model 9" },
        ].map(({ path, label }) => (
          <li key={path} className="md:inline-block">
            <Link
              to={path}
              className={`block px-3 py-2 rounded ${
                location.pathname === path ? "bg-blue-500" : "hover:bg-gray-700"
              }`}
              onClick={() => setIsOpen(false)} // メニュー選択時に閉じる
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
