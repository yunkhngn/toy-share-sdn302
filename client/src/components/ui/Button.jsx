import React from "react";

export function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const base = "inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95";
  const variants = {
    primary: "bg-[#00b05b] hover:bg-[#00964d] text-white shadow-xs",
    secondary: "bg-[#f4f5f7] hover:bg-gray-200 text-gray-800",
    outline: "border border-gray-200 hover:border-[#00b05b] hover:text-[#00b05b] text-gray-800 bg-white",
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    success: "bg-[#00b05b] hover:bg-[#00964d] text-white",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
