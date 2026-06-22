import { betterAuth } from "better-auth";
import pg from "pg";

export const auth = betterAuth({
  database: new pg.Pool({
    connectionString: process.env.DATABASE_URL!,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    modelName: "expense_tracker_user",
  },
  session: {
    modelName: "expense_tracker_session",
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day — refresh session every day
  },
  account: {
    modelName: "expense_tracker_account",
  },
  verification: {
    modelName: "expense_tracker_verification",
  },
});

export type Session = typeof auth.$Infer.Session;
