import { useState } from "react";
import { getAdminCredentials } from "../lib/dataManager";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<"selection" | "customer" | "admin" | null>(
    null
  );
  const [userInput, setUserInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);

  const customerResponses: { [key: string]: string } = {
    report: "To report an issue, click on '📍 Report Issue' in the navigation. Fill in the issue details including title, category, location, and upload a photo/video. Your DIGIPIN is required for verification.",
    digipin: "DIGIPIN is a unique PIN from India Post that helps verify your location and identity. Click the 🔗 button next to the DIGIPIN field to know your DIGIPIN from the official India Post portal.",
    category: "Select the category that best matches your issue: Road & Infrastructure, Waste Management, Water Supply, Street Lighting, or Public Safety.",
    leaderboard: "The Leaderboard shows top community members ranked by points. You earn 50 points for reporting an issue and 100 points when it's resolved. Higher points give you titles like 'Civic Champion' or 'Community Hero'.",
    stories: "Success Stories (✨ Success Stories tab) shows before and after photos of resolved issues posted by community members. Click the heart to like or comment to engage with the community.",
    issues: "The Issues (📰 Issues tab) shows all civic issues reported by the community with their current status - Reported, In Progress, or Resolved. You can see who reported them and track the impact.",
    duplicate: "Each issue needs a unique DIGIPIN and category combination to prevent duplicates. The same DIGIPIN can be used for different categories.",
    image: "You can upload images or videos of up to 10MB. This helps authorities understand the issue better. The photo/video will be visible in the admin dashboard.",
    help: "I'm here to help! Ask me about: report, digipin, category, leaderboard, stories, issues, duplicate, image, or anything about reporting issues.",
    default: "I can help you with questions about reporting issues, DIGIPIN, categories, the leaderboard, success stories, and more. What would you like to know?",
  };

  const adminResponses: { [key: string]: string } = {
    dashboard: "The Admin Dashboard shows all reported issues. You can view issue details, photos, reporter information, and admin notes all in one place.",
    status: "To change an issue status, select from the dropdown (Reported → In Progress → Resolved). Status changes are tracked and affect the reporter's points.",
    filter: "Use the Category and Status filters to quickly find specific issues. Filter by category to see only one type of issue, or by status to see reported/in-progress/resolved issues.",
    edit: "Click the ✏️ Edit button on an issue to modify details and add admin notes. These notes are visible to the community to maintain transparency.",
    delete: "Click the 🗑️ Delete button to remove an issue from the system. Use this for spam or duplicate reports.",
    credentials: "Click '🔐 Change Credentials' to update your admin username and password. Keep your credentials secure.",
    image: "All uploaded images/videos from citizens are displayed in the admin dashboard. You can review them to verify the authenticity of reported issues.",
    points: "When you mark an issue as resolved, the reporter automatically gains 100 points, and their report count increases. The leaderboard updates automatically.",
    help: "I'm here to help! Ask me about: dashboard, status, filter, edit, delete, credentials, image, points, or anything about admin operations.",
    default: "I can help you with admin operations like managing issues, changing status, filtering, editing, and more. What would you like to know?",
  };

  const handleModeSelection = (selectedMode: "customer" | "admin") => {
    setMode(selectedMode);
    setMessages([]);

    if (selectedMode === "customer") {
      const botMessage: Message = {
        id: `msg-${Date.now()}`,
        text: "Hello! I'm your FixMyCity Assistant. I can help you with any questions about reporting issues, the leaderboard, success stories, and how to use the platform. What would you like to know?",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([botMessage]);
    } else {
      setShowPasswordField(true);
      const botMessage: Message = {
        id: `msg-${Date.now()}`,
        text: "Welcome Admin! Please enter your admin password to proceed.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([botMessage]);
    }
  };

  const handlePasswordSubmit = () => {
    const admin = getAdminCredentials();
    if (passwordInput === admin.password) {
      setAdminAuthenticated(true);
      setShowPasswordField(false);
      setPasswordInput("");
      const botMessage: Message = {
        id: `msg-${Date.now()}`,
        text: "Password verified! You're now authenticated. I can help you with admin-related questions about managing issues, filtering, changing status, and more. What would you like to know?",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } else {
      const botMessage: Message = {
        id: `msg-${Date.now()}`,
        text: "Incorrect password. Please try again.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || (!adminAuthenticated && mode === "admin")) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: userInput,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Get bot response
    const lowerInput = userInput.toLowerCase();
    const responses = mode === "customer" ? customerResponses : adminResponses;

    let response = responses.default;
    Object.keys(responses).forEach((key) => {
      if (key !== "default" && lowerInput.includes(key)) {
        response = responses[key];
      }
    });

    const botMessage: Message = {
      id: `msg-${Date.now()}-bot`,
      text: response,
      sender: "bot",
      timestamp: new Date().toLocaleTimeString(),
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setUserInput("");
  };

  const handleClose = () => {
    setIsOpen(false);
    setMode(null);
    setMessages([]);
    setAdminAuthenticated(false);
    setShowPasswordField(false);
    setPasswordInput("");
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-xl hover:scale-110"
          title="Chat with FixMyCity Assistant"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-lg shadow-2xl flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold">FixMyCity Assistant</h3>
                <p className="text-xs opacity-90">Here to help 24/7</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:opacity-70 text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {mode === null ? (
              // Mode Selection
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-800 mb-4">
                    Are you a customer or admin? Choose to get relevant help:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModeSelection("customer")}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium text-sm"
                    >
                      👤 Customer
                    </button>
                    <button
                      onClick={() => handleModeSelection("admin")}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium text-sm"
                    >
                      🛡️ Admin
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-lg text-sm ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Input Area */}
          {mode !== null && (
            <div className="border-t p-4 bg-white rounded-b-lg">
              {showPasswordField ? (
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Enter admin password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handlePasswordSubmit();
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handlePasswordSubmit}
                    className="w-full px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium text-sm"
                  >
                    Verify
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium text-sm"
                  >
                    Send
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
