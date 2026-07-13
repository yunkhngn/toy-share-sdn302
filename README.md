# Toy Sharing

MERN base: React (Vite) + Express + MongoDB. Xem chi tiết ở [BRIEF.md](BRIEF.md).

## Chạy bằng Podman

MongoDB chạy trực tiếp trên máy (không container hoá) — cần cài sẵn và bật `mongod` trên port 27017 (vd. `brew services start mongodb-community`).

```bash
podman-compose up --build
```

- Client: http://localhost:5173
- Server: http://localhost:5001/api/health
- MongoDB: localhost:27017 (chạy trên host, container gọi qua `host.containers.internal`)

Dừng:

```bash
podman-compose down
```

## Chạy local không dùng container

```bash
# server
cd server
cp .env.example .env   # sửa MONGO_URI nếu cần
npm install
npm run dev

# client (terminal khác)
cd client
npm install
npm run dev
```
