import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";

interface IdeaListProps {
  showAll?: boolean;
  showMyIdeas?: boolean;
}

type StatusFilter = "pending" | "under_review" | "approved" | "rejected" | "implemented" | "";

export function IdeaList({ showAll = false, showMyIdeas = false }: IdeaListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const isAdmin = useQuery(api.ideas.isAdmin);
  
  const myIdeasQuery = useQuery(api.ideas.myIdeas, showMyIdeas ? {} : "skip");
  const allIdeasQuery = useQuery(api.ideas.listIdeas, !showMyIdeas ? (statusFilter ? { status: statusFilter } : {}) : "skip");
  
  const ideas = showMyIdeas ? myIdeasQuery : allIdeasQuery;
  
  const pledgeSupport = useMutation(api.ideas.pledgeSupport);
  const updateStatus = useMutation(api.ideas.updateIdeaStatus);

  const handlePledgeSupport = async (ideaId: Id<"ideas">) => {
    try {
      await pledgeSupport({ ideaId });
      toast.success("Support pledged!");
    } catch (error) {
      toast.error("Failed to pledge support");
    }
  };

  const handleStatusUpdate = async (ideaId: Id<"ideas">, newStatus: string) => {
    try {
      await updateStatus({ 
        ideaId, 
        status: newStatus as "pending" | "under_review" | "approved" | "rejected" | "implemented"
      });
      toast.success("Status updated!");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "under_review": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "implemented": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (ideas === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {showMyIdeas ? "My Ideas" : "All Ideas"}
        </h2>
        
        {!showMyIdeas && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="implemented">Implemented</option>
          </select>
        )}
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {showMyIdeas ? "You haven't submitted any ideas yet." : "No ideas found."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {ideas.map((idea: any) => (
            <div key={idea._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{idea.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>Category: {idea.category}</span>
                    {showAll && "submitterEmail" in idea && (
                      <span>By: {String(idea.submitterEmail)}</span>
                    )}
                    <span>{new Date(idea._creationTime).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(idea.status)}`}>
                    {idea.status.replace("_", " ").toUpperCase()}
                  </span>
                  {isAdmin && showAll && (
                    <select
                      value={idea.status}
                      onChange={(e) => handleStatusUpdate(idea._id, e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="implemented">Implemented</option>
                    </select>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">{idea.description}</p>

              {idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {idea.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePledgeSupport(idea._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span>👍</span>
                    <span>Support ({idea.pledgeSupportCount})</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
