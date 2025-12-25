import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper function to get user role
async function getUserRole(ctx: QueryCtx | MutationCtx, userId: string) {
  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .unique();
  return userRole?.role || "user";
}

// Helper function to ensure user is authenticated
async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

// Helper function to ensure user is admin
async function ensureAdmin(ctx: MutationCtx) {
  const userId = await getAuthenticatedUser(ctx);
  const role = await getUserRole(ctx, userId);
  if (role !== "admin") {
    throw new Error("Admin access required");
  }
  return userId;
}

// Query to get all ideas (for admins) or public view
export const listIdeas = query({
  args: { 
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("implemented")
    ))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    let ideas;
    
    if (args.status) {
      ideas = await ctx.db
        .query("ideas")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .order("desc")
        .collect();
    } else {
      ideas = await ctx.db.query("ideas").order("desc").collect();
    }
    
    // Get user info for each idea
    const ideasWithUsers = await Promise.all(
      ideas.map(async (idea) => {
        const user = await ctx.db.get(idea.submittedBy);
        return {
          ...idea,
          submitterEmail: user?.email || "Unknown",
        };
      })
    );
    
    return ideasWithUsers;
  },
});

// Query to get user's own ideas
export const myIdeas = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_submitter", (q: any) => q.eq("submittedBy", userId))
      .order("desc")
      .collect();
    
    return ideas;
  },
});

// Query to check if current user is admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    
    const role = await getUserRole(ctx, userId);
    return role === "admin";
  },
});

// Mutation: Authenticated user submits a new idea
export const submitIdea = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUser(ctx);
    
    const ideaId = await ctx.db.insert("ideas", {
      title: args.title,
      description: args.description,
      submittedBy: userId,
      pledgeSupportCount: 0,
      status: "pending" as const,
      category: args.category,
      tags: args.tags,
    });
    
    return ideaId;
  },
});

// Mutation: Authenticated user increments pledge support count (upvote)
export const pledgeSupport = mutation({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);
    
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new Error("Idea not found");
    }
    
    await ctx.db.patch(args.ideaId, {
      pledgeSupportCount: idea.pledgeSupportCount + 1,
    });
    
    return idea.pledgeSupportCount + 1;
  },
});

// Mutation: Admin updates the status of any idea
export const updateIdeaStatus = mutation({
  args: {
    ideaId: v.id("ideas"),
    status: v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("implemented")
    ),
  },
  handler: async (ctx, args) => {
    await ensureAdmin(ctx);
    
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new Error("Idea not found");
    }
    
    await ctx.db.patch(args.ideaId, {
      status: args.status,
    });
    
    return args.status;
  },
});
