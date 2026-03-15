import { useState } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, ThumbsUp, Filter, Search, Loader2 } from "lucide-react";
import { useGetIssues, useUpvoteIssue } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES, STATUS_CONFIG } from "@/lib/constants";

export default function Community() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data, isLoading } = useGetIssues({
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const upvoteMutation = useUpvoteIssue();

  const handleUpvote = (id: number) => {
    upvoteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Issue upvoted", description: "You have verified this issue." });
        queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Failed to upvote", description: err.message });
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Community Feed</h1>
          <p className="text-muted-foreground text-lg">Browse issues reported by citizens in your area.</p>
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="font-medium">Loading community reports...</p>
        </div>
      ) : data?.issues.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-border/50 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No issues found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or report a new issue.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {data?.issues.map((issue) => {
            const statusCfg = STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG];
            const StatusIcon = statusCfg.icon;
            
            return (
              <motion.div 
                key={issue.id}
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 border border-border/60 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 shrink-0">
                    {issue.category}
                  </Badge>
                  <Badge variant="secondary" className={`${statusCfg.color} font-medium shrink-0 flex items-center gap-1.5 px-2.5 py-1`}>
                    <StatusIcon className="w-3.5 h-3.5" /> {statusCfg.label}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2 leading-tight line-clamp-2">
                  {issue.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-1">
                  {issue.description}
                </p>
                
                <div className="mt-auto space-y-4">
                  <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground block">{issue.location}</span>
                      <span className="text-xs opacity-80">PIN: {issue.digiPin}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{issue.reporterName}</span>
                      <span className="block text-xs">{format(new Date(issue.submittedAt), 'MMM d, yyyy')}</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors text-primary"
                      onClick={() => handleUpvote(issue.id)}
                      disabled={upvoteMutation.isPending}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      <span className="font-semibold">{issue.reportCount}</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
