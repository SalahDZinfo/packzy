CREATE TABLE `bundles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`imageUrl` text,
	`price` decimal(10,2) NOT NULL,
	`originalPrice` decimal(10,2) NOT NULL,
	`savingsAmount` decimal(10,2) NOT NULL,
	`savingsPercentage` decimal(5,2) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bundles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `components` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bundleId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`price` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`specifications` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `components_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`bundleId` int NOT NULL,
	`bundleName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`price` decimal(10,2) NOT NULL,
	`savings` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`totalPrice` decimal(10,2) NOT NULL,
	`totalSavings` decimal(10,2) NOT NULL,
	`shippingAddress` text NOT NULL,
	`shippingCity` varchar(100) NOT NULL,
	`shippingPhone` varchar(20) NOT NULL,
	`paymentMethod` varchar(50),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
