import { motion } from "framer-motion";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";
import { useGetLeaderboard } from "@workspace/api-client-react";

export default function Leaderboard() {
  const { data, isLoading } = useGetLeaderboard();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-medium">Loading civic champions...</p>
      </div>
    );
  }

  const entries = data?.entries || [];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return { color: "text-amber-500", bg: "bg-amber-100", border: "border-amber-300", icon: Trophy };
      case 2: return { color: "text-slate-400", bg: "bg-slate-100", border: "border-slate-300", icon: Medal };
      case 3: return { color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-300", icon: Award };
      default: return { color: "text-slate-500", bg: "bg-slate-50", border: "border-transparent", icon: null };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-4">Civic Leaderboard</h1>
        <p className="text-lg text-muted-foreground">
          Recognizing the most active citizens dedicated to improving our community infrastructure.
        </p>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-16 px-4">
          {[top3[1], top3[0], top3[2]].map((entry) => {
            if (!entry) return null;
            const style = getRankStyle(entry.rank);
            const Icon = style.icon!;
            const isFirst = entry.rank === 1;
            
            return (
              <motion.div 
                key={entry.rank}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: entry.rank * 0.1, type: "spring" }}
                className={`relative flex flex-col items-center p-6 bg-white rounded-3xl border-2 ${style.border} shadow-xl w-full max-w-xs ${isFirst ? 'md:-translate-y-8 z-10' : 'md:scale-95'}`}
              >
                <div className={`absolute -top-6 w-14 h-14 rounded-full ${style.bg} ${style.color} flex items-center justify-center border-4 border-white shadow-sm`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <h3 className={`mt-6 font-bold text-center text-foreground ${isFirst ? 'text-2xl' : 'text-xl'}`}>
                  {entry.reporterName}
                </h3>
                
                <div className="mt-4 flex items-center gap-4 text-center divide-x divide-border">
                  <div className="px-3">
                    <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider text-[10px]">Reports</p>
                    <p className={`font-black ${isFirst ? 'text-3xl text-primary' : 'text-2xl text-foreground'}`}>
                      {entry.reportCount}
                    </p>
                  </div>
                  <div className="px-3">
                    <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider text-[10px]">Resolved</p>
                    <p className="font-bold text-xl text-green-600">
                      {entry.resolvedCount}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List for the rest */}
      {rest.length > 0 && (
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6">Citizen Name</div>
            <div className="col-span-2 text-center">Reports</div>
            <div className="col-span-2 text-center">Resolved</div>
          </div>
          <div className="divide-y divide-border">
            {rest.map((entry, index) => (
              <motion.div 
                key={entry.rank}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + (index * 0.05) }}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors"
              >
                <div className="col-span-2 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                    {entry.rank}
                  </span>
                </div>
                <div className="col-span-6 font-semibold text-foreground">
                  {entry.reporterName}
                </div>
                <div className="col-span-2 text-center font-bold text-slate-700">
                  {entry.reportCount}
                </div>
                <div className="col-span-2 text-center font-bold text-green-600">
                  {entry.resolvedCount}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
