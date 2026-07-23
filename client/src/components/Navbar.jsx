import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, Package, Clock, LogOut, User, LogIn } from "lucide-react";
import { Button } from "./ui/Button";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <span>ToySharing</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Khám phá đồ chơi
          </Link>
          {user && (
            <>
              <Link to="/my-toys" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-600">
                <Package className="w-4 h-4" />
                Đồ của tôi
              </Link>
              <Link to="/requests" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-600">
                <Clock className="w-4 h-4" />
                Quản lý Mượn/Trả
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <User className="w-4 h-4 text-gray-400" />
                {user.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut className="w-4 h-4 mr-1" />
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="w-4 h-4 mr-1" />
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
