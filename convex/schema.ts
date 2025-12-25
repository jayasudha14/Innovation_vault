import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  ideas: defineTable({
    title: v.string(),
    description: v.string(),
    submittedBy: v.id("users"),
    pledgeSupportCount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("implemented")
    ),
    category: v.string(),
    tags: v.array(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_submitter", ["submittedBy"])
    .index("by_support_count", ["pledgeSupportCount"]),

  userRoles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
