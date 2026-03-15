import { Link, useLocation } from "wouter";
import { Building2, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("admin_token"));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAdmin(false);
    setLocation("/");
  };

  const navLinks = [
    { href: "/community", label: "Community Feed" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                FixMy<span className="text-primary">City</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === "/admin/dashboard" ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  Admin Dashboard
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4 border-l border-border pl-6">
              {!isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Admin Login
                </Link>
              )}
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              )}
              <Button asChild className="rounded-full shadow-md shadow-primary/20" size="sm">
                <Link href="/report">Report Issue</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white py-4 px-4 shadow-lg absolute w-full left-0">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-foreground py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="text-base font-medium text-foreground py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="h-px bg-border w-full my-2" />
              {!isAdmin ? (
                <Link
                  href="/admin"
                  className="text-base font-medium text-muted-foreground py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Login
                </Link>
              ) : (
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="text-base font-medium text-muted-foreground py-2 text-left"
                >
                  Logout
                </button>
              )}
              <Button asChild className="w-full mt-2" size="lg">
                <Link href="/report" onClick={() => setIsMobileMenuOpen(false)}>
                  Report Issue
                </Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-border py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight text-foreground">
              FixMyCity
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            Empowering citizens to build better infrastructure, together.
          </p>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FixMyCity. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
