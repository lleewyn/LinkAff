# 🔗 LinkAff - Shopee Affiliate Link Generator

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?repository-url=https://github.com/lleewyn/LinkAff)
[![GitHub license](https://img.shields.io/github/license/lleewyn/LinkAff)](https://github.com/lleewyn/LinkAff/blob/main/LICENSE)

**LinkAff** là một công cụ web mạnh mẽ, tinh tế giúp tạo nhanh đường dẫn Affiliate Shopee từ các link sản phẩm thông thường. Dự án tích hợp cơ sở dữ liệu đám mây giúp bạn quản lý cấu hình tập trung cho toàn bộ người dùng.

---

## ✨ Tính năng nổi bật

- 🚀 **Chuyển đổi tức thì:** Chuyển đổi link Shopee sang link Affiliate chỉ với 1 cú click.
- 📋 **Hỗ trợ dán nhanh:** Nút "Paste" thông minh giúp lấy link từ clipboard.
- 📱 **Giao diện Responsive:** Hiển thị hoàn hảo trên mọi thiết bị.
- ⚙️ **Bảng quản trị (Admin Panel) Bảo mật:** 
  - Đăng nhập an toàn để thay đổi cấu hình.
  - Thay đổi **Affiliate ID**, **Link Facebook**.
  - Tùy chỉnh **Voucher & Banner** (Tiêu đề, mô tả, badge, stats).
- ✂️ **Cắt ảnh thông minh:** Tích hợp bộ công cụ cắt ảnh chuyên nghiệp cho Banner.
- ☁️ **Đồng bộ Đám mây (Supabase):** Tự động đồng bộ mọi thay đổi lên Cloud để tất cả người dùng đều thấy nội dung mới nhất.

---

## 🛠 Công nghệ sử dụng

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Backend/DB:** Supabase (Cloud Database).
- **Libraries:** Cropper.js (Cắt ảnh), FontAwesome 6, Google Fonts.

---

## 🚀 Hướng dẫn triển khai (Deployment)

### 1. Triển khai lên Vercel (Khuyên dùng)
- Đẩy code lên GitHub.
- Truy cập [Vercel.com](https://vercel.com) và Import repository này.
- Mọi thứ sẽ online ngay lập tức.

### 2. Cấu hình Supabase
- Tạo project trên [Supabase](https://supabase.com).
- Tạo bảng `app_config` (Xem mã SQL trong file đính kèm hoặc tài liệu hướng dẫn).
- Thay đổi `SUPABASE_URL` và `SUPABASE_KEY` trong `script.js`.

---

## 🔐 Hướng dẫn Admin

Để vào bảng quản trị:
1. Nhấn vào biểu tượng **Răng cưa (Gear)** ở góc dưới bên phải màn hình.
2. Đăng nhập với tài khoản:
   - **User:** `quynhbikhung`
   - **Pass:** `mkquynh123bijkhung`
3. Chỉnh sửa các thông số và nhấn **Lưu Cấu Hình**.

---

## 📝 License

Dự án này được phát hành dưới bản quyền MIT. Tự do sử dụng và phát triển thêm!

---
Developed by [lleewyn](https://github.com/lleewyn) 🚀
