# NMen — Cửa hàng thời trang nam

Website thương mại điện tử thời trang nam, xây dựng bằng **Next.js** (frontend) + **Express.js** (backend) + **MySQL** (database).

---

## 📋 Mục lục

1. [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
2. [Cài đặt](#-cài-đặt)
3. [Thiết lập biến môi trường](#-thiết-lập-biến-môi-trường)
4. [Thiết lập Database](#️-thiết-lập-database)
5. [Chạy dự án](#-chạy-dự-án)
6. [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
7. [Tài khoản mặc định](#-tài-khoản-mặc-định)

---

## 🖥 Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy bạn đã cài:

| Công cụ | Phiên bản tối thiểu | Link tải |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| MySQL | 8.0+ | https://www.mysql.com |
| Git | Bất kỳ | https://git-scm.com |

> **Kiểm tra nhanh:** Mở terminal và chạy `node -v`, `mysql --version` để xác nhận.

---

## 📥 Cài đặt

### Bước 1 — Clone dự án về máy

```bash
git clone <url-repo-của-bạn>
cd nmen
```

### Bước 2 — Cài thư viện

Chạy **2 lệnh** sau (cần kết nối internet):

```bash
# Cài thư viện frontend (Next.js)
npm install

# Cài thư viện backend (Express)
cd server && npm install && cd ..
```

---

## ⚙️ Thiết lập biến môi trường

Dự án cần 2 file cấu hình môi trường:

### 1. Backend (`server/.env`)

```bash
# Sao chép file mẫu
cp server/.env.example server/.env
```

Mở file `server/.env` và chỉnh sửa nếu cần:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # Điền mật khẩu MySQL của bạn (nếu có)
DB_NAME=nmen
JWT_SECRET=V6wqQGgiZJCd547R/opHouce74pc787+mxazT7abEw4=
JWT_EXPIRES_IN=7d
```

### 2. Frontend (`.env.local`)

Tạo file `.env.local` ở thư mục gốc:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
```

> Nếu bạn đổi port backend, hãy cập nhật giá trị `NEXT_PUBLIC_API_URL` cho khớp.

---

## 🗄️ Thiết lập Database

### Bước 1 — Đảm bảo MySQL đang chạy

- **Windows/macOS:** Mở MySQL Workbench hoặc MAMP/XAMPP
- **Linux:** `sudo service mysql start`

### Bước 2 — Import database

```bash
mysql -u root -p < nmen.sql
```

> Nhập mật khẩu MySQL khi được hỏi. Nếu `root` không có mật khẩu, dùng: `mysql -u root < nmen.sql`

Lệnh này sẽ tự động tạo database `nmen` với đầy đủ bảng và dữ liệu mẫu.

---

## 🚀 Chạy dự án

### Cách 1 — Chạy cả frontend + backend cùng lúc *(khuyên dùng)*

```bash
npm run dev:all
```

### Cách 2 — Chạy riêng từng phần *(để debug)*

```bash
# Terminal 1 — Backend API
npm run dev:server

# Terminal 2 — Frontend
npm run dev
```

### Truy cập

Sau khi chạy thành công, mở trình duyệt và vào:

| Trang | URL |
|---|---|
| 🛍️ Storefront | http://localhost:3000 |
| 🔧 Trang quản trị | http://localhost:3000/admin |
| 🔌 Backend API | http://localhost:5000 |

---

## 📁 Cấu trúc thư mục

```
nmen/
├── src/
│   ├── app/              # Các trang (Next.js App Router)
│   │   ├── admin/        # Trang quản trị
│   │   └── ...           # Trang khách hàng
│   ├── components/       # Component dùng chung (Header, Footer, ...)
│   └── lib/              # Tiện ích, helper functions
│
├── server/
│   └── src/
│       ├── app.js        # Entry point Express
│       ├── db.js         # Kết nối MySQL
│       ├── routes/       # Định nghĩa các route API
│       ├── controllers/  # Xử lý logic từng route
│       └── middlewares/  # Xác thực JWT, upload file, ...
│
├── public/               # Hình ảnh và tài nguyên tĩnh
├── nmen.sql              # Schema + dữ liệu mẫu MySQL
├── .env.local            # Biến môi trường frontend (tự tạo)
└── server/.env           # Biến môi trường backend (tự tạo)
```

---

## 👤 Tài khoản mặc định

Sau khi import database, có thể đăng nhập bằng tài khoản admin mặc định:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@nmen.vn` | `123456` |

> ⚠️ Hãy đổi mật khẩu admin sau khi đăng nhập lần đầu.

---

## ❓ Gặp lỗi?

| Lỗi thường gặp | Cách khắc phục |
|---|---|
| `Error: connect ECONNREFUSED` | MySQL chưa chạy, hãy khởi động MySQL |
| `Access denied for user 'root'` | Sai mật khẩu MySQL trong `server/.env` |
| `Cannot find module` | Chưa chạy `npm install` ở cả 2 thư mục |
| Port 3000 / 5000 đang bận | Đổi port hoặc tắt ứng dụng đang chiếm port |
