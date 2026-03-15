import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Activity, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetStats } from "@workspace/api-client-react";

export default function Landing() {
  const { data: stats } = useGetStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-16 pb-32 sm:pt-24 sm:pb-40">
        <div className="absolute inset-0 z-0 opacity-[0.15]">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="City infrastructure background" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/100" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Empowering Citizens Daily
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6">
              Report Issues. <br/>
              <span className="text-gradient">Improve Your City.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Join thousands of responsible citizens making a difference. Report potholes, broken streetlights, and civic issues directly to local authorities.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/report">
                  Report an Issue <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-full bg-white border-border/50 hover:bg-slate-50 transition-all hover:-translate-y-1">
                <Link href="/community">
                  View Community Feed
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-20 z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="glass-panel rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border/50"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center px-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-foreground mb-2">{stats?.totalReports || "0"}</h3>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Reports</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center px-4 pt-8 md:pt-0">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-foreground mb-2">{stats?.inProgressCount || "0"}</h3>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">In Progress</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center px-4 pt-8 md:pt-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-foreground mb-2">{stats?.resolvedCount || "0"}</h3>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Issues Resolved</p>
          </motion.div>
        </motion.div>
      </section>
      
      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Spot an Issue", desc: "See a pothole, broken light, or garbage dump in your neighborhood." },
              { step: "2", title: "Report It", desc: "Submit the details via our simple form along with the location DIGIPIN." },
              { step: "3", title: "Get It Fixed", desc: "Local authorities take action while you track progress in real-time." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-primary/20 flex items-center justify-center text-2xl font-bold text-primary mb-6 shadow-sm">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
