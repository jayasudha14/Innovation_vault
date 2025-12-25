import { IdeaList } from "./IdeaList";

export function AdminPanel() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-red-600">Admin Panel</h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Ideas</h3>
        <p className="text-sm text-gray-600 mb-6">
          Review and update the status of submitted ideas. You can change the status from Pending to Under Review, Approved, Rejected, or Implemented.
        </p>
        <IdeaList showAll={true} />
      </div>
    </div>
  );
}
