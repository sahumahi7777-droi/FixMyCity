import { useState, useEffect } from "react";
import {
  getAllIssues,
  updateIssue,
  deleteIssue,
  CivicIssue,
  getAdminCredentials,
  updateAdminCredentials,
} from "../lib/dataManager";

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<CivicIssue[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<CivicIssue>>({});
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [newCredentials, setNewCredentials] = useState({
    username: "",
    password: "",
  });

  const categories = [
    "All",
    "Road & Infrastructure",
    "Waste Management",
    "Water Supply",
    "Street Lighting",
    "Public Safety",
  ];

  const statuses = ["All", "reported", "in-progress", "resolved"];

  // Load issues on mount
  useEffect(() => {
    loadIssues();
  }, []);

  // Filter issues when category or status changes
  useEffect(() => {
    filterIssues();
  }, [selectedCategory, selectedStatus, issues]);

  const loadIssues = () => {
    const allIssues = getAllIssues();
    setIssues(allIssues);
  };

  const filterIssues = () => {
    let filtered = issues;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((issue) => issue.category === selectedCategory);
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter((issue) => issue.status === selectedStatus);
    }

    setFilteredIssues(filtered);
  };

  const handleStatusChange = (issueId: string, newStatus: string) => {
    const updated = updateIssue(issueId, {
      status: newStatus as "reported" | "in-progress" | "resolved",
    });
    if (updated) {
      loadIssues();
    }
  };

  const handleDeleteIssue = (issueId: string) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      deleteIssue(issueId);
      loadIssues();
    }
  };

  const handleStartEdit = (issue: CivicIssue) => {
    setEditingId(issue.id);
    setEditData({ ...issue });
  };

  const handleSaveEdit = (issueId: string) => {
    const updated = updateIssue(issueId, editData);
    if (updated) {
      setEditingId(null);
      setEditData({});
      loadIssues();
    }
  };

  const handleUpdateCredentials = () => {
    if (newCredentials.username && newCredentials.password) {
      updateAdminCredentials(newCredentials.username, newCredentials.password);
      alert("Admin credentials updated successfully!");
      setShowCredentialModal(false);
      setNewCredentials({ username: "", password: "" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "reported":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return "✅";
      case "in-progress":
        return "⏳";
      case "reported":
      default:
        return "🔔";
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage and resolve civic issues reported by the community
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCredentialModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            🔐 Change Credentials
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {issues.length}
          </div>
          <div className="text-sm text-gray-600">Total Issues</div>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-500 mb-2">
            {issues.filter((i) => i.status === "reported").length}
          </div>
          <div className="text-sm text-gray-600">Reported</div>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-orange-500 mb-2">
            {issues.filter((i) => i.status === "in-progress").length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {issues.filter((i) => i.status === "resolved").length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All Statuses" : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            Issues ({filteredIssues.length})
          </h3>
        </div>

        <div className="divide-y">
          {filteredIssues.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No issues found</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div key={issue.id} className="p-6 hover:bg-gray-50 transition">
                {editingId === issue.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editData.title || ""}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Status
                        </label>
                        <select
                          value={editData.status || "reported"}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              status: e.target.value as any,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="reported">Reported</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Admin Notes
                      </label>
                      <textarea
                        value={editData.adminNotes || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            adminNotes: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(issue.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditData({});
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">
                          {issue.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>ID: {issue.id}</span>
                          <span>📅 {new Date(issue.submittedAt).toLocaleDateString()}</span>
                          <span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                issue.status
                              )}`}
                            >
                              {getStatusIcon(issue.status)} {issue.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">{issue.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{issue.location || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">DIGIPIN</p>
                        <p className="font-medium">{issue.digiPin}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reported By</p>
                        <p className="font-medium">{issue.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-blue-600">{issue.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-medium">{issue.contact}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Description</p>
                      <p className="text-gray-800">{issue.description}</p>
                    </div>

                    {issue.imageData && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Attached Image/Video</p>
                        {issue.imageType?.startsWith("video/") ? (
                          <video
                            src={issue.imageData}
                            controls
                            className="w-full max-h-64 rounded-lg border border-gray-300"
                          />
                        ) : (
                          <img
                            src={issue.imageData}
                            alt="Issue"
                            className="w-full max-h-64 object-cover rounded-lg border border-gray-300"
                          />
                        )}
                      </div>
                    )}

                    {issue.adminNotes && (
                      <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Admin Notes</p>
                        <p className="text-gray-800">{issue.adminNotes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <select
                        value={issue.status}
                        onChange={(e) =>
                          handleStatusChange(issue.id, e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="reported">Reported</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <button
                        onClick={() => handleStartEdit(issue)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteIssue(issue.id)}
                        className="px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Change Credentials Modal */}
      {showCredentialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Change Admin Credentials</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  New Username
                </label>
                <input
                  type="text"
                  value={newCredentials.username}
                  onChange={(e) =>
                    setNewCredentials((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newCredentials.password}
                  onChange={(e) =>
                    setNewCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleUpdateCredentials}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowCredentialModal(false);
                    setNewCredentials({ username: "", password: "" });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
