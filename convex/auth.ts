import Apple from "@auth/core/providers/apple";
import Google from "@auth/core/providers/google";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    // Email/Password authentication
    Password({ id: "password" }),

    // Magic link / OTP authentication
    Password({
      id: "password-otp",
      verify: async () => {
        // Email verification logic would go here
        return true;
      },
    }),

    // Anonymous authentication (for guest users)
    Anonymous,

    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Apple OAuth
    Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // Called after user is created or updated
    async afterUserCreatedOrUpdated(ctx, args) {
      const { userId, existingUserId } = args;

      // Only create profile/credits for new users
      if (!existingUserId) {
        // Create user profile
        await ctx.db.insert("profiles", {
          userId,
          isPremium: false,
          settings: {
            theme: "system",
            notificationsEnabled: true,
          },
        });

        // Initialize user credits
        await ctx.db.insert("userCredits", {
          userId,
          creditsRemaining: 10, // Free tier initial credits
          creditsUsedTotal: 0,
          lastRefillAt: Date.now(),
        });
      }
    },

    // Handle account linking (anonymous -> email)
    async createOrUpdateUser(ctx, args) {
      // Default implementation handles account linking
      return args;
    },
  },
});
