import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Menu, X, Search, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import logo from "@/assets/bpmf-logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type NavItem = { label: string; to: string };

const publicNav: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Members", to: "/members" },
  { label: "Job Corner", to: "/jobs" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contacts", to: "/contact" },
  { label: "Quiz Games", to: "/quiz-games" },
  { label: "Pathological Tests", to: "/pathological-tests" },
  { label: "Medicine Info", to: "/medicine-information" },
];

const memberNav: NavItem[] = [
  { label: "Training Logs", to: "/training-logs" },
  { label: "Events", to: "/events" },
  { label: "Fees", to: "/fees" },
];

export function SiteHeader() {
  const { user, isPaidMember, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const items = [...publicNav, ...(isPaidMember ? memberNav : [])];

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 shadow-card">
      <div className="bg-background">
        <div className="container-page flex items-center justify-between gap-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="BPMF emblem" width={56} height={56} className="h-12 w-12" />
            <span className="font-display text-base leading-tight font-bold sm:text-xl">
              Bangladesh Pharma <span className="text-primary">Microbiologists</span> Foundation
            </span>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard">
                    <LayoutDashboard /> My Portal
                  </Link>
                </Button>
                {isAdmin && (
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/admin">
                      <ShieldCheck /> Admin
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut /> Sign out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Apply for membership</Link>
                </Button>
              </>
            )}
          </div>
          <button
            className="rounded-md p-2 text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <nav className="gradient-brand">
        <div className="container-page hidden items-center justify-between md:flex">
          <ul className="flex flex-wrap">
            {items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="block px-4 py-4 text-sm font-semibold tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary-dark"
                  activeProps={{ className: "bg-primary-dark" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/jobs"
            aria-label="Search job corner"
            className="px-3 py-4 text-primary-foreground/90 transition-colors hover:text-primary-foreground"
          >
            <Search className="size-4" />
          </Link>
        </div>

        {open && (
          <ul className="container-page flex flex-col pb-3 md:hidden">
            {items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block border-b border-primary-foreground/15 py-3 text-sm font-semibold tracking-wide text-primary-foreground uppercase"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="flex flex-wrap gap-2 pt-3">
              {user ? (
                <>
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      My Portal
                    </Link>
                  </Button>
                  {isAdmin && (
                    <Button asChild size="sm" variant="secondary">
                      <Link to="/admin" onClick={() => setOpen(false)}>
                        Admin
                      </Link>
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={signOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/auth" onClick={() => setOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/register" onClick={() => setOpen(false)}>
                      Apply for membership
                    </Link>
                  </Button>
                </>
              )}
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
