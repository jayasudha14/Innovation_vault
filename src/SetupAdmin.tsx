import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export function SetupAdmin() {
  const [email, setEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const createFirstAdmin = useMutation(api.setup.createFirstAdmin);
  const hasAdminUser = useQuery(api.setup.hasAdminUser);
  
  // Don't show setup if any admin already exists
  if (hasAdminUser) {
    return null;
  }
  
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    
    setIsCreating(true);
    
    try {
      await createFirstAdmin({ email: email.trim() });
      toast.success("Admin role assigned successfully! Please refresh the page.");
      setEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create admin");
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">
        🔧 Initial Setup: Create First Admin
      </h3>
      <p className="text-yellow-700 mb-4">
        No admin users exist yet. Enter the email of an existing user account to make them an admin.
      </p>
      
      <form onSubmit={handleCreateAdmin} className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user email to make admin"
          className="flex-1 px-4 py-2 rounded-lg border border-yellow-300 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
        />
        <button
          type="submit"
          disabled={isCreating}
          className="px-6 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Make Admin"}
        </button>
      </form>
      
      <p className="text-sm text-yellow-600 mt-2">
        Note: The user must already have an account. Create one first if needed.
      </p>
    </div>
  );
}
