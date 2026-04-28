/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.2.6-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: nmen
-- ------------------------------------------------------
-- Server version	11.2.6-MariaDB-ubu2204

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `nmen`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `nmen` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `nmen`;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `position` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','hidden') NOT NULL DEFAULT 'active',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cat_slug` (`slug`),
  KEY `fk_cat_parent` (`parent_id`),
  CONSTRAINT `fk_cat_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
(1,7,'Áo khoác','ao-khoac',0,'active','Áo khoác nam các loại','2026-04-27 06:29:51'),
(2,7,'Áo sơ mi','ao-so-mi',0,'active','Áo sơ mi nam form rộng và slim','2026-04-27 06:29:51'),
(3,7,'Áo len','ao-len',0,'active','Áo len, áo sweater nam','2026-04-27 06:29:51'),
(4,NULL,'Quần','quan',0,'active','Quần khaki, chino, jeans','2026-04-27 06:29:51'),
(5,NULL,'Giày','giay',0,'active','Giày da, sneaker, loafer','2026-04-27 06:29:51'),
(6,NULL,'Phụ kiện','phu-kien',0,'active','Thắt lưng, ví, kính mắt','2026-04-27 06:29:51'),
(7,NULL,'Áo','ao',0,'active',NULL,'2026-04-28 09:36:47');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `communes`
--

DROP TABLE IF EXISTS `communes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `communes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `level` varchar(50) DEFAULT NULL,
  `province_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_commune_code` (`code`),
  KEY `fk_commune_province_id` (`province_id`),
  CONSTRAINT `fk_commune_province_id` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communes`
--

LOCK TABLES `communes` WRITE;
/*!40000 ALTER TABLE `communes` DISABLE KEYS */;
INSERT INTO `communes` VALUES
(1,'001','Quận Ba Đình','Quận',1),
(2,'002','Quận Hoàn Kiếm','Quận',1),
(3,'003','Quận Tây Hồ','Quận',1),
(4,'004','Quận Long Biên','Quận',1),
(5,'005','Quận Cầu Giấy','Quận',1),
(6,'006','Quận Đống Đa','Quận',1),
(7,'007','Quận Hai Bà Trưng','Quận',1),
(8,'008','Quận Hoàng Mai','Quận',1),
(9,'009','Quận Thanh Xuân','Quận',1),
(10,'303','Quận Hồng Bàng','Quận',2),
(11,'304','Quận Ngô Quyền','Quận',2),
(12,'305','Quận Lê Chân','Quận',2),
(13,'490','Quận Liên Chiểu','Quận',3),
(14,'491','Quận Thanh Khê','Quận',3),
(15,'492','Quận Hải Châu','Quận',3),
(16,'493','Quận Sơn Trà','Quận',3),
(17,'494','Quận Ngũ Hành Sơn','Quận',3),
(18,'495','Quận Cẩm Lệ','Quận',3),
(19,'760','Quận 1','Quận',4),
(20,'761','Quận 12','Quận',4),
(21,'764','Quận Gò Vấp','Quận',4),
(22,'765','Quận Bình Thạnh','Quận',4),
(23,'766','Quận Tân Bình','Quận',4),
(24,'767','Quận Tân Phú','Quận',4),
(25,'768','Quận Phú Nhuận','Quận',4),
(26,'769','Thành phố Thủ Đức','Thành phố',4),
(27,'770','Quận 3','Quận',4),
(28,'771','Quận 10','Quận',4),
(29,'772','Quận 11','Quận',4),
(30,'773','Quận 4','Quận',4),
(31,'774','Quận 5','Quận',4),
(32,'775','Quận 6','Quận',4),
(33,'776','Quận 8','Quận',4),
(34,'777','Quận Bình Tân','Quận',4),
(35,'778','Quận 7','Quận',4),
(36,'916','Quận Ninh Kiều','Quận',5),
(37,'917','Quận Ô Môn','Quận',5),
(38,'918','Quận Bình Thuỷ','Quận',5),
(39,'919','Quận Cái Răng','Quận',5);
/*!40000 ALTER TABLE `communes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_transactions`
--

DROP TABLE IF EXISTS `loyalty_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loyalty_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `type` enum('earn','redeem','adjust') NOT NULL,
  `points` int(11) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_lt_user` (`user_id`),
  KEY `fk_lt_order` (`order_id`),
  CONSTRAINT `fk_lt_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_transactions`
--

LOCK TABLES `loyalty_transactions` WRITE;
/*!40000 ALTER TABLE `loyalty_transactions` DISABLE KEYS */;
INSERT INTO `loyalty_transactions` VALUES
(1,1,1,'earn',124,'Tích điểm đơn NM-49201','2026-04-27 06:29:51'),
(2,2,2,'earn',45,'Tích điểm đơn NM-48592','2026-04-27 06:29:51'),
(3,3,3,'earn',289,'Tích điểm đơn NM-47110','2026-04-27 06:29:51'),
(4,5,5,'earn',65,'Tích điểm đơn NM-45318','2026-04-27 06:29:51'),
(5,1,NULL,'adjust',1000,'Điểm khởi đầu thành viên','2026-04-27 06:29:51'),
(6,1,7,'earn',400,'Tích điểm đơn NM-69154','2026-04-28 04:48:23'),
(7,1,11,'earn',400,'Tích điểm đơn NM-15382','2026-04-28 09:19:22');
/*!40000 ALTER TABLE `loyalty_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `author` varchar(100) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `short_description` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_news_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES
(1,'Xu hướng thời trang nam mùa Thu Đông 2026','xu-huong-thoi-trang-nam-mua-thu-dong-2026','NMen Fashion',NULL,'published','Khám phá những xu hướng thời trang nam nổi bật nhất dành cho mùa Thu Đông năm nay.','<p>Mùa thu đông 2026 mang đến sự quay trở lại của những thiết kế cổ điển kết hợp với chất liệu hiện đại. Từ áo khoác dạ dáng dài đến áo len cổ lọ, NMen tự hào giới thiệu bộ sưu tập giúp phái mạnh luôn giữ được sự ấm áp nhưng không kém phần phong cách.</p>','2026-04-27 07:10:02'),
(2,'Bí quyết chọn vest chuẩn phong cách doanh nhân','bi-quyet-chon-vest-chuan-phong-cach-doanh-nhan','NMen Style',NULL,'published','Cách chọn một bộ vest vừa vặn, sang trọng giúp bạn tự tin trong các cuộc họp quan trọng.','<p>Một bộ vest hoàn hảo không chỉ nằm ở giá tiền mà ở sự vừa vặn với cơ thể. Chú ý đến độ rộng của vai, chiều dài của tay áo và phom dáng của quần. Hãy cùng NMen tìm hiểu 5 tiêu chí không thể bỏ qua khi chọn mua vest.</p>','2026-04-27 07:10:02'),
(3,'Bộ sưu tập Denim: Phá vỡ mọi giới hạn','bo-suu-tap-denim-pha-vo-moi-gioi-han','NMen Fashion',NULL,'draft','Denim luôn là item không thể thiếu trong tủ đồ của bất kỳ chàng trai nào.','<p>Sự ra mắt của bộ sưu tập Denim 2026 sẽ mang đến cái nhìn hoàn toàn mới về phong cách đường phố bụi bặm nhưng đầy tinh tế. Hãy đón chờ!</p>','2026-04-27 07:10:02');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `color_name` varchar(50) DEFAULT NULL,
  `color_hex` varchar(20) DEFAULT NULL,
  `size` varchar(20) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `original_price` decimal(12,0) NOT NULL DEFAULT 0,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(12,0) NOT NULL,
  `line_total` decimal(12,0) GENERATED ALWAYS AS (`unit_price` * `quantity`) STORED,
  PRIMARY KEY (`id`),
  KEY `idx_oi_order` (`order_id`),
  KEY `idx_oi_product` (`product_id`),
  KEY `idx_oi_variant` (`variant_id`),
  CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_oi_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES
(1,1,6,NULL,'Áo khoác dạ dáng dài','Đen','#1a1c1c','M',NULL,12400000,1,12400000,12400000),
(2,2,1,NULL,'Áo Blazer Linen Phom Rộng','Xám Đen','#2f2f2f','L',NULL,4500000,1,4500000,4500000),
(3,3,6,NULL,'Áo khoác dạ dáng dài','Đen','#1a1c1c','XL',NULL,12500000,1,12500000,12500000),
(4,3,3,NULL,'Quần Khaki Chino','Xám Than','#3d3d3d','32',NULL,2200000,1,2200000,2200000),
(5,3,4,NULL,'Giày da Loafer','Đen','#1a1c1c','42',NULL,3900000,1,3900000,3900000),
(6,4,2,NULL,'Áo Sơ mi Form Rộng','Đen Nhám','#1a1c1c','S',NULL,1250000,1,1250000,1250000),
(7,5,5,NULL,'Áo len Cổ tròn Anthracite','Anthracite','#3d3d3d','M',NULL,2800000,1,2800000,2800000),
(8,5,3,NULL,'Quần Khaki Chino','Be Đất','#c8b89a','30',NULL,2200000,1,2200000,2200000),
(9,5,2,NULL,'Áo Sơ mi Form Rộng','Trắng Kem','#f5f0e8','M',NULL,1700000,1,1700000,1700000),
(10,6,4,25,'Giày da Loafer',NULL,'#1a1c1c','39',NULL,3900000,1,3500000,3500000),
(11,6,1,3,'Áo Blazer Linen Phom Rộng',NULL,'#2f2f2f','L','/uploads/products/1777271513807-uzbnschft8.png',4500000,1,4000000,4000000),
(12,7,1,6,'Áo Blazer Linen Phom Rộng','Kem Cát','#c8b89a','M','/uploads/products/1777271513807-uzbnschft8.png',4500000,1,4000000,4000000),
(13,8,2,11,'Áo Sơ mi Form Rộng','Đen Nhám','#1a1c1c','L',NULL,1850000,1,1500000,1500000),
(14,9,3,18,'Quần Khaki Chino','Be Đất','#c8b89a','28',NULL,2200000,1,2200000,2200000),
(15,10,3,18,'Quần Khaki Chino','Be Đất','#c8b89a','28',NULL,2200000,1,2200000,2200000),
(16,11,1,7,'Áo Blazer Linen Phom Rộng','Kem Cát','#c8b89a','L','/uploads/products/1777271513807-uzbnschft8.png',4500000,1,4000000,4000000);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_number` varchar(20) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `customer_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `shipping_address` text NOT NULL DEFAULT '',
  `shipping_commune` varchar(100) DEFAULT NULL,
  `shipping_province` varchar(100) NOT NULL DEFAULT '',
  `shipping_province_id` int(11) DEFAULT NULL,
  `shipping_commune_id` int(11) DEFAULT NULL,
  `payment_method` enum('COD','Sepay') NOT NULL DEFAULT 'COD',
  `payment_status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `payment_ref` varchar(100) DEFAULT NULL,
  `promo_code` varchar(50) DEFAULT NULL,
  `discount_amount` decimal(12,0) NOT NULL DEFAULT 0,
  `subtotal` decimal(12,0) NOT NULL,
  `shipping_fee` decimal(12,0) NOT NULL DEFAULT 0,
  `total_amount` decimal(12,0) NOT NULL,
  `note` text DEFAULT NULL,
  `cancelled_reason` text DEFAULT NULL,
  `status` enum('pending','confirmed','processing','shipping','delivered','cancelled','returned') NOT NULL DEFAULT 'pending',
  `points_earned` int(11) NOT NULL DEFAULT 0,
  `points_used` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_number` (`order_number`),
  KEY `idx_order_user` (`user_id`),
  KEY `idx_order_status` (`status`),
  KEY `idx_order_created` (`created_at`),
  KEY `fk_order_province_id` (`shipping_province_id`),
  KEY `fk_order_commune_id` (`shipping_commune_id`),
  CONSTRAINT `fk_order_commune` FOREIGN KEY (`shipping_commune_id`) REFERENCES `communes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_province` FOREIGN KEY (`shipping_province_id`) REFERENCES `provinces` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES
(1,'NM-49201',1,'Nguyễn Văn A','nguyenvana@example.com','+84987654321','Khu vực Sảnh A, Tòa ICT',NULL,'Hà Nội',NULL,NULL,'COD','pending',NULL,NULL,0,12400000,0,12400000,NULL,'test','cancelled',124,0,'2026-04-27 06:29:51','2026-04-28 09:31:16'),
(2,'NM-48592',2,'Trần Minh B','tranminhb@example.com','+84912345678','123 Nguyễn Trãi, Quận 1',NULL,'TP.HCM',NULL,NULL,'Sepay','paid',NULL,NULL,0,4500000,0,4500000,NULL,NULL,'delivered',45,0,'2026-04-27 06:29:51','2026-04-28 04:21:46'),
(3,'NM-47110',3,'Lê Hoàng C','lehoangg@example.com','+84976543210','456 Lê Lợi, Hoàn Kiếm',NULL,'Hà Nội',NULL,NULL,'COD','paid',NULL,NULL,0,28900000,0,28900000,NULL,NULL,'delivered',289,0,'2026-04-27 06:29:51','2026-04-28 04:21:46'),
(4,'NM-46029',4,'Phạm Đức D','phamduc@example.com','+84901234567','789 Đinh Tiên Hoàng',NULL,'TP.HCM',NULL,NULL,'COD','pending',NULL,NULL,0,1250000,0,1250000,NULL,NULL,'cancelled',0,0,'2026-04-27 06:29:51','2026-04-28 04:21:46'),
(5,'NM-45318',5,'Hoàng Quân E','hoangquan@example.com','+84965432109','321 Trần Hưng Đạo, Quận 5',NULL,'TP.HCM',NULL,NULL,'Sepay','paid',NULL,NULL,0,6700000,0,6500000,NULL,NULL,'delivered',65,0,'2026-04-27 06:29:51','2026-04-28 04:21:46'),
(6,'NM-38098',NULL,'NMen Admin','admin@nmen.vn','123456789','Hà Đông','Quận Cái Răng','Thành phố Cần Thơ',5,39,'COD','pending',NULL,NULL,0,7500000,0,7500000,NULL,NULL,'pending',750,0,'2026-04-28 04:24:04','2026-04-28 04:24:04'),
(7,'NM-69154',1,'Nguyễn Văn A','nguyenvana@example.com','+84987654321','Khu vực Sảnh A, Tòa ICT, Quận Cầu Giấy','Quận Hải Châu','Thành phố Đà Nẵng',3,15,'COD','pending',NULL,NULL,0,4000000,0,4000000,NULL,NULL,'delivered',400,0,'2026-04-28 04:48:23','2026-04-28 09:31:30'),
(8,'NM-99093',NULL,'Ngọc An Lê Quang','lequangngocan@gmail.com','123456789','Hà Đông','Quận Liên Chiểu','Thành phố Đà Nẵng',3,13,'COD','pending',NULL,NULL,0,1500000,0,1500000,'test',NULL,'pending',150,0,'2026-04-28 08:03:43','2026-04-28 08:03:43'),
(9,'NM-52815',NULL,'Ngọc An Lê Quang','lequangngocan@gmail.com','123456789','Hà Đông','Quận Hải Châu','Thành phố Đà Nẵng',3,15,'COD','pending',NULL,NULL,0,2200000,0,2200000,NULL,NULL,'shipping',220,0,'2026-04-28 08:20:00','2026-04-28 09:57:06'),
(10,'NM-15180',NULL,'Ngọc An Lê Quang','lequangngocan@gmail.com','123456789','Hà Đông','Quận Bình Thuỷ','Thành phố Cần Thơ',5,38,'COD','pending',NULL,NULL,0,2200000,0,2200000,NULL,'Khách hàng tự hủy','cancelled',220,0,'2026-04-28 09:05:09','2026-04-28 09:16:48'),
(11,'NM-15382',1,'Nguyễn Văn A','nguyenvana@example.com','+84987654321','Khu vực Sảnh A, Tòa ICT, Quận Cầu Giấy','Quận Hải Châu','Thành phố Đà Nẵng',3,15,'COD','pending',NULL,NULL,0,4000000,0,4000000,NULL,NULL,'pending',400,0,'2026-04-28 09:19:22','2026-04-28 09:19:22');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_page_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES
(1,'Về chúng tôi','ve-chung-toi','<p>NMen là thương hiệu thời trang nam cao cấp, mang đến phong cách lịch lãm và hiện đại cho phái mạnh.</p>',1,'2026-04-27 07:05:48','2026-04-27 07:05:48'),
(2,'Chính sách bảo mật','chinh-sach-bao-mat','<p>Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân của khách hàng theo quy định của pháp luật.</p>',1,'2026-04-27 07:05:48','2026-04-27 07:05:48'),
(3,'Điều khoản dịch vụ','dieu-khoan-dich-vu','<p>Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ và mua sắm tại NMen.</p>',1,'2026-04-27 07:05:48','2026-04-27 07:05:48'),
(4,'Chính sách đổi trả','chinh-sach-doi-tra','<p>Hỗ trợ đổi trả miễn phí trong vòng 7 ngày đối với các sản phẩm còn nguyên tem mác và hóa đơn.</p>',1,'2026-04-27 07:05:48','2026-04-27 07:05:48'),
(5,'Hỏi đáp (FAQs)','faq','<h3>1. Làm sao để đặt hàng?</h3><p>Bạn có thể chọn sản phẩm và thêm vào giỏ hàng, sau đó tiến hành thanh toán.</p><h3>2. Thời gian giao hàng là bao lâu?</h3><p>Thời gian giao hàng từ 2-5 ngày tùy khu vực.</p>',1,'2026-04-28 10:07:42','2026-04-28 10:07:42'),
(6,'Chính sách vận chuyển','van-chuyen','<p>Chúng tôi miễn phí vận chuyển cho đơn hàng trên 1.000.000đ.</p>',1,'2026-04-28 10:07:42','2026-04-28 10:07:42');
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `image_url` text NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_pi_product` (`product_id`),
  CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES
(5,1,'/uploads/products/1777271513807-uzbnschft8.png',1,0),
(6,1,'/uploads/products/1777271516546-lk5gepetd5.webp',0,1);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `color_name` varchar(50) NOT NULL,
  `color_hex` varchar(20) NOT NULL,
  `size` varchar(20) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_variant` (`product_id`,`color_hex`,`size`),
  UNIQUE KEY `uq_variant_sku` (`sku`),
  KEY `idx_variant_product` (`product_id`),
  CONSTRAINT `fk_variant_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES
(1,1,NULL,'Xám Đen','#2f2f2f','S',3),
(2,1,NULL,'Xám Đen','#2f2f2f','M',5),
(3,1,NULL,'Xám Đen','#2f2f2f','L',3),
(5,1,NULL,'Kem Cát','#c8b89a','S',2),
(6,1,NULL,'Kem Cát','#c8b89a','M',3),
(7,1,NULL,'Kem Cát','#c8b89a','L',2),
(8,1,NULL,'Kem Cát','#c8b89a','XL',1),
(9,2,NULL,'Đen Nhám','#1a1c1c','S',5),
(10,2,NULL,'Đen Nhám','#1a1c1c','M',8),
(11,2,NULL,'Đen Nhám','#1a1c1c','L',5),
(12,2,NULL,'Đen Nhám','#1a1c1c','XL',4),
(13,2,NULL,'Trắng Kem','#f5f0e8','S',3),
(14,2,NULL,'Trắng Kem','#f5f0e8','M',5),
(15,2,NULL,'Trắng Kem','#f5f0e8','L',4),
(16,2,NULL,'Nâu Đất','#4a3728','S',2),
(17,2,NULL,'Nâu Đất','#4a3728','M',3),
(18,3,NULL,'Be Đất','#c8b89a','28',3),
(19,3,NULL,'Be Đất','#c8b89a','30',6),
(20,3,NULL,'Be Đất','#c8b89a','32',5),
(21,3,NULL,'Be Đất','#c8b89a','34',3),
(22,3,NULL,'Xám Than','#3d3d3d','28',2),
(23,3,NULL,'Xám Than','#3d3d3d','30',4),
(24,3,NULL,'Xám Than','#3d3d3d','32',3),
(25,4,NULL,'Đen','#1a1c1c','39',1),
(26,4,NULL,'Đen','#1a1c1c','40',3),
(27,4,NULL,'Đen','#1a1c1c','41',2),
(28,4,NULL,'Đen','#1a1c1c','42',1),
(29,4,NULL,'Nâu','#4a3728','39',1),
(30,4,NULL,'Nâu','#4a3728','40',2),
(31,4,NULL,'Nâu','#4a3728','41',2),
(32,4,NULL,'Nâu','#4a3728','42',1),
(33,5,NULL,'Anthracite','#3d3d3d','S',4),
(34,5,NULL,'Anthracite','#3d3d3d','M',5),
(35,5,NULL,'Anthracite','#3d3d3d','L',3),
(36,5,NULL,'Đen','#1a1c1c','S',3),
(37,5,NULL,'Đen','#1a1c1c','M',4),
(38,5,NULL,'Đen','#1a1c1c','L',2),
(39,5,NULL,'Nâu Mocha','#8b6f5e','S',2),
(40,5,NULL,'Nâu Mocha','#8b6f5e','M',3),
(41,6,NULL,'Đen','#1a1c1c','M',2),
(42,6,NULL,'Đen','#1a1c1c','L',2),
(43,6,NULL,'Đen','#1a1c1c','XL',1),
(44,6,NULL,'Xám Đen','#2f2f2f','M',1),
(45,6,NULL,'Xám Đen','#2f2f2f','L',1),
(46,6,NULL,'Xám Đen','#2f2f2f','XL',0),
(47,1,NULL,'45fg','#b62f2f','M',0);
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `price` decimal(12,0) NOT NULL,
  `sale_price` decimal(12,0) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_slug` (`slug`),
  UNIQUE KEY `uq_product_sku` (`sku`),
  KEY `idx_product_cat` (`category_id`),
  CONSTRAINT `fk_product_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES
(1,1,'Áo Blazer Linen Phom Rộng','ao-blazer-linen-phom-rong','BLZ-LIN-01',4500000,4000000,'Blazer linen cao cấp, form rộng thoáng mát.',1,NULL,'2026-04-27 06:29:51','2026-04-27 15:22:10'),
(2,2,'Áo Sơ mi Form Rộng','ao-so-mi-form-rong','SM-RONG-01',1850000,1500000,'Sơ mi form rộng unisex, chất liệu poplin mềm.',1,NULL,'2026-04-27 06:29:51','2026-04-27 06:29:51'),
(3,4,'Quần Khaki Chino','quan-khaki-chino','QK-CHINO-01',2200000,NULL,'Quần khaki chino 5 túi, cotton pha elastane.',1,NULL,'2026-04-27 06:29:51','2026-04-27 06:29:51'),
(4,5,'Giày da Loafer','giay-da-loafer','GD-LOAFER-01',3900000,3500000,'Loafer da bò thật, đế cao su, thích hợp công sở.',1,NULL,'2026-04-27 06:29:51','2026-04-27 06:29:51'),
(5,3,'Áo len Cổ tròn Anthracite','ao-len-co-tron-anthracite','AL-ANTH-01',2800000,NULL,'Áo len cổ tròn dệt dày, giữ ấm mùa đông.',1,NULL,'2026-04-27 06:29:51','2026-04-27 06:29:51'),
(6,1,'Áo khoác dạ dáng dài','ao-khoac-da-dang-dai','AKD-DAI-01',12500000,11000000,'Áo khoác dạ cao cấp, form cổ điển.',1,NULL,'2026-04-27 06:29:51','2026-04-27 06:29:51');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promo_codes`
--

DROP TABLE IF EXISTS `promo_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promo_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percent','fixed') NOT NULL DEFAULT 'percent',
  `discount_value` decimal(10,2) NOT NULL,
  `min_order` decimal(12,0) NOT NULL DEFAULT 0,
  `max_uses` int(11) DEFAULT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_promo_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promo_codes`
--

LOCK TABLES `promo_codes` WRITE;
/*!40000 ALTER TABLE `promo_codes` DISABLE KEYS */;
INSERT INTO `promo_codes` VALUES
(1,'WELCOME10','percent',10.00,500000,NULL,0,NULL,1,'2026-04-27 06:29:51'),
(2,'NMEN200K','fixed',200000.00,2000000,100,0,NULL,1,'2026-04-27 06:29:51'),
(3,'VIP20','percent',20.00,5000000,50,0,NULL,1,'2026-04-27 06:29:51');
/*!40000 ALTER TABLE `promo_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provinces`
--

DROP TABLE IF EXISTS `provinces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `provinces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `level` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_province_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provinces`
--

LOCK TABLES `provinces` WRITE;
/*!40000 ALTER TABLE `provinces` DISABLE KEYS */;
INSERT INTO `provinces` VALUES
(1,'01','Thành phố Hà Nội','Thành phố Trung ương'),
(2,'31','Thành phố Hải Phòng','Thành phố Trung ương'),
(3,'48','Thành phố Đà Nẵng','Thành phố Trung ương'),
(4,'79','Thành phố Hồ Chí Minh','Thành phố Trung ương'),
(5,'92','Thành phố Cần Thơ','Thành phố Trung ương');
/*!40000 ALTER TABLE `provinces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_addresses`
--

DROP TABLE IF EXISTS `user_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `label` varchar(50) DEFAULT 'Nhà',
  `recipient` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text NOT NULL,
  `province_id` int(11) DEFAULT NULL,
  `commune_id` int(11) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ua_user` (`user_id`),
  KEY `fk_ua_province_id` (`province_id`),
  KEY `fk_ua_commune_id` (`commune_id`),
  CONSTRAINT `fk_ua_commune_id` FOREIGN KEY (`commune_id`) REFERENCES `communes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ua_province_id` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ua_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_addresses`
--

LOCK TABLES `user_addresses` WRITE;
/*!40000 ALTER TABLE `user_addresses` DISABLE KEYS */;
INSERT INTO `user_addresses` VALUES
(1,1,'Nhà','Nguyễn Văn A','+84987654321','Khu vực Sảnh A, Tòa ICT, Quận Cầu Giấy',3,15,1,'2026-04-27 06:29:51'),
(2,2,'Nhà','Trần Minh B','+84912345678','123 Nguyễn Trãi, Quận 1',NULL,NULL,1,'2026-04-27 06:29:51'),
(3,2,'Công ty','Trần Minh B','+84912345678','456 Đinh Tiên Hoàng, Quận Bình Thạnh',NULL,NULL,0,'2026-04-27 06:29:51'),
(4,1,'Công ty','test','123456789','Hà Đông',3,13,0,'2026-04-28 04:46:03'),
(5,7,'Nhà','Lê Quang Ngọc An','0387210034','Nghĩa Lộ',1,9,1,'2026-04-28 09:29:27'),
(6,7,'Công ty','Nguyễn Văn A','123456789','Hà Đông',5,39,0,'2026-04-28 09:29:38');
/*!40000 ALTER TABLE `user_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin','customer') NOT NULL DEFAULT 'customer',
  `tier` enum('Hạng Đồng','Hạng Bạc','Hạng Vàng','Hạng Đen') NOT NULL DEFAULT 'Hạng Đồng',
  `points` int(11) NOT NULL DEFAULT 0,
  `avatar_url` text DEFAULT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Nguyễn Văn A','nguyenvana@example.com','$2a$10$0fnRdMwzt2H7o.oR.FsOCe5Cy0j/031BDnKsjEsdVeadZ5VUD/oRa','+84987654321','customer','Hạng Đen',2050,NULL,'2026-04-27 06:29:51','2026-04-28 09:19:22'),
(2,'Trần Minh B','tranminhb@example.com','$2a$10$0fnRdMwzt2H7o.oR.FsOCe5Cy0j/031BDnKsjEsdVeadZ5VUD/oRa','+84912345678','customer','Hạng Bạc',450,NULL,'2026-04-27 06:29:51','2026-04-27 06:29:51'),
(3,'Lê Hoàng C','lehoangg@example.com','$2a$10$0fnRdMwzt2H7o.oR.FsOCe5Cy0j/031BDnKsjEsdVeadZ5VUD/oRa','+84976543210','customer','Hạng Vàng',890,NULL,'2026-04-27 06:29:51','2026-04-27 06:29:51'),
(4,'Phạm Đức D','phamduc@example.com','$2a$10$0fnRdMwzt2H7o.oR.FsOCe5Cy0j/031BDnKsjEsdVeadZ5VUD/oRa','+84901234567','customer','Hạng Đồng',50,NULL,'2026-04-27 06:29:51','2026-04-27 06:29:51'),
(5,'Hoàng Quân E','hoangquan@example.com','$2a$10$0fnRdMwzt2H7o.oR.FsOCe5Cy0j/031BDnKsjEsdVeadZ5VUD/oRa','+84965432109','customer','Hạng Bạc',670,NULL,'2026-04-27 06:29:51','2026-04-27 06:29:51'),
(6,'NMen Admin','admin@nmen.vn','$2a$10$0fnRdMwzt2H7o.oR.FsOCe5Cy0j/031BDnKsjEsdVeadZ5VUD/oRa',NULL,'admin','Hạng Đen',0,NULL,'2026-04-27 06:29:51','2026-04-27 06:29:51'),
(7,'Lê Quang Ngọc An','lequangngocan@gmail.com','$2a$10$OQAUCh.TK3Hju.ZD5WYu/u1CJ8gaEKB9NJtsVPhc.M0XnfTi2hUf6',NULL,'customer','Hạng Đồng',0,NULL,'2026-04-28 09:28:46','2026-04-28 09:28:46');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wishlists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist` (`user_id`,`product_id`),
  KEY `fk_wl_product` (`product_id`),
  CONSTRAINT `fk_wl_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wl_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES
(1,1,3,'2026-04-27 06:29:51'),
(2,1,4,'2026-04-27 06:29:51'),
(3,2,1,'2026-04-27 06:29:51'),
(4,3,6,'2026-04-27 06:29:51');
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-28 17:21:06
