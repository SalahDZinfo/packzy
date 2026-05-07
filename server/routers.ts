import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllBundles,
  getBundleById,
  createBundle,
  updateBundle,
  deleteBundle,
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getSalesStats,
  getTopBundles,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Bundle management
  bundles: router({
    list: publicProcedure.query(async () => {
      return await getAllBundles();
    }),

    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getBundleById(input);
      }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          category: z.string(),
          price: z.string(),
          originalPrice: z.string(),
          savingsAmount: z.string(),
          savingsPercentage: z.string(),
          imageUrl: z.string().optional(),
          components: z
            .array(
              z.object({
                name: z.string(),
                description: z.string().optional(),
                price: z.string(),
                quantity: z.number().default(1),
                imageUrl: z.string().optional(),
                specifications: z.string().optional(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createBundle({
          name: input.name,
          description: input.description,
          category: input.category,
          price: input.price as any,
          originalPrice: input.originalPrice as any,
          savingsAmount: input.savingsAmount as any,
          savingsPercentage: input.savingsPercentage as any,
          imageUrl: input.imageUrl,
          isActive: 1,
          components: input.components?.map(c => ({
            name: c.name,
            description: c.description,
            price: c.price as any,
            quantity: c.quantity,
            imageUrl: c.imageUrl,
            specifications: c.specifications,
          })),
        });
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            price: z.string().optional(),
            originalPrice: z.string().optional(),
            savingsAmount: z.string().optional(),
            savingsPercentage: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        return await updateBundle(input.id, input.data as any);
      }),

    delete: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        await deleteBundle(input);
        return { success: true };
      }),
  }),

  // Order management
  orders: router({
    create: publicProcedure
      .input(
        z.object({
          userId: z.number(),
          orderNumber: z.string(),
          totalPrice: z.string(),
          totalSavings: z.string(),
          shippingAddress: z.string(),
          shippingCity: z.string(),
          shippingPhone: z.string(),
          paymentMethod: z.string().optional(),
          items: z.array(
            z.object({
              bundleId: z.number(),
              bundleName: z.string(),
              quantity: z.number(),
              price: z.string(),
              savings: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        return await createOrder({
          userId: input.userId,
          orderNumber: input.orderNumber,
          totalPrice: input.totalPrice as any,
          totalSavings: input.totalSavings as any,
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity,
          shippingPhone: input.shippingPhone,
          paymentMethod: input.paymentMethod,
          status: "pending" as any,
          items: input.items.map(i => ({
            bundleId: i.bundleId,
            bundleName: i.bundleName,
            quantity: i.quantity,
            price: i.price as any,
            savings: i.savings as any,
          })),
        });
      }),

    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getOrderById(input);
      }),

    getUserOrders: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getUserOrders(input);
      }),

    getAll: publicProcedure.query(async () => {
      return await getAllOrders();
    }),

    updateStatus: publicProcedure
      .input(
        z.object({
          orderId: z.number(),
          status: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await updateOrderStatus(input.orderId, input.status);
      }),
  }),

  // Analytics
  analytics: router({
    salesStats: publicProcedure.query(async () => {
      return await getSalesStats();
    }),

    topBundles: publicProcedure
      .input(z.number().optional())
      .query(async ({ input }) => {
        return await getTopBundles(input || 5);
      }),
  }),
});

export type AppRouter = typeof appRouter;
