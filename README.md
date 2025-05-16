# Trang Chia Sẻ Video với Xác thực Firebase

## Tổng quan

Đây là một ứng dụng web cho phép người dùng đăng nhập bằng tài khoản Google (sử dụng Firebase Authentication), tải lên và quản lý video của họ.

## Tính năng

- Đăng nhập bằng tài khoản Google
- Xem tất cả video được tải lên
- Lọc để chỉ xem video của bạn
- Tải lên video mới
- Xóa video của bạn

## Cài đặt

### 1. Cài đặt các gói phụ thuộc

```bash
npm install
```

### 2. Thiết lập Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo một dự án mới
3. Thêm ứng dụng web vào dự án của bạn
4. Bật tính năng xác thực và kích hoạt phương thức đăng nhập bằng Google
5. Sao chép thông tin cấu hình Firebase và cập nhật trong file `public/js/firebase-config.js`

```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Khởi động server

```bash
node video-site/server.js
```

Sau đó truy cập ứng dụng tại http://localhost:3000

## Cách sử dụng

1. Truy cập trang web và đăng nhập bằng tài khoản Google
2. Sau khi đăng nhập, bạn có thể:
   - Xem tất cả video đã được tải lên
   - Lọc để chỉ xem video của bạn
   - Tải lên video mới
   - Xóa video của bạn

## Cấu trúc dự án

- `public/`: Chứa các file frontend
  - `index.html`: Trang chính hiển thị danh sách video
  - `upload.html`: Trang tải lên video mới
  - `login.html`: Trang đăng nhập
  - `video.css`: File CSS cho toàn bộ ứng dụng
  - `js/`: Thư mục chứa các file JavaScript
    - `firebase-config.js`: Cấu hình và khởi tạo Firebase
    - `video-manager.js`: Quản lý hiển thị và tương tác với video
- `video-site/`: Chứa mã nguồn backend
  - `server.js`: Server Express xử lý API và phục vụ file tĩnh
- `uploads/`: Thư mục lưu trữ video được tải lên