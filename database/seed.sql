-- CircuitOps Seed Data
-- Database: circuitops_db

USE `circuitops_db`;

-- 1. Seed Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`) VALUES
(1, 'Smartphones', 'smartphones', 'Latest mobile phones, 5G smartphones, and budget-friendly devices.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format&fit=crop'),
(2, 'Laptops', 'laptops', 'High-performance laptops for students, professionals, and gamers.', 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?q=80&w=300&auto=format&fit=crop'),
(3, 'Smart TVs', 'smart-tvs', 'Immersive 4K UHD Smart TVs, QLED, and OLED displays with theater sound.', 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=300&auto=format&fit=crop'),
(4, 'Home Appliances', 'home-appliances', 'Energy-efficient ACs, refrigerators, washing machines, and mixers.', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop'),
(5, 'Gaming', 'gaming', 'Consoles, RGB keyboards, gaming mice, and premium headsets.', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&auto=format&fit=crop'),
(6, 'Accessories', 'accessories', 'Powerbanks, high-speed chargers, bluetooth neckbands, and phone cases.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop');

-- 2. Seed Users
-- Password is 'password123' for both. BCrypt hash is $2a$10$oO8VG.PgdihnCySXQG4V3uz8TVkWNvnPYm8PXLjUGd3YOMCvdZGDW
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `google_id`) VALUES
(1, 'CircuitOps Admin', 'admin@circuitops.ai', '$2a$10$oO8VG.PgdihnCySXQG4V3uz8TVkWNvnPYm8PXLjUGd3YOMCvdZGDW', 'admin', NULL),
(2, 'Bagha Customer', 'customer@circuitops.ai', '$2a$10$oO8VG.PgdihnCySXQG4V3uz8TVkWNvnPYm8PXLjUGd3YOMCvdZGDW', 'customer', NULL);

-- 3. Seed Products
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `discount_price`, `category_id`, `stock_quantity`, `image_url`, `status`) VALUES
-- Smartphones
(1, 'Circuit Phone 14 Pro Max', 'circuit-phone-14-pro-max', 'Our flagship smartphone with 120Hz Super Retina screen, 108MP camera, 5G capabilities, and long battery life. Designed for seamless performance.', 79999.00, 74999.00, 1, 25, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=500&auto=format&fit=crop', 'active'),
(2, 'Vishwa-Vani Connect X', 'vishwa-vani-connect-x', 'Affordable 5G phone featuring 6.5 inch display, 5000mAh battery, and triple AI camera setup. Built to connect the whole world.', 14999.00, 13499.00, 1, 40, 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?q=80&w=500&auto=format&fit=crop', 'active'),
(3, 'Sen-Sonics A54 5G', 'sen-sonics-a54-5g', 'Stunning design, dust and water-resistant smartphone with super AMOLED screen. Shoot professional-grade steady videos on the go.', 29999.00, NULL, 1, 15, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=500&auto=format&fit=crop', 'active'),

-- Laptops
(4, 'Circuit Notebook Air', 'circuit-notebook-air', 'Thin, lightweight notebook powered by custom octa-core processor. 16GB RAM, 512GB SSD, silent fanless design, up to 18 hours battery life.', 65000.00, 59999.00, 2, 10, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=500&auto=format&fit=crop', 'active'),
(5, 'Bhide Master Pro 14', 'bhide-master-pro-14', 'Strict, disciplined machine perfect for work, administration, and online lectures. High security, integrated web camera, long key travel.', 45000.00, 42000.00, 2, 8, 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?q=80&w=500&auto=format&fit=crop', 'active'),
(6, 'Daya Express Performance Laptop', 'daya-express-performance-laptop', 'Full of energy, heavy-duty laptop featuring premium graphic card for rendering, high refresh rate screen, and RGB keyboard lighting.', 85000.00, 79999.00, 2, 5, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=500&auto=format&fit=crop', 'active'),

-- Smart TVs
(7, 'Circuit Ultra Vision 55-inch UHD', 'circuit-ultra-vision-55-inch-uhd', '55 inch 4K Ultra HD Smart LED TV. Supports Netflix, Prime Video, Hotstar, and YouTube. Immersive sound system that fills your living room.', 42000.00, 37999.00, 3, 12, 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=500&auto=format&fit=crop', 'active'),
(8, 'Grand Cinema 43-inch TV', 'grand-cinema-43-inch-tv', 'Enjoy theatre-like experience at home with 43 inch Smart TV. Super contrast, HDR10 capabilities, Dolby Audio support, and built-in Chromecast.', 26000.00, 24000.00, 3, 18, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=500&auto=format&fit=crop', 'active'),

-- Home Appliances
(9, 'Circuit Super-Cooling AC (1.5 Ton)', 'circuit-super-cooling-ac-1-5-ton', '5-star inverter split air conditioner. High ambient cooling, PM 2.5 filter, energy efficient, silent sleep mode. Perfect for hot summers.', 38999.00, 34999.00, 4, 15, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=500&auto=format&fit=crop', 'active'),
(10, 'Circuit Power-Wash Washing Machine', 'circuit-power-wash-washing-machine', 'Fully automatic front-loading washing machine (8 Kg). Smart hygiene steam wash, Express 15 wash, low noise, and smart inverter motor.', 28000.00, 25999.00, 4, 7, 'https://images.unsplash.com/photo-1545173168-9f1947e80135?q=80&w=500&auto=format&fit=crop', 'active'),
(11, 'Chalo-Spin Juicer Mixer Grinder', 'chalo-spin-juicer-mixer-grinder', '750W motor mixer grinder with 3 stainless steel jars. Durable speed-controller knob, overload protector, perfect for kitchen masalas.', 4500.00, 3999.00, 4, 30, 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?q=80&w=500&auto=format&fit=crop', 'active'),

-- Gaming
(12, 'Circuit PlayBox Console', 'circuit-playbox-console', 'Next-gen gaming console with 825GB SSD, support for 4K 120Hz display, and ultra-high-speed data loading. Includes one controller.', 49999.00, NULL, 5, 6, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=500&auto=format&fit=crop', 'active'),
(13, 'Circuit Neon Pro Controller', 'circuit-neon-pro-controller', 'Wireless gaming controller with advanced haptic feedback, adaptive triggers, and ergonomic design. Fits perfectly in hands.', 5999.00, 4999.00, 5, 20, 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?q=80&w=500&auto=format&fit=crop', 'active'),

-- Accessories
(14, 'Circuit Pure-Bass Neckband', 'circuit-pure-bass-neckband', 'Magnetic ear-tips neckband with up to 30 hours playback, fast charging (10 mins charge = 10 hours play), IPX5 water resistance.', 1999.00, 1299.00, 6, 50, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=500&auto=format&fit=crop', 'active'),
(15, 'Circuit Charge-Bolt Powerbank (20k)', 'circuit-charge-bolt-powerbank-20k', '20000mAh external battery powerbank with 22.5W fast charge, dual output ports (USB-A, Type-C). Lightweight and matte finish.', 2499.00, 1799.00, 6, 40, 'https://images.unsplash.com/photo-1609592424085-f5dfca63b905?q=80&w=500&auto=format&fit=crop', 'active');

-- 4. Seed Inventory
INSERT INTO `inventory` (`product_id`, `bin_location`, `safety_stock`, `last_restocked`) VALUES
(1, 'A-01', 5, CURRENT_TIMESTAMP),
(2, 'A-02', 10, CURRENT_TIMESTAMP),
(3, 'A-03', 5, CURRENT_TIMESTAMP),
(4, 'B-01', 3, CURRENT_TIMESTAMP),
(5, 'B-02', 3, CURRENT_TIMESTAMP),
(6, 'B-03', 2, CURRENT_TIMESTAMP),
(7, 'C-01', 4, CURRENT_TIMESTAMP),
(8, 'C-02', 5, CURRENT_TIMESTAMP),
(9, 'D-01', 4, CURRENT_TIMESTAMP),
(10, 'D-02', 2, CURRENT_TIMESTAMP),
(11, 'D-03', 8, CURRENT_TIMESTAMP),
(12, 'E-01', 2, CURRENT_TIMESTAMP),
(13, 'E-02', 5, CURRENT_TIMESTAMP),
(14, 'F-01', 15, CURRENT_TIMESTAMP),
(15, 'F-02', 12, CURRENT_TIMESTAMP);

-- 5. Seed Addresses for Customer
INSERT INTO `addresses` (`id`, `user_id`, `name`, `phone`, `street`, `city`, `state`, `pin_code`, `is_default`) VALUES
(1, 2, 'Bagha Ram', '9876543210', 'Powai Flats, Room 102, Sector 3', 'Mumbai', 'Maharashtra', '400076', TRUE),
(2, 2, 'CircuitOps Logistics Hub', '9123456789', 'Goregaon East Industrial Zone, Plot 45', 'Mumbai', 'Maharashtra', '400063', FALSE);

-- 6. Seed Coupons
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order_value`, `active_until`, `is_active`) VALUES
(1, 'CIRCUITWELCOME', 'flat', 500.00, 2000.00, '2027-12-31 23:59:59', TRUE),
(2, 'FESTIVAL30', 'percentage', 30.00, 1000.00, '2027-12-31 23:59:59', TRUE);

-- 7. Seed Reviews
INSERT INTO `reviews` (`user_id`, `product_id`, `rating`, `comment`) VALUES
(2, 1, 5, 'Awesome phone! The camera quality is exceptional and looks very premium.'),
(2, 9, 4, 'Cools the room very quickly. A bit noisy on high speed but overall great AC.'),
(2, 14, 5, 'Best budget neckband. Bass is strong and charging lasts for days!');
