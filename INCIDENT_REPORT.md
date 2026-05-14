# INCIDENT REPORT — Hệ thống Điểm Danh

## INCIDENT #001 — CORS Error khi Frontend gọi Backend

| Trường | Chi tiết |
|--------|----------|
| **Thời gian** | Ngày deploy đầu tiên |
| **Mức độ** | High — Frontend không gọi được API |

### Hiện tượng
- Browser console báo lỗi: `Access to fetch at 'http://localhost:3001/api/students' from origin 'http://localhost' has been blocked by CORS policy`
- Trang web trắng, không load được dữ liệu

### Layer lỗi
- **L3 — Backend**: Cấu hình CORS sai hoặc thiếu

### Nguyên nhân
Biến môi trường `CORS_ORIGIN` trong `docker-compose.yml` được set là `http://localhost:5173` (môi trường dev), nhưng production frontend chạy trên port 80, origin thực tế là `http://localhost`.

### Cách fix
```yaml
# docker-compose.yml — sửa CORS_ORIGIN
environment:
  - CORS_ORIGIN=http://localhost   # ← sửa từ :5173
```
Sau đó `docker compose up -d --build` lại backend.

### Cách phòng tránh
- Luôn kiểm tra CORS_ORIGIN khớp với domain production thực tế
- Thêm vào checklist deploy: "kiểm tra CORS trước khi demo"
- Có thể dùng wildcard `*` cho development, strict origin cho production

---

## INCIDENT #002 — API 500: Database file không tồn tại

| Trường | Chi tiết |
|--------|----------|
| **Thời gian** | Sau khi deploy lên VPS mới |
| **Mức độ** | Critical — toàn bộ API trả 500 |

### Hiện tượng
- `GET /api/health` → `{"ok":true}` ✅ (không cần DB)
- `GET /api/students` → HTTP 500, log backend: `SQLITE_CANTOPEN: unable to open database file`
- Container log: `Error: SQLITE_CANTOPEN`

### Layer lỗi
- **L2 — Database / Storage**: Volume không được mount, thư mục `/app/data` không tồn tại

### Nguyên nhân
Khi chạy `docker compose up` lần đầu trên VPS mới, volume `db_data` chưa được tạo. File `db.js` cố gắng mở DB tại `/app/data/attendance.db` nhưng thư mục `/app/data` không tồn tại.

### Cách fix
Trong `db.js` đã có đoạn tạo thư mục:
```js
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
```
Lỗi xảy ra vì image cũ không có đoạn này. Giải pháp:
```bash
docker compose down
docker compose build --no-cache backend
docker compose up -d
```

### Cách phòng tránh
- Luôn dùng `fs.mkdirSync(dir, { recursive: true })` trước khi mở DB
- Thêm volume mount rõ ràng trong `docker-compose.yml`
- Trong `Dockerfile` có `RUN mkdir -p data`

---

## INCIDENT #003 — Frontend undefined khi API trả dữ liệu không đúng format

| Trường | Chi tiết |
|--------|----------|
| **Thời gian** | Trong quá trình phát triển |
| **Mức độ** | Medium — UI hiển thị lỗi, console có warning |

### Hiện tượng
- Trang Tổng quan load nhưng hiển thị "NaN" thay vì số liệu
- Console: `TypeError: Cannot read properties of undefined (reading 'present')`
- `GET /api/attendance/summary` trả về dữ liệu nhưng UI vẫn lỗi

### Layer lỗi
- **L4 — Frontend**: Component đọc sai field từ response API

### Nguyên nhân
API `GET /api/attendance/summary` trả về:
```json
{ "ok": true, "data": [...] }
```
Nhưng component Dashboard đang đọc trực tiếp `res` thay vì `res.data`, dẫn đến `summary` là `undefined`, rồi `.find()` và `.reduce()` fail.

```js
// ❌ Sai
const summary = await api.getSummary(); // trả về {ok, data}
setSummary(summary);                    // → summary = {ok, data}

// ✅ Đúng (trong api.js đã chuẩn hóa)
const res = await api.getSummary();
setSummary(res.data);
```

### Cách fix
Chuẩn hóa toàn bộ response trong `api.js` — hàm `request()` luôn trả về `data` object từ response, component chỉ cần gọi `.data`.

### Cách phòng tránh
- Viết test cho API utility
- Dùng TypeScript để catch lỗi type tại compile time
- Thêm default value: `setSummary(res.data || [])`

---

## CHECKLIST DEBUG THEO LAYER

```
L4 Frontend  → Mở DevTools > Console > Network tab
L3 Backend   → docker logs attendance_backend
L2 Database  → Kiểm tra volume, file .db tồn tại không
L1 Infra     → docker ps, docker compose ps, ping host
```
