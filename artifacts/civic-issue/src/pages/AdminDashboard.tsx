import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Filter, Search, Loader2, Save } from "lucide-react";
import { useAdminGetAllIssues, useUpdateIssueStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES, STATUS_CONFIG } from "@/lib/constants";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<any>("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      setLocation("/admin");
    }
  }, [location, setLocation]);

  const { data, isLoading } = useAdminGetAllIssues({
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const updateMutation = useUpdateIssueStatus();

  const handleEdit = (issue: any) => {
    setEditingId(issue.id);
    setEditStatus(issue.status);
    setEditNotes(issue.adminNotes || "");
  };

  const handleSave = (id: number) => {
    updateMutation.mutate({
      id,
      data: { status: editStatus, adminNotes: editNotes }
    }, {
      onSuccess: () => {
        toast({ title: "Issue Updated", description: `Issue #${id} status changed to ${editStatus}.` });
        setEditingId(null);
        queryClient.invalidateQueries({ queryKey: ["/api/admin/issues"] });
        queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Update Failed", description: err.message });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-medium">Loading administrative dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Master Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage, track, and update all civic issues.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-border shadow-sm">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-0 bg-transparent shadow-none focus:ring-0">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-border shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] border-0 bg-transparent shadow-none focus:ring-0">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-border uppercase tracking-wider text-muted-foreground font-bold text-xs">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Issue Details</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Status & Upvotes</th>
              <th className="px-6 py-4 w-64">Admin Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.issues.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No issues found matching the selected filters.
                </td>
              </tr>
            ) : (
              data?.issues.map((issue) => {
                const isEditing = editingId === issue.id;
                const statusCfg = STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG];
                
                return (
                  <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-500">#{issue.id}</td>
                    <td className="px-6 py-4 max-w-sm whitespace-normal">
                      <p className="font-bold text-foreground line-clamp-1">{issue.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">By: {issue.reporterName} • {format(new Date(issue.submittedAt), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PIN: {issue.digiPin}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        {issue.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        {!isEditing ? (
                          <Badge variant="secondary" className={`${statusCfg.color}`}>
                            {statusCfg.label}
                          </Badge>
                        ) : (
                          <Select value={editStatus} onValueChange={setEditStatus}>
                            <SelectTrigger className="w-[140px] h-8 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reported">Reported</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <span className="text-xs font-semibold text-slate-500 flex items-center">
                          👍 {issue.reportCount} Upvotes
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            value={editNotes} 
                            onChange={(e) => setEditNotes(e.target.value)} 
                            placeholder="Add resolution notes..." 
                            className="h-8 bg-white w-48"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleSave(issue.id)}
                            disabled={updateMutation.isPending}
                            className="h-8"
                          >
                            <Save className="w-4 h-4 mr-1" /> Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 justify-between w-full">
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]" title={issue.adminNotes || "No notes"}>
                            {issue.adminNotes || <span className="italic">No admin notes</span>}
                          </p>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(issue)}>
                            Update
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
