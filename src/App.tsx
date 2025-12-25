import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { IdeaSubmissionForm } from "./IdeaSubmissionForm";
import { IdeaList } from "./IdeaList";
import { AdminPanel } from "./AdminPanel";
import { SetupAdmin } from "./SetupAdmin";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-blue-600">InnovationVault</h2>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1 p-8">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const isAdmin = useQuery(api.ideas.isAdmin);
  const [activeTab, setActiveTab] = useState<"submit" | "browse" | "my-ideas" | "admin">("browse");

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">InnovationCoach</h1>
        <p className="text-xl text-gray-600">Submit and discover innovative ideas</p>
      </div>

      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="space-y-6">
          {/* Setup Admin Component - shows when no admin exists */}
          <SetupAdmin />
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === "browse"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Browse Ideas
            </button>
            <button
              onClick={() => setActiveTab("submit")}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === "submit"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Submit Idea
            </button>
            <button
              onClick={() => setActiveTab("my-ideas")}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === "my-ideas"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              My Ideas
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                  activeTab === "admin"
                    ? "bg-red-600 text-white"
                    : "text-gray-600 hover:text-red-600"
                }`}
                >
                Admin Panel
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {activeTab === "submit" && <IdeaSubmissionForm />}
            {activeTab === "browse" && <IdeaList showAll={isAdmin} />}
            {activeTab === "my-ideas" && <IdeaList showMyIdeas={true} />}
            {activeTab === "admin" && isAdmin && <AdminPanel />}
          </div>
        </div>
      </Authenticated>
    </div>
  );
}
