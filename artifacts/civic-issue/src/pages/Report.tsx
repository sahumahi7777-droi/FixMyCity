import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { FileWarning, MapPin, User, Mail, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateIssue } from "@workspace/api-client-react";
import { CATEGORIES } from "@/lib/constants";

const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(10, "Please provide more details (minimum 10 characters)"),
  digiPin: z.string().min(6, "Valid DIGIPIN is required"),
  location: z.string().min(5, "Please provide a descriptive location"),
  reporterName: z.string().min(2, "Name is required"),
  reporterEmail: z.string().email("Please enter a valid email address"),
  reporterContact: z.string().min(10, "Please enter a valid contact number"),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function Report() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createIssueMutation = useCreateIssue();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
  });

  const onSubmit = (data: ReportFormValues) => {
    createIssueMutation.mutate({ data }, {
      onSuccess: (result) => {
        toast({
          title: "Issue Reported Successfully!",
          description: `Your issue ID is #${result.id}. Thank you for contributing.`,
        });
        setLocation("/community");
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: err.message || "Something went wrong. Please try again.",
        });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileWarning className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">Report an Issue</h1>
          <p className="text-muted-foreground text-lg">
            Help us identify and fix problems in your neighborhood. Please provide accurate details to ensure quick resolution.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-primary" /> Issue Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Issue Title <span className="text-destructive">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Large pothole on Main Street" 
                  className="bg-white"
                  {...register("title")} 
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select onValueChange={(val) => setValue("category", val)} defaultValue={watch("category")}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="digiPin">DIGIPIN <span className="text-destructive">*</span></Label>
                <Input 
                  id="digiPin" 
                  placeholder="e.g., IN-98765432" 
                  className="bg-white"
                  {...register("digiPin")} 
                />
                {errors.digiPin && <p className="text-sm text-destructive">{errors.digiPin.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Landmark / Location <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input 
                    id="location" 
                    placeholder="Near City Park entrance" 
                    className="pl-10 bg-white"
                    {...register("location")} 
                  />
                </div>
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide any additional details about the issue..." 
                  className="min-h-[120px] bg-white resize-y"
                  {...register("description")} 
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Your Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="reporterName">Full Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="reporterName" 
                  placeholder="John Doe" 
                  className="bg-white"
                  {...register("reporterName")} 
                />
                {errors.reporterName && <p className="text-sm text-destructive">{errors.reporterName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterEmail">Email <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input 
                    id="reporterEmail" 
                    type="email"
                    placeholder="john@example.com" 
                    className="pl-10 bg-white"
                    {...register("reporterEmail")} 
                  />
                </div>
                {errors.reporterEmail && <p className="text-sm text-destructive">{errors.reporterEmail.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterContact">Contact Number <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input 
                    id="reporterContact" 
                    placeholder="+1 234 567 8900" 
                    className="pl-10 bg-white"
                    {...register("reporterContact")} 
                  />
                </div>
                {errors.reporterContact && <p className="text-sm text-destructive">{errors.reporterContact.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full sm:w-auto h-14 px-10 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
              disabled={createIssueMutation.isPending}
            >
              {createIssueMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
