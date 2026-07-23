import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { request } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xs border border-gray-100 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#00b05b] text-white text-2xl font-extrabold flex items-center justify-center mx-auto shadow-xs">
            T
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Đăng nhập tài khoản</h2>
          <p className="text-xs font-semibold text-gray-500">Chào mừng bạn quay lại với ToyShare</p>
        </div>

        {error && <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-2xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#f4f5f7] border border-transparent focus:border-[#00b05b] focus:bg-white rounded-2xl text-sm font-medium focus:outline-none transition-all"
              placeholder="example@gmail.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#f4f5f7] border border-transparent focus:border-[#00b05b] focus:bg-white rounded-2xl text-sm font-medium focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full bg-[#00b05b] hover:bg-[#00964d] rounded-2xl py-3 text-sm font-bold shadow-xs" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>

        <p className="text-center text-xs font-semibold text-gray-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-[#00b05b] hover:underline font-extrabold">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
