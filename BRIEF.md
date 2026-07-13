# Toy Sharing — Project Brief (SDN302)

> Nền tảng chia sẻ đồ chơi trẻ em: người dùng đăng đồ chơi mình có để cho mượn, và mượn đồ chơi của người khác.

## 1. Tổng quan

| | |
|---|---|
| **Tên project** | Toy Sharing |
| **Môn học** | SDN302 |
| **Tech stack** | MongoDB + Express + React (Vite) + Node.js (MERN) |
| **Frontend** | Vite + React + Tailwind CSS |
| **Auth** | JWT (access token) |
| **Cấu trúc** | Monorepo: `/server` (Express API) + `/client` (React) |

## 2. Người dùng & phân quyền

Chỉ có **một loại user** (user kép) — mỗi người dùng đồng thời:

- **Owner**: đăng, sửa, xoá đồ chơi của mình; duyệt/từ chối yêu cầu mượn; xác nhận nhận lại đồ.
- **Borrower**: tìm kiếm, gửi yêu cầu mượn, trả đồ, đánh giá sau khi mượn.

Không có role Admin.

## 3. Tính năng chính

### 3.1. Xác thực (Auth)
- Đăng ký, đăng nhập (email + password, hash bằng bcrypt).
- JWT gắn vào request để bảo vệ các API cần đăng nhập.
- Xem / cập nhật profile cá nhân.

### 3.2. Quản lý đồ chơi (CRUD)
- Tạo đồ chơi mới: tên, mô tả, danh mục, độ tuổi phù hợp, tình trạng (mới/tốt/cũ), ảnh.
- Upload ảnh đồ chơi (multer, lưu local `/uploads`).
- Sửa / xoá đồ chơi — **chỉ owner** của đồ chơi đó.
- Không cho xoá/sửa trạng thái khi đồ chơi đang được mượn.

### 3.3. Tìm kiếm & lọc
- Search theo tên (text search / regex).
- Lọc theo: danh mục, độ tuổi, tình trạng, trạng thái (available / borrowed).
- Phân trang danh sách.

### 3.4. Mượn / trả (luồng Request → Approve → Return)

```
[requested] ──owner approve──> [approved] ──borrower nhận đồ──> [borrowed]
     │                              │                                │
     └──owner reject──> [rejected]  └──borrower cancel──> [canceled] │
                                                                     │
                        [returned] <──borrower trả, owner xác nhận──┘
```

1. Borrower gửi **yêu cầu mượn** (kèm ngày mượn / ngày trả dự kiến).
2. Owner **duyệt** hoặc **từ chối**. Khi duyệt, đồ chơi chuyển sang `borrowed`, các request khác của đồ chơi đó tự động bị từ chối.
3. Borrower **trả đồ**, owner **xác nhận đã nhận** → request chuyển `returned`, đồ chơi trở lại `available`.
4. Borrower có thể **huỷ** request khi chưa được duyệt.

### 3.5. Lịch sử mượn / trả
- "Đồ tôi đã mượn": danh sách request mình gửi + trạng thái.
- "Đồ tôi cho mượn": danh sách request tới đồ chơi của mình.
- Lọc theo trạng thái.

### 3.6. Đánh giá / review
- Sau khi request ở trạng thái `returned`, borrower được đánh giá đồ chơi (1–5 sao + comment).
- Mỗi request chỉ đánh giá 1 lần.
- Trang chi tiết đồ chơi hiển thị điểm trung bình + danh sách review.

## 4. Data models (MongoDB / Mongoose)

### User
```js
{ name, email (unique), password (hashed), avatar?, createdAt }
```

### Toy
```js
{
  owner: ObjectId -> User,
  name, description,
  category,            // enum: educational | outdoor | boardgame | doll | vehicle | other
  ageRange,            // ví dụ: "3-5", "6-8"
  condition,           // enum: new | good | used
  images: [String],
  status,              // enum: available | borrowed | unavailable
  createdAt, updatedAt
}
```

### BorrowRequest
```js
{
  toy: ObjectId -> Toy,
  borrower: ObjectId -> User,
  owner: ObjectId -> User,     // denormalize để query nhanh
  status,   // enum: requested | approved | rejected | canceled | borrowed | returned
  borrowDate, returnDate,      // dự kiến
  actualReturnDate?,
  message?,                    // lời nhắn khi xin mượn
  createdAt, updatedAt
}
```

### Review
```js
{
  toy: ObjectId -> Toy,
  reviewer: ObjectId -> User,
  request: ObjectId -> BorrowRequest (unique),
  rating: 1-5,
  comment?,
  createdAt
}
```

## 5. API endpoints (REST)

### Auth — `/api/auth`
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/register` | Đăng ký |
| POST | `/login` | Đăng nhập, trả JWT |
| GET | `/me` | Thông tin user hiện tại 🔒 |
| PUT | `/me` | Cập nhật profile 🔒 |

### Toys — `/api/toys`
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | Danh sách + search/filter/pagination |
| GET | `/:id` | Chi tiết đồ chơi (kèm reviews) |
| POST | `/` | Tạo đồ chơi 🔒 |
| PUT | `/:id` | Sửa — chỉ owner 🔒 |
| DELETE | `/:id` | Xoá — chỉ owner, không đang mượn 🔒 |
| GET | `/mine` | Đồ chơi của tôi 🔒 |

### Borrow requests — `/api/requests`
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/` | Gửi yêu cầu mượn 🔒 |
| GET | `/borrowed` | Requests tôi gửi (lịch sử mượn) 🔒 |
| GET | `/lent` | Requests tới đồ của tôi (lịch sử cho mượn) 🔒 |
| PATCH | `/:id/approve` | Owner duyệt 🔒 |
| PATCH | `/:id/reject` | Owner từ chối 🔒 |
| PATCH | `/:id/cancel` | Borrower huỷ (khi chưa duyệt) 🔒 |
| PATCH | `/:id/return` | Borrower báo trả 🔒 |
| PATCH | `/:id/confirm-return` | Owner xác nhận nhận lại 🔒 |

### Reviews — `/api/reviews`
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/` | Tạo review (request phải `returned`) 🔒 |
| GET | `/toy/:toyId` | Reviews của một đồ chơi |

🔒 = cần JWT

## 6. Các trang React (client)

| Trang | Route | Mô tả |
|---|---|---|
| Home / Browse | `/` | Danh sách đồ chơi + search & filter |
| Toy detail | `/toys/:id` | Chi tiết + nút mượn + reviews |
| Login / Register | `/login`, `/register` | Xác thực |
| My toys | `/my-toys` | CRUD đồ chơi của tôi |
| Toy form | `/my-toys/new`, `/my-toys/:id/edit` | Tạo/sửa + upload ảnh |
| Borrowed | `/borrowed` | Đồ tôi mượn + thao tác cancel/return/review |
| Lent | `/lent` | Yêu cầu tới đồ của tôi + approve/reject/confirm |
| Profile | `/profile` | Xem/sửa profile |

## 7. Cấu trúc thư mục

```
toy-share-sdn302/
├── server/
│   ├── src/
│   │   ├── models/        # User, Toy, BorrowRequest, Review
│   │   ├── routes/        # auth, toys, requests, reviews
│   │   ├── controllers/
│   │   ├── middlewares/   # auth (JWT), upload (multer), errorHandler
│   │   └── app.js, server.js
│   ├── uploads/
│   └── .env               # MONGO_URI, JWT_SECRET, PORT
└── client/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── api/           # axios instance + API calls
    │   ├── context/       # AuthContext
    │   └── App.jsx, main.jsx
    └── vite.config.js
```

## 8. Lộ trình thực hiện

1. **Setup**: scaffold server + client, kết nối MongoDB.
2. **Auth**: register/login/JWT middleware + trang login/register.
3. **Toy CRUD**: models, API, upload ảnh + trang my-toys, toy form.
4. **Browse**: search/filter/pagination + trang home, toy detail.
5. **Borrow flow**: state machine request/approve/return + trang borrowed/lent.
6. **Review**: API + UI đánh giá, hiển thị rating.
7. **Hoàn thiện**: validate, error handling, seed data, README.
