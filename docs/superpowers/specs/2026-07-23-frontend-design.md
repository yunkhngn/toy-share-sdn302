# Frontend Design Specification — Toy Sharing (SDN302)

Date: 2026-07-23  
Status: Approved  

## 1. Overview & Objectives

Building a clean, modern, and easy-to-use React frontend for the **Toy Sharing** platform (MERN stack). The backend REST API is fully functional. The frontend will focus on high usability, clean Shadcn UI-styled components, responsive layout using Tailwind CSS v4, and intuitive routing via React Router DOM.

---

## 2. Technical Stack & Architecture

- **Framework**: React 19 + Vite
- **Routing**: `react-router-dom` v7
- **Styling & UI**: Tailwind CSS v4 + `lucide-react` icons + Shadcn UI primitive styling (Card, Button, Dialog, Badge, Tabs, Input, Select, Toast)
- **State Management**:
  - `AuthContext`: Token management stored in `localStorage`, active user state, `login`, `logout`, `updateUser`
  - React `useState` & `useEffect` for local page/component states
- **API Client Layer** (`src/api/`):
  - `client.js`: Generic fetch wrapper supporting JWT headers (`Authorization: Bearer <token>`), error parsing, and FormData handling for image uploads.
  - Sub-modules: `auth.api.js`, `toy.api.js`, `request.api.js`, `review.api.js`.

---

## 3. Navigation & Route Layout

```
/                     -> Home / Browse Toys (Public)
/toys/:id             -> Toy Detail + Borrow Request Modal + Reviews List (Public/Auth)
/my-toys              -> Manage My Toys + Create/Edit Modals (Auth Required)
/requests             -> Borrow & Lend Management Dashboard (Auth Required)
/login                -> User Login (Public)
/register             -> User Registration (Public)
```

### Shared Layout Structure
- **Navbar (Header)**:
  - Brand Logo + Title (`Toy Sharing`)
  - Navigation links: `Khám phá đồ chơi`, `Đồ của tôi`, `Lịch sử mượn/trả`
  - User Action area: If authenticated, shows User Name/Avatar + `Logout` button; if guest, shows `Đăng nhập` and `Đăng ký` buttons.
- **Main Container**: Centered responsive content container (`max-w-7xl mx-auto px-4 py-6`).
- **Toast Provider**: Global floating notification toast for feedback on actions (e.g., success messages, validation errors).

---

## 4. Detailed Component & Page Design

### 4.1. Browse Toys Page (`/`)
- **Search & Filter Bar**:
  - Input field for keyword search (name/description).
  - Select dropdown for Category (e.g., `Gấu bông`, `Xếp hình`, `Đua xe`, `Búp bê`, `Khác`).
  - Select dropdown for Age Range (e.g., `0-2 tuổi`, `3-5 tuổi`, `6-8 tuổi`, `9+ tuổi`).
  - Select dropdown for Condition (`Mới`, `Tốt`, `Cũ`).
- **Toy Grid**:
  - Product Cards displaying Image (or placeholder if none), Toy Name, Category, Age group, Owner name, and Status Badge (`Sẵn sàng` [Green] vs `Đang mượn` [Orange]).
  - Clicking card navigates to `/toys/:id`.

### 4.2. Toy Detail Page (`/toys/:id`)
- **Toy Information Section**:
  - Large main image + details (Title, Category, Age group, Condition, Status, Owner details).
  - Description paragraph.
  - Action button: **Yêu cầu mượn đồ chơi** (Disabled if user is owner or toy is currently borrowed).
- **Borrow Request Modal**:
  - Modal form specifying `startDate` (Ngày mượn) and `endDate` (Ngày trả dự kiến), plus optional note.
- **Reviews Section**:
  - Displays average rating score & star icons.
  - List of reviews with reviewer name, rating stars, comment text, and date.

### 4.3. My Toys Page (`/my-toys`)
- **Header**: Summary count of owned toys + **+ Đăng đồ chơi mới** button.
- **Add/Edit Toy Dialog Modal**:
  - Form fields: Name, Description, Category, Age range, Condition, Image file upload (`input type="file"`).
  - Handles multipart `FormData` submit to `/api/toys`.
- **My Toys Table / Grid**:
  - Shows owned toys with action buttons: **Chỉnh sửa** (opens Edit Modal) and **Xoá** (with confirmation dialog, blocked if currently borrowed).

### 4.4. Requests Management Page (`/requests`)
Uses a 2-tab view interface:
- **Tab 1: Yêu cầu tôi gửi (My Borrow Requests)**
  - Table / Card list of requests sent by current user.
  - Status badges: `requested` (Vàng), `approved` (Xanh dương), `borrowed` (Xanh lá), `returned` (Tím), `rejected` (Đỏ), `canceled` (Xám).
  - Contextual Actions:
    - `requested` status -> **Huỷ yêu cầu** button
    - `approved` status -> **Đang mượn / Báo đã trả** button
    - `returned` status -> **Viết đánh giá** button (opens Review Modal with Star Rating & Comment text)
- **Tab 2: Yêu cầu tới đồ của tôi (Lending Requests for My Toys)**
  - Table / Card list of incoming borrow requests from other users for toys owned by current user.
  - Contextual Actions:
    - `requested` status -> **Duyệt (Approve)** & **Từ chối (Reject)** buttons
    - `returned` status -> **Xác nhận đã nhận lại đồ (Confirm Return)** button (resets toy to `available`)

### 4.5. Auth Pages (`/login`, `/register`)
- Sleek centered Shadcn Card design with form validation and clear toggle links between Login and Register.

---

## 5. Data Flow & API Endpoint Mapping

| Action | API Endpoint | HTTP Method | Payload / Queries |
|---|---|---|---|
| Login | `/api/auth/login` | POST | `{ email, password }` |
| Register | `/api/auth/register` | POST | `{ name, email, password, phone, address }` |
| Get User Profile | `/api/auth/me` | GET | Headers: `Bearer token` |
| List Toys | `/api/toys` | GET | `?search=&category=&ageGroup=&condition=&status=&page=&limit=` |
| Get Toy Detail | `/api/toys/:id` | GET | - |
| List My Toys | `/api/toys/mine` | GET | Headers: `Bearer token` |
| Create Toy | `/api/toys` | POST | `FormData` (images, name, description, category, ageGroup, condition) |
| Update Toy | `/api/toys/:id` | PUT | `FormData` |
| Delete Toy | `/api/toys/:id` | DELETE | - |
| Submit Request | `/api/requests` | POST | `{ toyId, startDate, endDate, note }` |
| Get Borrowed | `/api/requests/borrowed` | GET | - |
| Get Lent | `/api/requests/lent` | GET | - |
| Approve Request | `/api/requests/:id/approve` | PATCH | - |
| Reject Request | `/api/requests/:id/reject` | PATCH | - |
| Cancel Request | `/api/requests/:id/cancel` | PATCH | - |
| Report Return | `/api/requests/:id/return` | PATCH | - |
| Confirm Return | `/api/requests/:id/confirm-return` | PATCH | - |
| Create Review | `/api/reviews` | POST | `{ requestId, toyId, rating, comment }` |
| Get Toy Reviews | `/api/reviews/toy/:toyId` | GET | - |

---

## 6. Self-Review Checklist

- [x] Placeholder scan: No TBD, TODO, or vague requirements.
- [x] Internal consistency: Router endpoints, API mappings, and status lifecycles align with backend logic.
- [x] Scope check: Focused strictly on completing the React frontend for the Toy Sharing project.
- [x] Ambiguity check: Actions, tab structures, and status transitions are explicitly detailed.
