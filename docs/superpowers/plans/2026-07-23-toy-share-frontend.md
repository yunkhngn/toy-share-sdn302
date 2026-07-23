# Frontend Implementation Plan — Toy Sharing (SDN302)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean, intuitive, and responsive React frontend for the Toy Sharing platform using React Router v7, Tailwind CSS v4, Lucide icons, and Shadcn UI styled components.

**Architecture:** A SPA with React Router DOM for routing. `AuthContext` provides global user auth state and JWT handling. API services are grouped under `client/src/api/`. UI elements use modular React components with Tailwind CSS styling and Lucide icons.

**Tech Stack:** React 19, Vite, React Router DOM (`react-router-dom`), Tailwind CSS v4 (`@tailwindcss/vite`), `lucide-react`, `clsx`, `tailwind-merge`.

## Global Constraints

- Use `react-router-dom` for client routing.
- Store JWT token in `localStorage` under key `token`.
- Base API URL is `/api` (handled by Vite proxy).
- Standardized status colors: `available` (green), `borrowed` (blue), `requested` (yellow), `returned` (purple), `rejected`/`canceled` (red/gray).

---

### Task 1: Install Dependencies & Setup Auth & API Foundations

**Files:**
- Modify: `client/package.json`
- Modify: `client/src/main.jsx`
- Create: `client/src/api/client.js`
- Create: `client/src/context/AuthContext.jsx`
- Modify: `client/src/index.css`

**Interfaces:**
- Produces: `useAuth()` hook delivering `{ user, token, login, logout, loading, updateUser }`
- Produces: `request(path, options)` function with auto `Authorization: Bearer <token>` header support

- [ ] **Step 1: Install frontend dependencies**

Run: `npm install react-router-dom lucide-react clsx tailwind-merge --prefix client`

- [ ] **Step 2: Setup API Client in `client/src/api/client.js`**

```javascript
const BASE_URL = "/api";

export async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Lỗi yêu cầu: ${res.status}`);
  }

  return res.json();
}

export function getImageUrl(path) {
  if (!path) return "https://placehold.co/400x300?text=No+Image";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path.startsWith("/") ? path : `/${path}`;
}
```

- [ ] **Step 3: Create `AuthContext.jsx` in `client/src/context/AuthContext.jsx`**

```javascript
import { createContext, useContext, useState, useEffect } from "react";
import { request } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      request("/auth/me")
        .then((data) => setUser(data.user || data))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

- [ ] **Step 4: Update `client/src/main.jsx` with Router and AuthProvider**

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 5: Verify build & linting**

Run: `npm run build --prefix client`

- [ ] **Step 6: Commit**

```bash
git add client/package.json client/src/api/client.js client/src/context/AuthContext.jsx client/src/main.jsx
git commit -m "feat(client): setup API client, AuthContext and Router foundation"
```

---

### Task 2: Build Reusable UI & Layout Components

**Files:**
- Create: `client/src/components/Navbar.jsx`
- Create: `client/src/components/ui/Button.jsx`
- Create: `client/src/components/ui/Card.jsx`
- Create: `client/src/components/ui/Badge.jsx`
- Create: `client/src/components/ui/Modal.jsx`
- Create: `client/src/components/ui/Toast.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Produces: `<Navbar />` header component
- Produces: `<Button />`, `<Card />`, `<Badge />`, `<Modal />` UI components

- [ ] **Step 1: Create `Button.jsx` in `client/src/components/ui/Button.jsx`**

```javascript
import React from "react";

export function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-xs",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };
  const sizes = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Create `Badge.jsx` in `client/src/components/ui/Badge.jsx`**

```javascript
import React from "react";

export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Create `Modal.jsx` in `client/src/components/ui/Modal.jsx`**

```javascript
import React, { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    if (isOpen) document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `Navbar.jsx` in `client/src/components/Navbar.jsx`**

```javascript
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
```

- [ ] **Step 5: Commit**

```bash
git add client/src/components/
git commit -m "feat(client): add reusable Navbar, Button, Badge, and Modal components"
```

---

### Task 3: Auth Pages (Login & Register)

**Files:**
- Create: `client/src/page/Login.jsx`
- Create: `client/src/page/Register.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Produces: `/login` and `/register` route components communicating with `POST /api/auth/login` and `POST /api/auth/register`

- [ ] **Step 1: Create `Login.jsx` in `client/src/page/Login.jsx`**

```javascript
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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Đăng nhập tài khoản</h2>
        {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="example@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `Register.jsx` in `client/src/page/Register.jsx`**

```javascript
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { request } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

export function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Tạo tài khoản mới</h2>
        {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input type="text" name="name" required value={form.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input type="password" name="password" required value={form.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Đang tạo..." : "Đăng ký"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/page/Login.jsx client/src/page/Register.jsx
git commit -m "feat(client): add Login and Register pages"
```

---

### Task 4: Browse Toys Page (`/`) & Toy Cards

**Files:**
- Create: `client/src/page/Home.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Produces: Home page with search bar, category/age filter dropdowns, and toy grid displaying status badges.

- [ ] **Step 1: Create `Home.jsx` in `client/src/page/Home.jsx`**

```javascript
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { request, getImageUrl } from "../api/client";
import { Search, Filter, Sparkles } from "lucide-react";
import { Badge } from "../components/ui/Badge";

export function Home() {
  const [toys, setToys] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchToys = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (ageGroup) params.append("ageGroup", ageGroup);

      const data = await request(`/toys?${params.toString()}`);
      setToys(data.data || data.toys || data);
    } catch (err) {
      console.error("Lỗi tải đồ chơi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToys();
  }, [search, category, ageGroup]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-md flex items-center justify-between">
        <div className="space-y-2 max-w-xl">
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            Chia sẻ đồ chơi, lan toả niềm vui <Sparkles className="text-amber-300" />
          </h1>
          <p className="text-blue-100 text-sm">
            Nền tảng mượn và cho mượn đồ chơi cho bé an toàn, tiết kiệm và thân thiện.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên đồ chơi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tất cả danh mục</option>
            <option value="Gấu bông">Gấu bông</option>
            <option value="Xếp hình">Xếp hình</option>
            <option value="Đua xe">Đua xe</option>
            <option value="Búp bê">Búp bê</option>
            <option value="Khác">Khác</option>
          </select>

          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tất cả độ tuổi</option>
            <option value="0-2 tuổi">0-2 tuổi</option>
            <option value="3-5 tuổi">3-5 tuổi</option>
            <option value="6-8 tuổi">6-8 tuổi</option>
            <option value="9+ tuổi">9+ tuổi</option>
          </select>
        </div>
      </div>

      {/* Toy Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải danh sách đồ chơi...</div>
      ) : toys.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Không tìm thấy đồ chơi phù hợp.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {toys.map((toy) => {
            const isAvailable = toy.status === "available";
            const imageUrl = toy.images && toy.images.length > 0 ? getImageUrl(toy.images[0]) : "https://placehold.co/400x300?text=No+Image";

            return (
              <Link
                key={toy._id}
                to={`/toys/${toy._id}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={toy.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={isAvailable ? "success" : "warning"}>
                      {isAvailable ? "Sẵn sàng" : "Đang mượn"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
                      {toy.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{toy.description}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>{toy.category || "Khác"}</span>
                    <span>{toy.ageGroup || "Mọi lứa tuổi"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/page/Home.jsx
git commit -m "feat(client): add Home page with search, filters and toy cards grid"
```

---

### Task 5: Toy Detail Page (`/toys/:id`) & Request Modal

**Files:**
- Create: `client/src/page/ToyDetail.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Produces: `/toys/:id` page displaying toy info, reviews, owner details, and a modal to submit borrow requests (`POST /api/requests`).

- [ ] **Step 1: Create `ToyDetail.jsx` in `client/src/page/ToyDetail.jsx`**

```javascript
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { request, getImageUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Star, User, Calendar, Tag, Info } from "lucide-react";

export function ToyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [toy, setToy] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const toyData = await request(`/toys/${id}`);
        setToy(toyData.data || toyData);

        const reviewsData = await request(`/reviews/toy/${id}`);
        setReviews(reviewsData.data || reviewsData);
      } catch (err) {
        console.error("Lỗi tải chi tiết đồ chơi:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleRequestBorrow = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await request("/requests", {
        method: "POST",
        body: JSON.stringify({ toyId: id, startDate, endDate, note }),
      });
      setSuccess("Gửi yêu cầu mượn thành công!");
      setTimeout(() => {
        setIsModalOpen(false);
        navigate("/requests");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Đang tải chi tiết đồ chơi...</div>;
  if (!toy) return <div className="text-center py-16 text-gray-500">Không tìm thấy đồ chơi.</div>;

  const isOwner = user && toy.owner && (user._id === toy.owner._id || user._id === toy.owner);
  const isAvailable = toy.status === "available";
  const imageUrl = toy.images && toy.images.length > 0 ? getImageUrl(toy.images[0]) : "https://placehold.co/600x400?text=No+Image";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-2">
        <div className="h-80 md:h-auto bg-gray-100">
          <img src={imageUrl} alt={toy.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={isAvailable ? "success" : "warning"}>
                {isAvailable ? "Sẵn sàng mượn" : "Đang được mượn"}
              </Badge>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> {toy.category || "Chung"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{toy.name}</h1>
            <p className="text-gray-600 text-sm leading-relaxed">{toy.description}</p>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <div>Độ tuổi: <span className="font-semibold text-gray-900">{toy.ageGroup || "N/A"}</span></div>
              <div>Tình trạng: <span className="font-semibold text-gray-900">{toy.condition || "Tốt"}</span></div>
              <div className="flex items-center gap-1 col-span-2">
                <User className="w-4 h-4 text-gray-400" /> Chủ sở hữu: <span className="font-semibold text-gray-900">{toy.owner?.name || "Người dùng"}</span>
              </div>
            </div>
          </div>

          <div>
            {!user ? (
              <Button variant="primary" className="w-full" onClick={() => navigate("/login")}>
                Đăng nhập để mượn đồ chơi
              </Button>
            ) : isOwner ? (
              <div className="p-3 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-lg text-center">
                Bạn là chủ sở hữu đồ chơi này.
              </div>
            ) : !isAvailable ? (
              <Button variant="secondary" className="w-full" disabled>
                Đồ chơi đang được mượn
              </Button>
            ) : (
              <Button variant="primary" className="w-full" onClick={() => setIsModalOpen(true)}>
                Gửi yêu cầu mượn
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Đánh giá từ người dùng ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có đánh giá nào cho đồ chơi này.</p>
        ) : (
          <div className="space-y-3 divide-y divide-gray-100">
            {reviews.map((rev) => (
              <div key={rev._id} className="pt-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium text-gray-800">{rev.reviewer?.name || "Người mượn"}</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating}/5
                  </div>
                </div>
                <p className="text-sm text-gray-700">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Borrow Request */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yêu cầu mượn đồ chơi">
        {success ? (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg text-center font-medium">{success}</div>
        ) : (
          <form onSubmit={handleRequestBorrow} className="space-y-4">
            {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">{error}</div>}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ngày mượn dự kiến</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ngày trả dự kiến</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú cho chủ đồ chơi</label>
              <textarea
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Bé nhà mình muốn mượn chơi thử vài ngày..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting ? "Đang gửi..." : "Xác nhận gửi yêu cầu"}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/page/ToyDetail.jsx
git commit -m "feat(client): add ToyDetail page with reviews and borrow request modal"
```

---

### Task 6: My Toys Page (`/my-toys`) & Create/Edit/Delete Modals

**Files:**
- Create: `client/src/page/MyToys.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Produces: `/my-toys` management page with Add, Edit, Delete modals handling `FormData` multipart image uploads.

- [ ] **Step 1: Create `MyToys.jsx` in `client/src/page/MyToys.jsx`**

```javascript
import React, { useEffect, useState } from "react";
import { request, getImageUrl } from "../api/client";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Plus, Edit, Trash2, Package } from "lucide-react";

export function MyToys() {
  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingToy, setEditingToy] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Khác");
  const [ageGroup, setAgeGroup] = useState("3-5 tuổi");
  const [condition, setCondition] = useState("Tốt");
  const [imageFile, setImageFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchMyToys = async () => {
    setLoading(true);
    try {
      const data = await request("/toys/mine");
      setToys(data.data || data);
    } catch (err) {
      console.error("Lỗi tải đồ chơi của tôi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyToys();
  }, []);

  const openAddModal = () => {
    setEditingToy(null);
    setName("");
    setDescription("");
    setCategory("Khác");
    setAgeGroup("3-5 tuổi");
    setCondition("Tốt");
    setImageFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (toy) => {
    setEditingToy(toy);
    setName(toy.name);
    setDescription(toy.description || "");
    setCategory(toy.category || "Khác");
    setAgeGroup(toy.ageGroup || "3-5 tuổi");
    setCondition(toy.condition || "Tốt");
    setImageFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("ageGroup", ageGroup);
    formData.append("condition", condition);
    if (imageFile) {
      formData.append("images", imageFile);
    }

    try {
      if (editingToy) {
        await request(`/toys/${editingToy._id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        await request("/toys", {
          method: "POST",
          body: formData,
        });
      }
      setIsModalOpen(false);
      fetchMyToys();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (toyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá đồ chơi này?")) return;
    try {
      await request(`/toys/${toyId}`, { method: "DELETE" });
      fetchMyToys();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" /> Quản lý Đồ chơi của tôi
          </h1>
          <p className="text-xs text-gray-500 mt-1">Danh sách đồ chơi bạn đã đăng để cho mượn.</p>
        </div>
        <Button variant="primary" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-1" /> Đăng đồ chơi mới
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải danh sách...</div>
      ) : toys.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
          Bạn chưa đăng đồ chơi nào. Hãy bấm "Đăng đồ chơi mới" ở trên!
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-gray-100">
            {toys.map((toy) => (
              <div key={toy._id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <img
                    src={toy.images && toy.images.length > 0 ? getImageUrl(toy.images[0]) : "https://placehold.co/100x100?text=No+Image"}
                    alt={toy.name}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{toy.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>{toy.category}</span> • <span>{toy.ageGroup}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={toy.status === "available" ? "success" : "warning"}>
                    {toy.status === "available" ? "Sẵn sàng" : "Đang mượn"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(toy)}>
                      <Edit className="w-3.5 h-3.5 mr-1" /> Sửa
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(toy._id)}
                      disabled={toy.status !== "available"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingToy ? "Chỉnh sửa đồ chơi" : "Đăng đồ chơi mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">{error}</div>}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tên đồ chơi</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Gấu bông">Gấu bông</option>
                <option value="Xếp hình">Xếp hình</option>
                <option value="Đua xe">Đua xe</option>
                <option value="Búp bê">Búp bê</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Độ tuổi</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="0-2 tuổi">0-2 tuổi</option>
                <option value="3-5 tuổi">3-5 tuổi</option>
                <option value="6-8 tuổi">6-8 tuổi</option>
                <option value="9+ tuổi">9+ tuổi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tình trạng</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Mới">Mới</option>
                <option value="Tốt">Tốt</option>
                <option value="Cũ">Cũ</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Hình ảnh</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? "Đang lưu..." : editingToy ? "Cập nhật" : "Tạo đồ chơi"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/page/MyToys.jsx
git commit -m "feat(client): add MyToys management page with create, edit, delete modals"
```

---

### Task 7: Requests Dashboard (`/requests`) & Reviews Modal

**Files:**
- Create: `client/src/page/Requests.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Produces: `/requests` page with 2 tabs for Borrowed items and Lent items. Handles actions: Approve, Reject, Cancel, Report Return, Confirm Return, and Create Review.

- [ ] **Step 1: Create `Requests.jsx` in `client/src/page/Requests.jsx`**

```javascript
import React, { useEffect, useState } from "react";
import { request } from "../api/client";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Clock, CheckCircle, XCircle, RotateCcw, Star, Calendar } from "lucide-react";

export function Requests() {
  const [activeTab, setActiveTab] = useState("borrowed"); // borrowed | lent
  const [borrowedRequests, setBorrowedRequests] = useState([]);
  const [lentRequests, setLentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [borrowedData, lentData] = await Promise.all([
        request("/requests/borrowed"),
        request("/requests/lent"),
      ]);
      setBorrowedRequests(borrowedData.data || borrowedData);
      setLentRequests(lentData.data || lentData);
    } catch (err) {
      console.error("Lỗi tải yêu cầu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await request(`/requests/${id}/${action}`, { method: "PATCH" });
      fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const openReviewModal = (reqItem) => {
    setSelectedReq(reqItem);
    setRating(5);
    setComment("");
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;
    setSubmittingReview(true);
    try {
      await request("/reviews", {
        method: "POST",
        body: JSON.stringify({
          requestId: selectedReq._id,
          toyId: selectedReq.toy?._id || selectedReq.toy,
          rating: Number(rating),
          comment,
        }),
      });
      setReviewModalOpen(false);
      fetchRequests();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStatusBadge = (status) => {
    const map = {
      requested: { variant: "warning", text: "Chờ duyệt" },
      approved: { variant: "info", text: "Đã duyệt" },
      borrowed: { variant: "success", text: "Đang mượn" },
      returned: { variant: "purple", text: "Đã trả đồ" },
      rejected: { variant: "danger", text: "Từ chối" },
      canceled: { variant: "default", text: "Đã huỷ" },
    };
    const item = map[status] || { variant: "default", text: status };
    return <Badge variant={item.variant}>{item.text}</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" /> Quản lý Mượn & Cho mượn
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-8">
        <button
          onClick={() => setActiveTab("borrowed")}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === "borrowed"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Yêu cầu tôi đi mượn ({borrowedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("lent")}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === "lent"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Yêu cầu tới đồ của tôi ({lentRequests.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      ) : activeTab === "borrowed" ? (
        /* Tab 1: Borrowed Requests */
        borrowedRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            Bạn chưa gửi yêu cầu mượn đồ chơi nào.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
            {borrowedRequests.map((reqItem) => (
              <div key={reqItem._id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900">{reqItem.toy?.name || "Đồ chơi"}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(reqItem.startDate).toLocaleDateString("vi-VN")} - {new Date(reqItem.endDate).toLocaleDateString("vi-VN")}
                    </span>
                    <span>Chủ đồ: {reqItem.owner?.name || "Người dùng"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {renderStatusBadge(reqItem.status)}
                  <div className="flex items-center gap-2">
                    {reqItem.status === "requested" && (
                      <Button variant="outline" size="sm" onClick={() => handleAction(reqItem._id, "cancel")}>
                        Huỷ
                      </Button>
                    )}
                    {reqItem.status === "approved" && (
                      <Button variant="success" size="sm" onClick={() => handleAction(reqItem._id, "return")}>
                        Báo đã trả đồ
                      </Button>
                    )}
                    {reqItem.status === "returned" && !reqItem.isReviewed && (
                      <Button variant="primary" size="sm" onClick={() => openReviewModal(reqItem)}>
                        <Star className="w-3.5 h-3.5 mr-1 fill-white" /> Đánh giá
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Tab 2: Lent Requests */
        lentRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            Chưa có ai gửi yêu cầu mượn đồ chơi của bạn.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
            {lentRequests.map((reqItem) => (
              <div key={reqItem._id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900">{reqItem.toy?.name || "Đồ chơi"}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Người mượn: {reqItem.borrower?.name || "Người dùng"}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(reqItem.startDate).toLocaleDateString("vi-VN")} - {new Date(reqItem.endDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {renderStatusBadge(reqItem.status)}
                  <div className="flex items-center gap-2">
                    {reqItem.status === "requested" && (
                      <>
                        <Button variant="success" size="sm" onClick={() => handleAction(reqItem._id, "approve")}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Duyệt
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleAction(reqItem._id, "reject")}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Từ chối
                        </Button>
                      </>
                    )}
                    {reqItem.status === "returned" && (
                      <Button variant="primary" size="sm" onClick={() => handleAction(reqItem._id, "confirm-return")}>
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Xác nhận nhận lại đồ
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal Review */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Đánh giá đồ chơi">
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Chấm điểm (1 - 5 sao)</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5/5 - Rất tốt)</option>
              <option value="4">⭐⭐⭐⭐ (4/5 - Tốt)</option>
              <option value="3">⭐⭐⭐ (3/5 - Bình thường)</option>
              <option value="2">⭐⭐ (2/5 - Tạm được)</option>
              <option value="1">⭐ (1/5 - Kém)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Bình luận</label>
            <textarea
              rows="3"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Đồ chơi rất mới, bé nhà mình thích lắm..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={submittingReview}>
            {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
```

- [ ] **Step 2: Update `client/src/App.jsx` with routes**

```javascript
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./page/Home";
import { ToyDetail } from "./page/ToyDetail";
import { Login } from "./page/Login";
import { Register } from "./page/Register";
import { MyToys } from "./page/MyToys";
import { Requests } from "./page/Requests";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/toys/:id" element={<ToyDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-toys" element={<MyToys />} />
          <Route path="/requests" element={<Requests />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 3: Test build**

Run: `npm run build --prefix client`

- [ ] **Step 4: Commit**

```bash
git add client/src/page/Requests.jsx client/src/App.jsx
git commit -m "feat(client): add Requests dashboard with tabs and Review modal"
```
