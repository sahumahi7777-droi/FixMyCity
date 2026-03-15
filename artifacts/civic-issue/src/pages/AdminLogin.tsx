import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Lock, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdminLogin } from "@workspace/api-client-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useAdminLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "admin", password: "admin123" }
  });

  const onSubmit = (data: LoginValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        if (res.success && res.token) {
          localStorage.setItem("admin_token", res.token);
          toast({ title: "Login Successful", description: "Welcome to the Admin Dashboard." });
          setLocation("/admin/dashboard");
        } else {
          toast({ variant: "destructive", title: "Login Failed", description: "Invalid credentials" });
        }
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Login Failed", description: err.message || "Invalid credentials" });
      }
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
          alt="Abstract pattern" 
          className="w-full h-full object-cover"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/30">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Sign in to manage civic issues.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              className="bg-white/50 h-12" 
              {...register("username")} 
            />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              className="bg-white/50 h-12" 
              {...register("password")} 
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : null}
            Sign In
          </Button>
        </form>
        
        <div className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Building2 className="w-4 h-4" />
          Authorized Municipal Personnel Only
        </div>
      </motion.div>
    </div>
  );
}
