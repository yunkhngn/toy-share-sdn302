import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, ShoppingBag, LogOut, Package, Clock } from "lucide-react";
import { Button } from "./ui/Button";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-full bg-[#00b05b] flex items-center justify-center text-white font-extrabold text-xl shadow-xs group-hover:scale-105 transition-transform">
            T
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-gray-900">
            toy<span className="text-[#00b05b]">share</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-semibold transition-colors relative py-1 ${
              isActive("/") ? "text-gray-900 border-b-2 border-[#00b05b]" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Trang chủ
          </Link>
          {user && (
            <>
              <Link
                to="/my-toys"
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive("/my-toys") ? "text-gray-900 border-b-2 border-[#00b05b]" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Package className="w-4 h-4 text-gray-400" />
                Đồ của tôi
              </Link>
              <Link
                to="/requests"
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive("/requests") ? "text-gray-900 border-b-2 border-[#00b05b]" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Clock className="w-4 h-4 text-gray-400" />
                Mượn / Trả
              </Link>
            </>
          )}
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đồ chơi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100/80 hover:bg-gray-100 focus:bg-white text-sm rounded-full w-52 sm:w-64 focus:w-72 transition-all border border-transparent focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00b05b]/20"
            />
          </form>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/requests" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors relative" title="Quản lý mượn/trả">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00b05b] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  !
                </span>
              </Link>
              <div className="flex items-center gap-2 pl-2">
                <span className="text-sm font-bold text-gray-800 hidden lg:inline">
                  {user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="rounded-full px-3"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="primary" className="rounded-full px-6 py-2 text-sm bg-[#00b05b] hover:bg-[#00964d]">
                  Đăng nhập
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
