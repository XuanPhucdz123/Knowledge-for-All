# Sách Gần Nhau

Nền tảng chia sẻ và trao đổi sách quanh bạn — website responsive, hiện đại, không dùng dữ liệu giả.

## Chạy local

```bash
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`.

## Cấu hình Supabase (tùy chọn)

1. Tạo project trên [Supabase](https://supabase.com)
2. Chạy script `supabase-schema.sql` trong SQL Editor
3. Copy `.env.example` thành `.env` và điền:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Nếu **không** cấu hình Supabase, app tự động dùng **local mode** (localStorage). Dữ liệu chỉ xuất hiện khi người dùng thật đăng ký và đăng sách — **không có dữ liệu mẫu**.

## Tính năng

- Đăng ký / đăng nhập với validation
- Landing page với animation (Framer Motion + GSAP ScrollTrigger)
- Carousel 3D sách thật (empty state khi chưa có sách)
- Đăng sách: chụp camera hoặc tải ảnh, nén WebP/JPEG
- Định vị: tính khoảng cách Haversine, radar trực quan
- Dashboard: tìm kiếm, lọc, sắp xếp theo khoảng cách
- Quản lý sách cá nhân: sửa trạng thái, xóa
- Hồ sơ: cập nhật tên, bật/tắt định vị
- Responsive: sidebar desktop, bottom nav mobile

## Tech stack

- React 18+ / TypeScript / Vite
- Tailwind CSS
- Framer Motion, GSAP + ScrollTrigger
- Lucide React, React Router DOM
- Supabase (optional) hoặc localStorage adapter

## Lưu ý quyền camera & định vị

- **localhost** thường cho phép camera/định vị trên hầu hết trình duyệt
- **Production** cần **HTTPS** để `getUserMedia` và `geolocation` hoạt động ổn định

## Nhóm phát triển

- **Nguyễn Xuan Phúc** — Trưởng nhóm
- **Nguyễn Thanh Trạng** — Phó nhóm
- **Dư Ngọc Ái Vy** — Thành viên
- Giáo viên hướng dẫn: cô Phạm Nguyễn Cẩm Tú
