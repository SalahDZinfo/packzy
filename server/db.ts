import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, User, users, InsertBundle, Bundle, bundles, InsertComponent, Component, components, InsertOrder, Order, orders, InsertOrderItem, OrderItem, orderItems, schema } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client, { schema });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: any = {
      openId: user.openId,
    };
    
    if (user.name !== undefined) values.name = user.name;
    if (user.email !== undefined) values.email = user.email;
    if (user.loginMethod !== undefined) values.loginMethod = user.loginMethod;
    if (user.lastSignedIn !== undefined) values.lastSignedIn = user.lastSignedIn;
    
    if (user.role !== undefined) {
      values.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: values,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where((users as any).openId === openId).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ... Rest of the functions updated for Postgres syntax if necessary
// Note: Drizzle syntax remains mostly the same, but 'onDuplicateKeyUpdate' is MySQL specific.
// I'll update 'onConflictDoUpdate' for Postgres.

export async function getAllBundles() {
  const db = await getDb();
  if (!db) return [];
  return await db.query.bundles.findMany({
    with: { components: true },
  });
}

export async function getBundleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.query.bundles.findFirst({
    where: (bundles, { eq }) => eq(bundles.id, id),
    with: { components: true },
  });
}

export async function createBundle(data: InsertBundle & { components?: Omit<InsertComponent, 'bundleId'>[] }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { components: componentsList, ...bundleData } = data;
  
  const result = await db.insert(bundles).values(bundleData).returning({ id: bundles.id });
  const bundleId = result[0].id;

  if (componentsList && componentsList.length > 0) {
    const componentsWithBundleId = componentsList.map(c => ({
      ...c,
      bundleId,
    }));
    await db.insert(components).values(componentsWithBundleId as InsertComponent[]);
  }

  return getBundleById(bundleId);
}

// ... I'll simplify the rest to keep it working with standard Drizzle queries which are DB agnostic
export async function updateBundle(id: number, data: Partial<InsertBundle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { eq } = await import("drizzle-orm");
  await db.update(bundles).set(data).where(eq(bundles.id, id));
  return getBundleById(id);
}

export async function deleteBundle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { eq } = await import("drizzle-orm");
  await db.delete(components).where(eq(components.bundleId, id));
  await db.delete(bundles).where(eq(bundles.id, id));
}

export async function createOrder(data: InsertOrder & { items: Omit<InsertOrderItem, 'orderId'>[] }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { items, ...orderData } = data;
  
  const result = await db.insert(orders).values(orderData).returning({ id: orders.id });
  const orderId = result[0].id;

  if (items && items.length > 0) {
    const itemsWithOrderId = items.map(item => ({
      ...item,
      orderId,
    }));
    await db.insert(orderItems).values(itemsWithOrderId as InsertOrderItem[]);
  }

  return getOrderById(orderId);
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.query.orders.findFirst({
    where: (orders, { eq }) => eq(orders.id, id),
    with: { items: true, user: true },
  });
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.query.orders.findMany({
    where: (orders, { eq }) => eq(orders.userId, userId),
    with: { items: true },
  });
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.query.orders.findMany({
    with: { items: true, user: true },
  });
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { eq } = await import("drizzle-orm");
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
  return getOrderById(orderId);
}

export async function getSalesStats() {
  const db = await getDb();
  if (!db) return { totalSales: 0, totalOrders: 0, totalSavings: 0 };
  
  const allOrders = await db.select().from(orders);
  const totalSales = allOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice.toString()), 0);
  const totalSavings = allOrders.reduce((sum, order) => sum + parseFloat(order.totalSavings.toString()), 0);
  
  return {
    totalSales,
    totalOrders: allOrders.length,
    totalSavings,
  };
}

export async function getTopBundles(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  
  const allOrderItems = await db.select().from(orderItems);
  const bundleStats = new Map<number, { name: string; count: number; totalSavings: number }>();
  
  for (const item of allOrderItems) {
    const key = item.bundleId;
    if (!bundleStats.has(key)) {
      bundleStats.set(key, { name: item.bundleName, count: 0, totalSavings: 0 });
    }
    const stats = bundleStats.get(key)!;
    stats.count += item.quantity;
    stats.totalSavings += parseFloat(item.savings.toString());
  }
  
  return Array.from(bundleStats.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([id, stats]) => ({ id, ...stats }));
}
