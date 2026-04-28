-- NMen Database Schema v3.0
-- Chạy: mysql -u root < nmen.sql

CREATE DATABASE IF NOT EXISTS `nmen` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nmen`;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users
CREATE TABLE `users` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `full_name`   VARCHAR(100) NOT NULL,
  `email`       VARCHAR(100) NOT NULL,
  `password`    VARCHAR(255) NOT NULL,
  `phone`       VARCHAR(20)  DEFAULT NULL,
  `role`        ENUM('admin','customer') NOT NULL DEFAULT 'customer',
  `tier`        ENUM('Hạng Đồng','Hạng Bạc','Hạng Vàng','Hạng Đen') NOT NULL DEFAULT 'Hạng Đồng',
  `points`      INT          NOT NULL DEFAULT 0,
  `avatar_url`  TEXT         DEFAULT NULL,
  `joined_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. User addresses
CREATE TABLE `user_addresses` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `user_id`    INT          NOT NULL,
  `label`      VARCHAR(50)  DEFAULT 'Nhà',
  `recipient`  VARCHAR(100) NOT NULL,
  `phone`      VARCHAR(20)  DEFAULT NULL,
  `address`    TEXT         NOT NULL,
  `province_id` INT DEFAULT NULL,
  `commune_id` INT DEFAULT NULL,
  `is_default` TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ua_user` (`user_id`),
  KEY `fk_ua_province_id` (`province_id`),
  KEY `fk_ua_commune_id` (`commune_id`),
  CONSTRAINT `fk_ua_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ua_province_id` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ua_commune_id` FOREIGN KEY (`commune_id`) REFERENCES `communes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Categories
CREATE TABLE `categories` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `parent_id`   INT          DEFAULT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `slug`        VARCHAR(100) NOT NULL,
  `position`    INT          NOT NULL DEFAULT 0,
  `status`      ENUM('active','hidden') NOT NULL DEFAULT 'active',
  `description` TEXT         DEFAULT NULL,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cat_slug` (`slug`),
  KEY `idx_cat_parent` (`parent_id`),
  CONSTRAINT `fk_cat_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Products
CREATE TABLE `products` (
  `id`           INT           NOT NULL AUTO_INCREMENT,
  `category_id`  INT           NOT NULL,
  `name`         VARCHAR(200)  NOT NULL,
  `slug`         VARCHAR(200)  NOT NULL,
  `sku`          VARCHAR(50)   DEFAULT NULL,
  `price`        DECIMAL(12,0) NOT NULL,
  `sale_price`   DECIMAL(12,0) DEFAULT NULL,
  `description`  TEXT          DEFAULT NULL,
  `is_published` TINYINT(1)    NOT NULL DEFAULT 1,
  `deleted_at`   TIMESTAMP     DEFAULT NULL,
  `created_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_slug` (`slug`),
  UNIQUE KEY `uq_product_sku` (`sku`),
  KEY `idx_product_cat` (`category_id`),
  CONSTRAINT `fk_product_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.5 Product images
CREATE TABLE `product_images` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `product_id`    INT          NOT NULL,
  `image_url`     TEXT         NOT NULL,
  `is_primary`    TINYINT(1)   NOT NULL DEFAULT 0,
  `display_order` INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_pi_product` (`product_id`),
  CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Product variants
CREATE TABLE `product_variants` (
  `id`         INT         NOT NULL AUTO_INCREMENT,
  `product_id` INT         NOT NULL,
  `sku`        VARCHAR(50) DEFAULT NULL,
  `color_name` VARCHAR(50) NOT NULL,
  `color_hex`  VARCHAR(20) NOT NULL,
  `size`       VARCHAR(20) NOT NULL,
  `stock`      INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_variant` (`product_id`,`color_hex`,`size`),
  UNIQUE KEY `uq_variant_sku` (`sku`),
  KEY `idx_variant_product` (`product_id`),
  CONSTRAINT `fk_variant_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Wishlists
CREATE TABLE `wishlists` (
  `id`         INT       NOT NULL AUTO_INCREMENT,
  `user_id`    INT       NOT NULL,
  `product_id` INT       NOT NULL,
  `added_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist` (`user_id`,`product_id`),
  CONSTRAINT `fk_wl_user`    FOREIGN KEY (`user_id`)    REFERENCES `users`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wl_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Promo codes
CREATE TABLE `promo_codes` (
  `id`             INT           NOT NULL AUTO_INCREMENT,
  `code`           VARCHAR(50)   NOT NULL,
  `discount_type`  ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_order`      DECIMAL(12,0) NOT NULL DEFAULT 0,
  `max_uses`       INT           DEFAULT NULL,
  `used_count`     INT           NOT NULL DEFAULT 0,
  `expires_at`     TIMESTAMP     DEFAULT NULL,
  `is_active`      TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_promo_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Orders
CREATE TABLE `orders` (
  `id`                   INT           NOT NULL AUTO_INCREMENT,
  `order_number`         VARCHAR(20)   NOT NULL,              -- VD: NM-49201

  -- Người đặt (user đăng ký hoặc khách vãng lai)
  `user_id`              INT           DEFAULT NULL,
  `customer_name`        VARCHAR(100)  NOT NULL,
  `email`                VARCHAR(100)  NOT NULL,
  `phone`                VARCHAR(20)   NOT NULL,

  -- Địa chỉ giao hàng (snapshot tại thời điểm đặt)
  `shipping_address`     TEXT          NOT NULL,              -- Số nhà, tên đường
  `shipping_commune`     VARCHAR(100)  DEFAULT NULL,          -- Phường/Xã
  `shipping_province`    VARCHAR(100)  NOT NULL,              -- Tỉnh/TP
  `shipping_province_id` INT           DEFAULT NULL,          -- FK references provinces(id)
  `shipping_commune_id`  INT           DEFAULT NULL,          -- FK references communes(id)

  -- Thanh toán
  `payment_method`       ENUM('COD','Sepay') NOT NULL DEFAULT 'COD',
  `payment_status`       ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `payment_ref`          VARCHAR(100)  DEFAULT NULL,          -- Mã giao dịch từ cổng TT

  -- Khuyến mãi
  `promo_code`           VARCHAR(50)   DEFAULT NULL,
  `discount_amount`      DECIMAL(12,0) NOT NULL DEFAULT 0,

  -- Tiền
  `subtotal`             DECIMAL(12,0) NOT NULL,              -- Tổng SP trước giảm
  `shipping_fee`         DECIMAL(12,0) NOT NULL DEFAULT 0,    -- Phí vận chuyển (A: luôn 0)
  `total_amount`         DECIMAL(12,0) NOT NULL,              -- = subtotal - discount + shipping_fee

  -- Ghi chú của khách
  `note`                 TEXT          DEFAULT NULL,

  -- Trạng thái
  `status`               ENUM(
                           'pending',      -- Chờ xác nhận
                           'confirmed',    -- Đã xác nhận
                           'processing',   -- Đang xử lý / đóng gói
                           'shipping',     -- Đang giao hàng
                           'delivered',    -- Đã giao thành công
                           'cancelled',    -- Đã hủy
                           'returned'      -- Trả hàng / hoàn tiền
                         ) NOT NULL DEFAULT 'pending',
  `cancelled_reason`     TEXT          DEFAULT NULL,          -- Lý do hủy

  -- Điểm thưởng
  `points_earned`        INT           NOT NULL DEFAULT 0,
  `points_used`          INT           NOT NULL DEFAULT 0,    -- Điểm dùng để giảm giá

  `created_at`           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_number`  (`order_number`),
  KEY `idx_order_user`          (`user_id`),
  KEY `idx_order_status`        (`status`),
  KEY `idx_order_created`       (`created_at`),
  KEY `fk_order_province_id`    (`shipping_province_id`),
  KEY `fk_order_commune_id`     (`shipping_commune_id`),
  CONSTRAINT `fk_order_user`     FOREIGN KEY (`user_id`)              REFERENCES `users`     (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_province` FOREIGN KEY (`shipping_province_id`) REFERENCES `provinces` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_commune`  FOREIGN KEY (`shipping_commune_id`)  REFERENCES `communes`  (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Order items
CREATE TABLE `order_items` (
  `id`             INT           NOT NULL AUTO_INCREMENT,
  `order_id`       INT           NOT NULL,

  -- Snapshot sản phẩm tại thời điểm đặt
  `product_id`     INT           DEFAULT NULL,               -- NULL nếu SP bị xóa
  `variant_id`     INT           DEFAULT NULL,               -- FK tới product_variants
  `product_name`   VARCHAR(200)  NOT NULL,
  `color_name`     VARCHAR(50)   DEFAULT NULL,
  `color_hex`      VARCHAR(20)   DEFAULT NULL,
  `size`           VARCHAR(20)   DEFAULT NULL,
  `image_url`      VARCHAR(500)  DEFAULT NULL,               -- Snapshot URL ảnh khi đặt

  -- Giá
  `original_price` DECIMAL(12,0) NOT NULL,                  -- Giá gốc (products.price)
  `unit_price`     DECIMAL(12,0) NOT NULL,                  -- Giá thực tế (sau sale)
  `quantity`       INT           NOT NULL,
  `line_total`     DECIMAL(12,0) GENERATED ALWAYS AS (`unit_price` * `quantity`) STORED,

  PRIMARY KEY (`id`),
  KEY `idx_oi_order`   (`order_id`),
  KEY `idx_oi_product` (`product_id`),
  KEY `idx_oi_variant` (`variant_id`),
  CONSTRAINT `fk_oi_order`   FOREIGN KEY (`order_id`)   REFERENCES `orders`           (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `products`         (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_oi_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Loyalty transactions
CREATE TABLE `loyalty_transactions` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `user_id`    INT          NOT NULL,
  `order_id`   INT          DEFAULT NULL,
  `type`       ENUM('earn','redeem','adjust') NOT NULL,
  `points`     INT          NOT NULL,
  `note`       VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_lt_user`  FOREIGN KEY (`user_id`)  REFERENCES `users`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lt_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. News
CREATE TABLE `news` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `author` VARCHAR(100) DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `short_description` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_news_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Pages
CREATE TABLE `pages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `content` TEXT DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_page_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Settings
CREATE TABLE `settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT DEFAULT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Provinces
CREATE TABLE `provinces` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `level` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_province_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Communes
CREATE TABLE `communes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `level` VARCHAR(50) DEFAULT NULL,
  `province_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_commune_code` (`code`),
  KEY `fk_commune_province_id` (`province_id`),
  CONSTRAINT `fk_commune_province_id` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO `categories` (`name`, `slug`, `description`) VALUES
('Áo khoác', 'ao-khoac', 'Áo khoác nam các loại'),
('Áo sơ mi', 'ao-so-mi', 'Áo sơ mi nam form rộng và slim'),
('Áo len',   'ao-len',   'Áo len, áo sweater nam'),
('Quần',     'quan',     'Quần khaki, chino, jeans'),
('Giày',     'giay',     'Giày da, sneaker, loafer'),
('Phụ kiện', 'phu-kien', 'Thắt lưng, ví, kính mắt');

-- password là "123456" (bcrypt hash — thay bằng hash thật khi deploy)
INSERT INTO `users` (`full_name`, `email`, `password`, `phone`, `role`, `tier`, `points`) VALUES
('Nguyễn Văn A', 'nguyenvana@example.com', '$2a$10$0fnRdMwzt2H7o.oR.FsOCe5Cy0j/031BDnKsjEsdVeadZ5VUD/oRa', '+84987654321', 'customer', 'Hạng Đen',  1250),
('Trần Minh B',  'tranminhb@example.com',  '$2a$10$0fnRdMwzt2H7o.oR.FsOCe5Cy0j/031BDnKsjEsdVeadZ5VUD/oRa', '+84912345678', 'customer', 'Hạng Bạc',  450),
('Lê Hoàng C',   'lehoangg@example.com',   '$2a$10$0fnRdMwzt2H7o.oR.FsOCe5Cy0j/031BDnKsjEsdVeadZ5VUD/oRa', '+84976543210', 'customer', 'Hạng Vàng', 890),
('Phạm Đức D',   'phamduc@example.com',    '$2a$10$0fnRdMwzt2H7o.oR.FsOCe5Cy0j/031BDnKsjEsdVeadZ5VUD/oRa', '+84901234567', 'customer', 'Hạng Đồng', 50),
('Hoàng Quân E', 'hoangquan@example.com',  '$2a$10$0fnRdMwzt2H7o.oR.FsOCe5Cy0j/031BDnKsjEsdVeadZ5VUD/oRa', '+84965432109', 'customer', 'Hạng Bạc',  670),
('NMen Admin',   'admin@nmen.vn',           '$2a$10$0fnRdMwzt2H7o.oR.FsOCe5Cy0j/031BDnKsjEsdVeadZ5VUD/oRa', NULL,           'admin',    'Hạng Đen',  0);

INSERT INTO `user_addresses` (`user_id`, `label`, `recipient`, `phone`, `address`, `province_id`, `commune_id`, `is_default`) VALUES
(1, 'Nhà',     'Nguyễn Văn A', '+84987654321', 'Khu vực Sảnh A, Tòa ICT, Quận Cầu Giấy', 1, 5, 1),
(2, 'Nhà',     'Trần Minh B',  '+84912345678', '123 Nguyễn Trãi, Quận 1',                 2, 10, 1),
(2, 'Công ty', 'Trần Minh B',  '+84912345678', '456 Đinh Tiên Hoàng, Quận Bình Thạnh',    2, 13, 0);

-- category_id: 1=Áo khoác, 2=Áo sơ mi, 3=Áo len, 4=Quần, 5=Giày
INSERT INTO `products` (`category_id`, `name`, `slug`, `sku`, `price`, `sale_price`, `description`) VALUES
(1, 'Áo Blazer Linen Phom Rộng',  'ao-blazer-linen-phom-rong',  'BLZ-LIN-01', 4500000, NULL, 'Blazer linen cao cấp, form rộng thoáng mát.'),
(2, 'Áo Sơ mi Form Rộng',         'ao-so-mi-form-rong',         'SM-RONG-01', 1850000, 1500000, 'Sơ mi form rộng unisex, chất liệu poplin mềm.'),
(4, 'Quần Khaki Chino',            'quan-khaki-chino',           'QK-CHINO-01', 2200000, NULL, 'Quần khaki chino 5 túi, cotton pha elastane.'),
(5, 'Giày da Loafer',              'giay-da-loafer',             'GD-LOAFER-01', 3900000, 3500000, 'Loafer da bò thật, đế cao su, thích hợp công sở.'),
(3, 'Áo len Cổ tròn Anthracite',  'ao-len-co-tron-anthracite',  'AL-ANTH-01', 2800000, NULL, 'Áo len cổ tròn dệt dày, giữ ấm mùa đông.'),
(1, 'Áo khoác dạ dáng dài',       'ao-khoac-da-dang-dai',       'AKD-DAI-01', 12500000, 11000000, 'Áo khoác dạ cao cấp, form cổ điển.');

-- product_id: 1=Blazer, 2=Sơ mi, 3=Khaki, 4=Loafer, 5=Len, 6=Khoác dạ
INSERT INTO `product_variants` (`product_id`, `color_name`, `color_hex`, `size`, `stock`) VALUES
(1,'Xám Đen','#2f2f2f','S',3),(1,'Xám Đen','#2f2f2f','M',5),(1,'Xám Đen','#2f2f2f','L',4),(1,'Xám Đen','#2f2f2f','XL',2),
(1,'Kem Cát','#c8b89a','S',2),(1,'Kem Cát','#c8b89a','M',4),(1,'Kem Cát','#c8b89a','L',3),(1,'Kem Cát','#c8b89a','XL',1),
(2,'Đen Nhám','#1a1c1c','S',5),(2,'Đen Nhám','#1a1c1c','M',8),(2,'Đen Nhám','#1a1c1c','L',6),(2,'Đen Nhám','#1a1c1c','XL',4),
(2,'Trắng Kem','#f5f0e8','S',3),(2,'Trắng Kem','#f5f0e8','M',5),(2,'Trắng Kem','#f5f0e8','L',4),
(2,'Nâu Đất','#4a3728','S',2),(2,'Nâu Đất','#4a3728','M',3),
(3,'Be Đất','#c8b89a','28',4),(3,'Be Đất','#c8b89a','30',6),(3,'Be Đất','#c8b89a','32',5),(3,'Be Đất','#c8b89a','34',3),
(3,'Xám Than','#3d3d3d','28',2),(3,'Xám Than','#3d3d3d','30',4),(3,'Xám Than','#3d3d3d','32',3),
(4,'Đen','#1a1c1c','39',2),(4,'Đen','#1a1c1c','40',3),(4,'Đen','#1a1c1c','41',2),(4,'Đen','#1a1c1c','42',1),
(4,'Nâu','#4a3728','39',1),(4,'Nâu','#4a3728','40',2),(4,'Nâu','#4a3728','41',2),(4,'Nâu','#4a3728','42',1),
(5,'Anthracite','#3d3d3d','S',4),(5,'Anthracite','#3d3d3d','M',5),(5,'Anthracite','#3d3d3d','L',3),
(5,'Đen','#1a1c1c','S',3),(5,'Đen','#1a1c1c','M',4),(5,'Đen','#1a1c1c','L',2),
(5,'Nâu Mocha','#8b6f5e','S',2),(5,'Nâu Mocha','#8b6f5e','M',3),
(6,'Đen','#1a1c1c','M',2),(6,'Đen','#1a1c1c','L',2),(6,'Đen','#1a1c1c','XL',1),
(6,'Xám Đen','#2f2f2f','M',1),(6,'Xám Đen','#2f2f2f','L',1),(6,'Xám Đen','#2f2f2f','XL',0);

INSERT INTO `promo_codes` (`code`, `discount_type`, `discount_value`, `min_order`, `max_uses`) VALUES
('WELCOME10', 'percent', 10.00, 500000,  NULL),
('NMEN200K',  'fixed',   200000, 2000000, 100),
('VIP20',     'percent', 20.00, 5000000, 50);

INSERT INTO `wishlists` (`user_id`, `product_id`) VALUES (1,3),(1,4),(2,1),(3,6);

-- user_id: 1=Nguyễn Văn A, 2=Trần Minh B, 3=Lê Hoàng C, 4=Phạm Đức D, 5=Hoàng Quân E
INSERT INTO `orders` (`order_number`,`user_id`,`customer_name`,`email`,`phone`,`shipping_address`,`shipping_province`,`shipping_province_id`,`payment_method`,`payment_status`,`status`,`subtotal`,`total_amount`,`points_earned`) VALUES
('NM-49201',1,'Nguyễn Văn A','nguyenvana@example.com','+84987654321','Khu vực Sảnh A, Tòa ICT, Quận Cầu Giấy','Thành phố Hà Nội',1,'COD','pending','pending',12400000,12400000,124),
('NM-48592',2,'Trần Minh B','tranminhb@example.com','+84912345678','123 Nguyễn Trãi, Quận 1','Thành phố Hồ Chí Minh',2,'Sepay','paid','delivered',4500000,4500000,45),
('NM-47110',3,'Lê Hoàng C','lehoangg@example.com','+84976543210','456 Lê Lợi, Hoàn Kiếm','Thành phố Hà Nội',1,'COD','paid','delivered',28900000,28900000,289),
('NM-46029',4,'Phạm Đức D','phamduc@example.com','+84901234567','789 Đinh Tiên Hoàng','Thành phố Hồ Chí Minh',2,'COD','pending','cancelled',1250000,1250000,0),
('NM-45318',5,'Hoàng Quân E','hoangquan@example.com','+84965432109','321 Trần Hưng Đạo, Quận 5','Thành phố Hồ Chí Minh',2,'Sepay','paid','delivered',6700000,6500000,65);

-- order_id: 1=NM-49201, 2=NM-48592, ... | product_id theo số
INSERT INTO `order_items` (`order_id`,`product_id`,`product_name`,`color_name`,`color_hex`,`size`,`quantity`,`original_price`,`unit_price`) VALUES
(1,6,'Áo khoác dạ dáng dài','Đen','#1a1c1c','M',1,12500000,12400000),
(2,1,'Áo Blazer Linen Phom Rộng','Xám Đen','#2f2f2f','L',1,4500000,4500000),
(3,6,'Áo khoác dạ dáng dài','Đen','#1a1c1c','XL',1,12500000,12500000),
(3,3,'Quần Khaki Chino','Xám Than','#3d3d3d','32',1,2200000,2200000),
(3,4,'Giày da Loafer','Đen','#1a1c1c','42',1,3900000,3900000),
(4,2,'Áo Sơ mi Form Rộng','Đen Nhám','#1a1c1c','S',1,1850000,1250000),
(5,5,'Áo len Cổ tròn Anthracite','Anthracite','#3d3d3d','M',1,2800000,2800000),
(5,3,'Quần Khaki Chino','Be Đất','#c8b89a','30',1,2200000,2200000),
(5,2,'Áo Sơ mi Form Rộng','Trắng Kem','#f5f0e8','M',1,1850000,1700000);

INSERT INTO `loyalty_transactions` (`user_id`,`order_id`,`type`,`points`,`note`) VALUES
(1,1,'earn',124,'Tích điểm đơn NM-49201'),
(2,2,'earn',45,'Tích điểm đơn NM-48592'),
(3,3,'earn',289,'Tích điểm đơn NM-47110'),
(5,5,'earn',65,'Tích điểm đơn NM-45318'),
(1,NULL,'adjust',1000,'Điểm khởi đầu thành viên');

-- ============================================================
-- SEED DATA PROVINCES & COMMUNES
-- ============================================================
INSERT INTO `provinces` (`id`, `code`, `name`, `level`) VALUES
(1, 1, 'Thành phố Hà Nội', 'Thành phố Trung ương'),
(2, 2, 'Thành phố Hồ Chí Minh', 'Thành phố Trung ương'),
(3, 3, 'Thành phố Đà Nẵng', 'Thành phố Trung ương'),
(4, 4, 'Thành phố Hải Phòng', 'Thành phố Trung ương'),
(5, 5, 'Thành phố Cần Thơ', 'Thành phố Trung ương');

INSERT INTO `communes` (`code`, `name`, `level`, `province_id`) VALUES
('001', 'Quận Ba Đình', 'Quận', 1), ('002', 'Quận Hoàn Kiếm', 'Quận', 1), ('003', 'Quận Tây Hồ', 'Quận', 1),
('004', 'Quận Long Biên', 'Quận', 1), ('005', 'Quận Cầu Giấy', 'Quận', 1), ('006', 'Quận Đống Đa', 'Quận', 1),
('007', 'Quận Hai Bà Trưng', 'Quận', 1), ('008', 'Quận Hoàng Mai', 'Quận', 1), ('009', 'Quận Thanh Xuân', 'Quận', 1),
('760', 'Quận 1', 'Quận', 2), ('761', 'Quận 12', 'Quận', 2), ('764', 'Quận Gò Vấp', 'Quận', 2),
('765', 'Quận Bình Thạnh', 'Quận', 2), ('766', 'Quận Tân Bình', 'Quận', 2), ('767', 'Quận Tân Phú', 'Quận', 2),
('768', 'Quận Phú Nhuận', 'Quận', 2), ('769', 'Thành phố Thủ Đức', 'Thành phố', 2), ('770', 'Quận 3', 'Quận', 2),
('771', 'Quận 10', 'Quận', 2), ('772', 'Quận 11', 'Quận', 2), ('773', 'Quận 4', 'Quận', 2),
('774', 'Quận 5', 'Quận', 2), ('775', 'Quận 6', 'Quận', 2), ('776', 'Quận 8', 'Quận', 2),
('777', 'Quận Bình Tân', 'Quận', 2), ('778', 'Quận 7', 'Quận', 2),
('490', 'Quận Liên Chiểu', 'Quận', 3), ('491', 'Quận Thanh Khê', 'Quận', 3), ('492', 'Quận Hải Châu', 'Quận', 3),
('493', 'Quận Sơn Trà', 'Quận', 3), ('494', 'Quận Ngũ Hành Sơn', 'Quận', 3), ('495', 'Quận Cẩm Lệ', 'Quận', 3),
('303', 'Quận Hồng Bàng', 'Quận', 4), ('304', 'Quận Ngô Quyền', 'Quận', 4), ('305', 'Quận Lê Chân', 'Quận', 4),
('916', 'Quận Ninh Kiều', 'Quận', 5), ('917', 'Quận Ô Môn', 'Quận', 5), ('918', 'Quận Bình Thuỷ', 'Quận', 5),
('919', 'Quận Cái Răng', 'Quận', 5);

-- ============================================================
-- SEED DATA PAGES
-- ============================================================
INSERT INTO `pages` (`title`, `slug`, `content`, `is_published`) VALUES
('Về chúng tôi', 've-chung-toi', '<p>NMen là thương hiệu thời trang nam cao cấp, mang đến phong cách lịch lãm và hiện đại cho phái mạnh.</p>', 1),
('Chính sách bảo mật', 'chinh-sach-bao-mat', '<p>Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân của khách hàng theo quy định của pháp luật.</p>', 1),
('Điều khoản dịch vụ', 'dieu-khoan-dich-vu', '<p>Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ và mua sắm tại NMen.</p>', 1),
('Chính sách đổi trả', 'chinh-sach-doi-tra', '<p>Hỗ trợ đổi trả miễn phí trong vòng 7 ngày đối với các sản phẩm còn nguyên tem mác và hóa đơn.</p>', 1);

-- ============================================================
-- SEED DATA NEWS
-- ============================================================
INSERT INTO `news` (`title`, `slug`, `author`, `image`, `status`, `short_description`, `description`) VALUES
('Xu hướng thời trang nam mùa Thu Đông 2026', 'xu-huong-thoi-trang-nam-mua-thu-dong-2026', 'NMen Fashion', NULL, 'published', 'Khám phá những xu hướng thời trang nam nổi bật nhất dành cho mùa Thu Đông năm nay.', '<p>Mùa thu đông 2026 mang đến sự quay trở lại của những thiết kế cổ điển kết hợp với chất liệu hiện đại. Từ áo khoác dạ dáng dài đến áo len cổ lọ, NMen tự hào giới thiệu bộ sưu tập giúp phái mạnh luôn giữ được sự ấm áp nhưng không kém phần phong cách.</p>'),
('Bí quyết chọn vest chuẩn phong cách doanh nhân', 'bi-quyet-chon-vest-chuan-phong-cach-doanh-nhan', 'NMen Style', NULL, 'published', 'Cách chọn một bộ vest vừa vặn, sang trọng giúp bạn tự tin trong các cuộc họp quan trọng.', '<p>Một bộ vest hoàn hảo không chỉ nằm ở giá tiền mà ở sự vừa vặn với cơ thể. Chú ý đến độ rộng của vai, chiều dài của tay áo và phom dáng của quần. Hãy cùng NMen tìm hiểu 5 tiêu chí không thể bỏ qua khi chọn mua vest.</p>'),
('Bộ sưu tập Denim: Phá vỡ mọi giới hạn', 'bo-suu-tap-denim-pha-vo-moi-gioi-han', 'NMen Fashion', NULL, 'draft', 'Denim luôn là item không thể thiếu trong tủ đồ của bất kỳ chàng trai nào.', '<p>Sự ra mắt của bộ sưu tập Denim 2026 sẽ mang đến cái nhìn hoàn toàn mới về phong cách đường phố bụi bặm nhưng đầy tinh tế. Hãy đón chờ!</p>');

