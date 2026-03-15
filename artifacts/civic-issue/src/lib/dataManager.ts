export interface CivicIssue {
  id: string;
  title: string;
  category: string;
  description: string;
  digiPin: string;
  location: string;
  name: string;
  email: string;
  contact: string;
  status: "reported" | "in-progress" | "resolved";
  submittedAt: string;
  resolvedAt?: string;
  adminNotes?: string;
  imageData?: string;
  imageType?: string;
}

export interface CommunityPost {
  id: string;
  issueId?: string;
  authorName: string;
  authorEmail: string;
  title: string;
  caption: string;
  beforeImage: string;
  afterImage?: string;
  beforeImageType?: string;
  afterImageType?: string;
  reportedAt: string;
  editedAt?: string;
  likes: number;
  comments: Array<{
    id: string;
    authorName: string;
    text: string;
    postedAt: string;
  }>;
}

export interface UserPoints {
  name: string;
  email: string;
  points: number;
  reportCount: number;
  resolvedCount: number;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

const STORAGE_KEYS = {
  ISSUES: "civic_issues",
  USER_POINTS: "user_points",
  ADMIN_CREDENTIALS: "admin_credentials",
  COMMUNITY_POSTS: "community_posts",
};

const DEFAULT_ADMIN: AdminCredentials = {
  username: "admin",
  password: "admin123",
};

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function apiUrl(path: string) {
  return `${BASE_URL}/api${path}`;
}

function apiToLocal(apiIssue: any): CivicIssue {
  return {
    id: String(apiIssue.id),
    title: apiIssue.title,
    category: apiIssue.category,
    description: apiIssue.description,
    digiPin: apiIssue.digiPin,
    location: apiIssue.location || "",
    name: apiIssue.reporterName || "",
    email: apiIssue.reporterEmail || "",
    contact: apiIssue.reporterContact || "",
    status: apiIssue.status,
    submittedAt: apiIssue.submittedAt,
    resolvedAt: apiIssue.resolvedAt,
    adminNotes: apiIssue.adminNotes || "",
    imageData: "",
    imageType: "",
  };
}

function apiToUserPoints(entry: any): UserPoints {
  return {
    name: entry.reporterName,
    email: entry.reporterEmail || "",
    points: entry.points || entry.reportCount * 50,
    reportCount: entry.reportCount,
    resolvedCount: entry.resolvedCount || 0,
  };
}

export async function initializeData(): Promise<void> {
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_CREDENTIALS)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(DEFAULT_ADMIN));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS)) {
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify([]));
  }

  try {
    const [issuesRes, leaderboardRes] = await Promise.all([
      fetch(apiUrl("/issues?limit=200")),
      fetch(apiUrl("/leaderboard")),
    ]);

    if (issuesRes.ok) {
      const data = await issuesRes.json();
      const issues: CivicIssue[] = (data.issues || []).map(apiToLocal);
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    } else if (!localStorage.getItem(STORAGE_KEYS.ISSUES)) {
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify([]));
    }

    if (leaderboardRes.ok) {
      const data = await leaderboardRes.json();
      const points: UserPoints[] = (data.entries || []).map(apiToUserPoints);
      localStorage.setItem(STORAGE_KEYS.USER_POINTS, JSON.stringify(points));
    } else if (!localStorage.getItem(STORAGE_KEYS.USER_POINTS)) {
      localStorage.setItem(STORAGE_KEYS.USER_POINTS, JSON.stringify([]));
    }
  } catch (e) {
    console.warn("Could not sync with API, using localStorage fallback:", e);
    if (!localStorage.getItem(STORAGE_KEYS.ISSUES)) {
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_POINTS)) {
      localStorage.setItem(STORAGE_KEYS.USER_POINTS, JSON.stringify([]));
    }
  }
}

export function addIssue(issue: Omit<CivicIssue, "id" | "submittedAt">): CivicIssue {
  const issues = getAllIssues();
  const tempId = `CR-${Date.now().toString().slice(-6)}`;
  const newIssue: CivicIssue = {
    ...issue,
    id: tempId,
    submittedAt: new Date().toISOString(),
  };

  issues.push(newIssue);
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
  updateUserPoints(issue.name, issue.email, 50);

  fetch(apiUrl("/issues"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: issue.title,
      category: issue.category,
      description: issue.description,
      digiPin: issue.digiPin,
      location: issue.location,
      reporterName: issue.name,
      reporterEmail: issue.email,
      reporterContact: issue.contact,
    }),
  })
    .then((res) => {
      if (res.ok) return res.json();
    })
    .then((data) => {
      if (data?.issue) {
        const saved = getAllIssues();
        const idx = saved.findIndex((i) => i.id === tempId);
        if (idx !== -1) {
          saved[idx].id = String(data.issue.id);
          localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(saved));
        }
      }
    })
    .catch(() => {});

  return newIssue;
}

export function getAllIssues(): CivicIssue[] {
  const data = localStorage.getItem(STORAGE_KEYS.ISSUES);
  return data ? JSON.parse(data) : [];
}

export function getIssueById(id: string): CivicIssue | null {
  return getAllIssues().find((i) => i.id === id) || null;
}

export function updateIssue(id: string, updates: Partial<CivicIssue>): CivicIssue | null {
  const issues = getAllIssues();
  const index = issues.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const wasResolved = issues[index].status === "resolved";
  const updatedIssue = { ...issues[index], ...updates };
  if (updates.status === "resolved" && updates.status !== "resolved") {
    updatedIssue.resolvedAt = new Date().toISOString();
  }
  issues[index] = updatedIssue;
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));

  if (updates.status === "resolved" && !wasResolved) {
    updateUserPoints(updatedIssue.name, updatedIssue.email, 100);
  }

  if (updates.status) {
    fetch(apiUrl(`/issues/${id}/status`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: updates.status,
        adminNotes: updates.adminNotes ?? updatedIssue.adminNotes ?? "",
      }),
    }).catch(() => {});
  }

  return updatedIssue;
}

export function deleteIssue(id: string): boolean {
  const issues = getAllIssues();
  const filtered = issues.filter((i) => i.id !== id);
  if (filtered.length === issues.length) return false;

  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(filtered));

  fetch(apiUrl(`/issues/${id}`), { method: "DELETE" }).catch(() => {});

  return true;
}

export function getIssuesByCategory(category: string): CivicIssue[] {
  return getAllIssues().filter((i) => i.category === category);
}

export function getIssuesByStatus(status: string): CivicIssue[] {
  return getAllIssues().filter((i) => i.status === status);
}

export function isDuplicateIssue(digiPin: string, category: string): boolean {
  const issues = getAllIssues();
  return issues.some(
    (i) =>
      i.digiPin === digiPin &&
      i.category === category &&
      i.status !== "resolved"
  );
}

function updateUserPoints(name: string, email: string, pointsToAdd: number): void {
  const allPoints = getAllUserPoints();
  const existing = allPoints.find((u) => u.email === email);
  if (existing) {
    existing.points += pointsToAdd;
    existing.reportCount += pointsToAdd === 50 ? 1 : 0;
    existing.resolvedCount += pointsToAdd === 100 ? 1 : 0;
  } else {
    allPoints.push({
      name,
      email,
      points: pointsToAdd,
      reportCount: pointsToAdd === 50 ? 1 : 0,
      resolvedCount: pointsToAdd === 100 ? 1 : 0,
    });
  }
  allPoints.sort((a, b) => b.points - a.points);
  localStorage.setItem(STORAGE_KEYS.USER_POINTS, JSON.stringify(allPoints));
}

export function getAllUserPoints(): UserPoints[] {
  const data = localStorage.getItem(STORAGE_KEYS.USER_POINTS);
  return data ? JSON.parse(data) : [];
}

export function validateAdminLogin(username: string, password: string): boolean {
  const creds = getAdminCredentials();
  return creds.username === username && creds.password === password;
}

export function getAdminCredentials(): AdminCredentials {
  const data = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDENTIALS);
  return data ? JSON.parse(data) : DEFAULT_ADMIN;
}

export function updateAdminCredentials(username: string, password: string): void {
  localStorage.setItem(
    STORAGE_KEYS.ADMIN_CREDENTIALS,
    JSON.stringify({ username, password })
  );
}

export function getAllCommunityPosts(): CommunityPost[] {
  const data = localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS);
  return data ? JSON.parse(data) : [];
}

export function getCommunityPostById(id: string): CommunityPost | null {
  return getAllCommunityPosts().find((p) => p.id === id) || null;
}

export function addCommunityPost(
  post: Omit<CommunityPost, "id" | "reportedAt" | "likes" | "comments">
): CommunityPost {
  const posts = getAllCommunityPosts();
  const newPost: CommunityPost = {
    ...post,
    id: `POST-${Date.now().toString().slice(-6)}`,
    reportedAt: new Date().toISOString(),
    likes: 0,
    comments: [],
  };
  posts.push(newPost);
  localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
  return newPost;
}

export function updateCommunityPost(
  id: string,
  updates: Partial<CommunityPost>
): CommunityPost | null {
  const posts = getAllCommunityPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedPost = {
    ...posts[index],
    ...updates,
    editedAt: new Date().toISOString(),
  };
  posts[index] = updatedPost;
  localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
  return updatedPost;
}

export function likeCommunityPost(id: string): CommunityPost | null {
  const post = getCommunityPostById(id);
  if (!post) return null;
  return updateCommunityPost(id, { likes: post.likes + 1 });
}

export function addCommentToPost(
  postId: string,
  authorName: string,
  text: string
): CommunityPost | null {
  const post = getCommunityPostById(postId);
  if (!post) return null;

  const newComment = {
    id: `COMMENT-${Date.now().toString().slice(-6)}`,
    authorName,
    text,
    postedAt: new Date().toISOString(),
  };

  return updateCommunityPost(postId, {
    comments: [...post.comments, newComment],
  });
}

export function deleteCommunityPost(id: string): boolean {
  const posts = getAllCommunityPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(filtered));
  return true;
}
