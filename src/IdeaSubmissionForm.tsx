import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export function IdeaSubmissionForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitIdea = useMutation(api.ideas.submitIdea);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !category.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tagArray = tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await submitIdea({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        tags: tagArray,
      });

      toast.success("Idea submitted successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setTags("");
    } catch (error) {
      toast.error("Failed to submit idea");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Idea</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
            placeholder="Enter your idea title"
            maxLength={100}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
          >
            <option value="">Select a category</option>
            <option value="AI/ML">AI/ML</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Apps">Mobile Apps</option>
            <option value="DevOps">DevOps</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="Cloud Computing">Cloud Computing</option>
            <option value="IoT">IoT</option>
            <option value="Blockchain">Blockchain</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow resize-vertical"
            placeholder="Describe your idea in detail..."
            maxLength={2000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {description.length}/2000 characters
          </p>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags (optional)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
            placeholder="Enter tags separated by commas (e.g., innovation, startup, tech)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate multiple tags with commas
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Idea"}
        </button>
      </form>
    </div>
  );
}
