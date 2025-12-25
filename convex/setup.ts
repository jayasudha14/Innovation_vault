import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to check if any admin exists in the system
export const hasAdminUser = query({
  args: {},
  handler: async (ctx) => {
    const existingAdmin = await ctx.db
      .query("userRoles")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();
    
    return !!existingAdmin;
  },
});

// One-time setup mutation to create the first admin user
// This should only be used during initial setup
export const createFirstAdmin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if any admin already exists
    const existingAdmin = await ctx.db
      .query("userRoles")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();
    
    if (existingAdmin) {
      throw new Error("An admin user already exists");
    }
    
    // Find the user by email
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    
    if (!user) {
      throw new Error("User not found. Please create an account first.");
    }
    
    // Check if user already has a role
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    
    if (existingRole) {
      // Update existing role to admin
      await ctx.db.patch(existingRole._id, { role: "admin" });
    } else {
      // Create new admin role
      await ctx.db.insert("userRoles", {
        userId: user._id,
        role: "admin",
      });
    }
    
    return { success: true, message: "Admin role assigned successfully" };
  },
});
