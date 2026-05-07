import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Bundle (Baqa) table - represents product bundles/packs
 */
export const bundles = mysqlTable("bundles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "Tools", "Accessories"
  imageUrl: text("imageUrl"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Bundle price
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }).notNull(), // Sum of individual prices
  savingsAmount: decimal("savingsAmount", { precision: 10, scale: 2 }).notNull(), // originalPrice - price
  savingsPercentage: decimal("savingsPercentage", { precision: 5, scale: 2 }).notNull(), // (savings / originalPrice) * 100
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bundle = typeof bundles.$inferSelect;
export type InsertBundle = typeof bundles.$inferInsert;

/**
 * Component (Mkomponent) table - individual items within a bundle
 */
export const components = mysqlTable("components", {
  id: int("id").autoincrement().primaryKey(),
  bundleId: int("bundleId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Individual price
  quantity: int("quantity").default(1).notNull(),
  specifications: text("specifications"), // JSON string for detailed specs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Component = typeof components.$inferSelect;
export type InsertComponent = typeof components.$inferInsert;

/**
 * Order table - customer orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  totalSavings: decimal("totalSavings", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shippingAddress").notNull(),
  shippingCity: varchar("shippingCity", { length: 100 }).notNull(),
  shippingPhone: varchar("shippingPhone", { length: 20 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * OrderItem table - bundles in an order
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  bundleId: int("bundleId").notNull(),
  bundleName: varchar("bundleName", { length: 255 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Price at time of order
  savings: decimal("savings", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Relations for Drizzle ORM
 */
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const bundlesRelations = relations(bundles, ({ many }) => ({
  components: many(components),
  orderItems: many(orderItems),
}));

export const componentsRelations = relations(components, ({ one }) => ({
  bundle: one(bundles, {
    fields: [components.bundleId],
    references: [bundles.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  bundle: one(bundles, {
    fields: [orderItems.bundleId],
    references: [bundles.id],
  }),
}));

/**
 * Export schema for Drizzle ORM initialization
 */
export const schema = {
  users,
  bundles,
  components,
  orders,
  orderItems,
  usersRelations,
  bundlesRelations,
  componentsRelations,
  ordersRelations,
  orderItemsRelations,
};
