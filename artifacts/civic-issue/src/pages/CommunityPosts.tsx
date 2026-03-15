import { useState, useEffect } from "react";
import {
  getAllCommunityPosts,
  addCommunityPost,
  updateCommunityPost,
  likeCommunityPost,
  addCommentToPost,
  deleteCommunityPost,
  CommunityPost,
  getAllIssues,
} from "../lib/dataManager";

export function CommunityPostsPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  const [formData, setFormData] = useState({
    authorName: "",
    authorEmail: "",
    title: "",
    caption: "",
    beforeImage: "",
    beforeImageType: "",
    afterImage: "",
    afterImageType: "",
    issueId: "",
  });

  const [imageSizeError, setImageSizeError] = useState("");
  const [issues, setIssues] = useState<any[]>([]);

  // Load posts and issues on mount
  useEffect(() => {
    loadPosts();
    loadIssues();
  }, []);

  const loadPosts = () => {
    const allPosts = getAllCommunityPosts();
    // Sort by date descending
    const sorted = allPosts.sort(
      (a, b) =>
        new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    );
    setPosts(sorted);
  };

  const loadIssues = () => {
    const allIssues = getAllIssues();
    setIssues(allIssues);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "beforeImage" | "afterImage"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setImageSizeError("File size must not exceed 10MB");
      return;
    }

    setImageSizeError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        [field]: base64String,
        [`${field}Type`]: file.type,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.authorName || !formData.beforeImage) {
      alert("Please fill name and upload before image");
      return;
    }

    const newPost = addCommunityPost({
      authorName: formData.authorName,
      authorEmail: formData.authorEmail,
      title: formData.title,
      caption: formData.caption,
      beforeImage: formData.beforeImage,
      beforeImageType: formData.beforeImageType,
      afterImage: formData.afterImage,
      afterImageType: formData.afterImageType,
      issueId: formData.issueId,
    });

    if (newPost) {
      loadPosts();
      setShowCreateModal(false);
      setFormData({
        authorName: "",
        authorEmail: "",
        title: "",
        caption: "",
        beforeImage: "",
        beforeImageType: "",
        afterImage: "",
        afterImageType: "",
        issueId: "",
      });
    }
  };

  const handleEditPost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setEditingPostId(postId);
      setFormData({
        authorName: post.authorName,
        authorEmail: post.authorEmail,
        title: post.title,
        caption: post.caption,
        beforeImage: post.beforeImage,
        beforeImageType: post.beforeImageType,
        afterImage: post.afterImage || "",
        afterImageType: post.afterImageType || "",
        issueId: post.issueId || "",
      });
      setShowCreateModal(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingPostId) {
      updateCommunityPost(editingPostId, {
        afterImage: formData.afterImage,
        afterImageType: formData.afterImageType,
        caption: formData.caption,
      });
      setEditingPostId(null);
      setShowCreateModal(false);
      loadPosts();
    }
  };

  const handleLikePost = (postId: string) => {
    likeCommunityPost(postId);
    loadPosts();
  };

  const handleAddComment = (postId: string) => {
    if (newComment.trim()) {
      addCommentToPost(postId, formData.authorName || "Anonymous", newComment);
      setNewComment("");
      setCommentingPostId(null);
      loadPosts();
    }
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteCommunityPost(postId);
      loadPosts();
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
          Community Success Stories
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Share before and after photos of resolved civic issues
        </p>
        <button
          onClick={() => {
            setEditingPostId(null);
            setFormData({
              authorName: "",
              authorEmail: "",
              title: "",
              caption: "",
              beforeImage: "",
              beforeImageType: "",
              afterImage: "",
              afterImageType: "",
              issueId: "",
            });
            setShowCreateModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-md hover:from-blue-600 hover:to-green-600 font-medium"
        >
          ✨ Create New Post
        </button>
      </div>

      {/* Posts Grid */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white border rounded-lg">
            <p className="text-lg text-gray-500 mb-2">No posts yet</p>
            <p className="text-sm text-gray-400">
              Be the first to share your civic success story!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">
                        {post.authorName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{post.authorName}</p>
                      <p className="text-xs text-gray-500">
                        📅 {new Date(post.reportedAt).toLocaleDateString()}
                        {post.editedAt &&
                          ` (Edited ${new Date(post.editedAt).toLocaleDateString()})`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Title and Caption */}
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  <p className="text-gray-600">{post.caption}</p>
                </div>

                {/* Issue Link */}
                {post.issueId && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      🔗 Related Issue: <span className="font-mono">{post.issueId}</span>
                    </p>
                  </div>
                )}

                {/* Before/After Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium mb-2 text-red-600">
                      Before
                    </p>
                    <img
                      src={post.beforeImage}
                      alt="Before"
                      className="w-full h-64 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                  {post.afterImage ? (
                    <div>
                      <p className="text-sm font-medium mb-2 text-green-600">
                        After
                      </p>
                      <img
                        src={post.afterImage}
                        alt="After"
                        className="w-full h-64 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <div className="text-center">
                        <div className="text-3xl mb-2">🔄</div>
                        <p className="text-sm text-gray-500">
                          After image coming soon
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition"
                    >
                      <span>❤️</span>
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button
                      onClick={() => setCommentingPostId(post.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition"
                    >
                      <span>💬</span>
                      <span className="text-sm">{post.comments.length}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditPost(post.id)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {post.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 p-3 rounded-lg text-sm"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-gray-800">
                            {comment.authorName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.postedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                {commentingPostId === post.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        Post
                      </button>
                      <button
                        onClick={() => setCommentingPostId(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingPostId ? "Edit Post" : "Create New Post"}
            </h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {!editingPostId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={formData.authorName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          authorName: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.authorEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          authorEmail: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Post Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Road Pothole Fixed on Main Street"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Related Issue (Optional)
                    </label>
                    <select
                      value={formData.issueId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          issueId: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select an issue</option>
                      {issues.map((issue) => (
                        <option key={issue.id} value={issue.id}>
                          {issue.id} - {issue.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Before Image *
                    </label>
                    <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm text-gray-600">
                          {formData.beforeImage ? (
                            <span className="text-green-600 font-medium">
                              ✓ Image uploaded
                            </span>
                          ) : (
                            <>
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              before image
                            </>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "beforeImage")}
                      />
                    </label>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Caption/Description
                </label>
                <textarea
                  placeholder="Describe the issue and how it was resolved..."
                  value={formData.caption}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      caption: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  After Image {editingPostId && "(Optional - leave empty to keep current)"}
                </label>
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-50">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm text-gray-600">
                      {formData.afterImage ? (
                        <span className="text-green-600 font-medium">
                          ✓ Image uploaded
                        </span>
                      ) : (
                        <>
                          <span className="font-semibold">
                            Click to upload
                          </span>{" "}
                          after image
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "afterImage")}
                  />
                </label>
              </div>

              {imageSizeError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {imageSizeError}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-6 mt-6 border-t">
              <button
                onClick={() => {
                  if (editingPostId) {
                    handleSaveEdit();
                  } else {
                    handleCreatePost(new Event("submit") as any);
                  }
                }}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
              >
                {editingPostId ? "Update Post" : "Create Post"}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPostId(null);
                  setFormData({
                    authorName: "",
                    authorEmail: "",
                    title: "",
                    caption: "",
                    beforeImage: "",
                    beforeImageType: "",
                    afterImage: "",
                    afterImageType: "",
                    issueId: "",
                  });
                }}
                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
