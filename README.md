# Restaurant Food System

Hệ thống quản lý nhà hàng toàn diện với kiến trúc REST API, hỗ trợ 3 vai trò: **Admin**, **Waiter**, **Kitchen Chef**.

## 🏗️ Công nghệ sử dụng

| Công nghệ | Phiên bản |
|-----------|-----------|
| Java | 19 |
| Spring Boot | 4.0.6 |
| Spring Security + JWT | 0.11.5 (jjwt) |
| Spring Data JPA + Hibernate | |
| Spring WebSocket (STOMP) | |
| MySQL | 8.0 (Docker) |
| Cloudinary | Image upload |
| OpenAPI / Swagger UI | springdoc 3.0.3 |
| Lombok | 1.18.38 |

## 🔄 Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (FE)                             │
│              React / React Native / Mobile                  │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP + WebSocket (STOMP)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Spring Boot)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Security │  │Controller│  │ Service  │  │ Repository │  │
│  │   JWT    │──│  Layer   │──│  Layer   │──│    JPA     │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────┬─────┘  │
│                                                    │         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │         │
│  │WebSocket │  │ Cloudinary│  │  Email   │         │         │
│  │  STOMP   │  │   Upload  │  │  SMTP    │         │         │
│  └──────────┘  └──────────┘  └──────────┘         │         │
└────────────────────────────────────────────────────┼─────────┘
                                                     │
                          ┌──────────────────────────┼──────────┐
                          │          MySQL 8.0       │          │
                          │  ┌───────────────────────▼────┐     │
                          │  │       JPA Entities        │     │
                          │  │  (ddl-auto=update)         │     │
                          │  └───────────────────────────┘     │
                          │                                    │
                           └───────────────────────────────────┘
```

## 🧩 Danh sách Entity (Database Schema)

| Entity | Bảng | Mô tả |
|--------|------|-------|
| `User` | `user` | Người dùng (Admin, Waiter, Chef) |
| `Role` | `role` | Vai trò: ADMIN, STAFF, CHEF |
| `Permission` | `permission` | Quyền chi tiết (ORDER_VIEW, DISH_EDIT,...) |
| `Category` | `category` | Danh mục món ăn |
| `Dish` | `dish` | Món ăn |
| `DishVariantGroup` | `dish_variant_group` | Nhóm biến thể (Size, Ice,...) |
| `DishVariantOption` | `dish_variant_option` | Tùy chọn biến thể (Lớn, Nhỏ,...) |
| `DiningTable` | `dining_table` | Bàn ăn |
| `Order` | `orders` | Đơn hàng |
| `OrderItem` | `order_item` | Mục trong đơn hàng |
| `OrderItemVariant` | `order_item_variant` | Biến thể của mục |
| `OrderItemHistory` | `order_item_history` | Lịch sử trạng thái |
| `Payment` | `payment` | Thanh toán |
| `RefreshToken` | `refresh_token` | Token refresh |
| `PasswordResetToken` | `password_reset_tokens` | Token đặt lại mật khẩu |
| `AssociationRule` | `association_rule` | Luật kết hợp (recommend) |
| `AssociationRuleItem` | `association_rule_item` | Item trong luật |

## Sơ đồ ERD
<img width="1381" height="1664" alt="Hệ thống phục vụ món ăn" src="https://github.com/user-attachments/assets/15325882-1866-4daa-99dc-2dfe206afe7c" />


## 🔐 Phân quyền (Role-Based Access Control)

### 3 vai trò:

| Vai trò | Mô tả | Quyền |
|---------|-------|-------|
| **ADMIN** | Quản trị viên hệ thống | Tất cả 25 quyền |
| **STAFF** | Nhân viên phục vụ (Waiter) | ORDER_VIEW, ORDER_CREATE, ORDER_UPDATE, ORDER_CANCEL, TABLE_VIEW, DISH_VIEW, CATEGORY_VIEW |
| **CHEF** | Đầu bếp (Kitchen Chef) | ORDER_VIEW, ORDER_UPDATE, DISH_VIEW, DISH_EDIT, CATEGORY_VIEW |

### Danh sách Permission:

```
ORDER_VIEW,   ORDER_CREATE,   ORDER_UPDATE,   ORDER_DELETE,   ORDER_CANCEL,
DISH_VIEW,    DISH_CREATE,    DISH_EDIT,      DISH_DELETE,
CATEGORY_VIEW, CATEGORY_CREATE, CATEGORY_UPDATE, CATEGORY_DELETE,
TABLE_VIEW,   TABLE_CREATE,   TABLE_EDIT,     TABLE_DELETE,
REPORT_VIEW,  REPORT_EXPORT,
USER_VIEW,    USER_CREATE,    USER_EDIT,      USER_DELETE,
ROLE_VIEW,    ROLE_CREATE,    ROLE_EDIT,      ROLE_DELETE
```

## 🔑 Authentication & Security

- **Xác thực:** JWT (Access Token + Refresh Token)
- **Access Token:** 30 phút, gửi qua header `Authorization: Bearer <token>`
- **Refresh Token:** 7 ngày, lưu trong httpOnly Cookie (`refreshToken`), hash SHA-256 trong DB
- **Luồng:**
  1. `POST /api/v1/auth/login` → nhận access token + refresh token cookie
  2. Gửi kèm access token trong mọi request
  3. Khi hết hạn → `POST /api/v1/auth/refresh-token` (tự động qua cookie)
  4. `POST /api/v1/auth/logout` → xóa cookie + DB record
- **Password:** BCrypt, hỗ trợ forgot/reset password qua email
- **Tài khoản Admin mặc định:** `admin@gmail.com` / `admin12345`

## 🔄 Luồng xử lý Order

```
Staff                          Chef                       Staff
  │                             │                          │
  ├─ Tạo order ───────────────► │                          │
  ├─ Thêm món (NEW) ──────────► │                          │
  ├─ Place order (PENDING) ───► │                          │
  │                             ├─ Accept (ACCEPTED) ─────►│
  │                             ├─ Preparing ─────────────►│
  │                             ├─ Ready ─────────────────►│
  ├─ Serve (SERVED) ◄───────────┤                          │
  │                             │                          │
  └─ Thanh toán ───────────────────────────────────────────┘

Trạng thái OrderItem:
NEW → PENDING → ACCEPTED → PREPARING → READY → SERVED
                                            ↕
                                       CANCELLED (bất kỳ lúc nào)
```

## 📡 WebSocket (STOMP)

- **Endpoint:** `/ws` (SockJS fallback)
- **Prefix public:** `/topic/`
- **Prefix private:** `/queue/`
- **Topics:**
  - `/topic/dish-status` — Thay đổi trạng thái món
  - `/topic/dining-table-status` — Thay đổi trạng thái bàn
  - `/topic/place-order` — Đơn hàng mới (gửi đến chef)
  - `/topic/confirm-item/{orderId}` — Chef xác nhận món

## 📋 API Endpoints

### Auth (`/api/v1/auth`)
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| POST | `/login` | Public | Đăng nhập |
| POST | `/logout` | Public | Đăng xuất |
| POST | `/change-password` | Authenticated | Đổi mật khẩu |
| POST | `/forgot-password` | Public | Quên mật khẩu |
| POST | `/reset-password` | Public | Đặt lại mật khẩu |
| POST | `/refresh-token` | Public | Làm mới token |

### Categories (`/api/v1/categories`)
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/` | CATEGORY_VIEW | Danh sách danh mục |
| POST | `/` | ADMIN | Tạo danh mục |
| PUT | `/{categoryId}` | ADMIN | Cập nhật |
| DELETE | `/{categoryId}` | ADMIN | Xóa mềm |

### Dishes (`/api/v1/dishes`)
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/` | Public | Danh sách món (phân trang, lọc theo category) |
| GET | `/{dishId}` | Public | Chi tiết món + biến thể |
| GET | `/recommend` | Public | Gợi ý món (market basket analysis) |
| POST | `/` | ADMIN | Tạo món + upload ảnh |
| PUT | `/{dishId}` | ADMIN | Cập nhật món |
| PUT | `/{dishId}/status` | DISH_EDIT | Bật/tắt món |
| DELETE | `/{dishId}` | ADMIN | Xóa mềm |

### Dining Tables (`/api/v1/dining-tables`)
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/` | Public | Danh sách bàn (phân trang, tìm kiếm) |
| GET | `/{diningTableId}` | Public | Chi tiết bàn |
| POST | `/` | ADMIN | Tạo bàn |
| PUT | `/{diningTableId}` | ADMIN | Cập nhật |
| PATCH | `/{diningTableId}/position` | Public | Đổi vị trí |
| PATCH | `/{diningTableId}/disable` | Public | Đổi trạng thái (trống/có khách) |
| DELETE | `/{diningTableId}` | ADMIN | Xóa mềm |

### Orders (`/api/v1/orders`)
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| POST | `/` | Public | Tạo đơn hàng mới |
| GET | `/check` | Public | Kiểm tra đơn đang mở cho bàn |
| GET | `/{orderId}` | Public | Chi tiết đơn (giỏ hàng) |
| PUT | `/{orderId}/place` | Public | Đặt món (chuyển NEW → PENDING) |
| GET | `/{orderId}/total-items` | Public | Đếm số lượng món |
| GET | `/chef` | Public | Đơn chưa thanh toán (cho bếp) |
| GET | `/staff` | Public | Đơn đã thanh toán của nhân viên |
| GET | `/admin` | ADMIN | Tất cả đơn (lọc, phân trang) |

### Order Items (`/api/v1/order-items`)
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| POST | `/` | ORDER_UPDATE | Thêm món vào đơn |
| DELETE | `/{orderItemId}` | Public | Xóa món khỏi đơn |
| PUT | `/{orderItemId}/quantity` | Public | Sửa số lượng |
| PUT | `/{orderItemId}/notes` | Public | Sửa ghi chú |
| PUT | `/{orderItemId}/confirm` | Public | Cập nhật trạng thái |
| GET | `/{orderItemId}/history` | Public | Lịch sử trạng thái |

### Payments (`/api/v1/payments`)
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| POST | `/` | Public | Thanh toán đơn hàng |
| GET | `/{orderId}/detail` | Public | Chi tiết thanh toán |

### Users (`/api/v1/users`)
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/profile` | Authenticated | Thông tin cá nhân |
| PUT | `/{userId}` | Authenticated | Cập nhật profile |
| PUT | `/{userId}/admin` | USER_EDIT | Admin cập nhật user |
| GET | `/` | ADMIN | Danh sách user (phân trang) |
| POST | `/` | ADMIN | Tạo user mới |
| PUT | `/{userId}/active` | ADMIN | Khóa/mở tài khoản |

### Dashboard (`/api/v1/dashboards`)
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/today` | ADMIN | Thống kê hôm nay |
| GET | `/statistics/revenue` | ADMIN | Thống kê doanh thu |
| GET | `/top-dishes` | ADMIN | Món bán chạy |

### Roles (`/api/v1/roles`)
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/` | ADMIN | Danh sách role |

## 🚀 Hướng dẫn chạy

### Yêu cầu
- Java 19+
- Docker & Docker Compose
- Maven (hoặc dùng Maven Wrapper)

### Các bước

```bash
# 1. Clone repository
git clone <repo-url>
cd restaurant-food-system

# 2. Copy file .env (đã có sẵn, kiểm tra lại thông số)

# 3. Khởi động MySQL
docker compose up -d

# 4. Build & run
./mvnw clean spring-boot:run

# Hoặc build jar
./mvnw clean package -DskipTests
java -jar target/restaurant-food-system-0.0.1-SNAPSHOT.jar
```

### Docker Compose
```yaml
# MySQL 8.0
services:
  mysql:
    image: mysql:8.0
    ports:
      - "3307:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
```

### Biến môi trường (.env)

| Biến | Mô tả |
|------|-------|
| `JWT_SECRET` | Khóa bí mật JWT (tối thiểu 32 bytes) |
| `DB_URL` | JDBC URL |
| `DB_USER_NAME` | DB user |
| `DB_PASSWORD` | DB password |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `API_KEY` | Cloudinary API key |
| `API_SECRET` | Cloudinary API secret |
| `FE_URL` | URL frontend (CORS) |
| `MAIL_USERNAME` | Gmail SMTP username |
| `MAIL_PASSWORD` | Gmail SMTP app password |

## 🧪 Swagger UI

Sau khi chạy, truy cập:
```
http://localhost:8080/swagger-ui.html
```

## 📂 Cấu trúc thư mục

```
src/main/java/com/example/restaurant_food_system/
├── config/           # Cloudinary, OpenAPI, WebSocket
├── controller/       # REST controllers
├── dto/
│   ├── request/      # Request DTOs
│   └── response/     # Response DTOs
├── entity/           # JPA entities
├── exception/        # Exception + GlobalHandler
├── mapper/           # Entity ↔ DTO mappers
├── repository/       # Spring Data JPA repositories
├── security/         # JWT filter, Security config, UserDetails
├── service/          # Business logic
│   ├── auth/         # Authentication service
│   ├── category/     # Category service
│   ├── dashboard/    # Dashboard/statistics service
│   ├── diningTable/  # Table management service
│   ├── dish/         # Dish management service
│   ├── order/        # Order management service
│   ├── orderItem/    # Order item service
│   ├── payment/      # Payment service
│   ├── refreshToken/ # Refresh token service
│   ├── role/         # Role service
│   └── user/         # User service
└── utils/            # JwtTokenUtil, constants, validators

src/main/resources/
├── application.properties

```
