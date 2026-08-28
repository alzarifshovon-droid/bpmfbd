import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/bpmf-logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="BPMF emblem"
              width={48}
              height={48}
              loading="lazy"
              className="h-11 w-11"
            />
            <span className="font-display text-lg font-bold">
              Bangladesh Pharma Microbiologists Foundation
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm text-ink-foreground/70">
            A professional non-profit platform of pharmaceutical microbiologists of Bangladesh,
            established in 2024 to advance sterility assurance, contamination control and
            microbiological excellence across the industry.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-wide uppercase">Quick links</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/70">
            <li>
              <Link to="/about" className="hover:text-primary">
                About us
              </Link>
            </li>
            <li>
              <Link to="/members" className="hover:text-primary">
                Members
              </Link>
            </li>
            <li>
              <Link to="/jobs" className="hover:text-primary">
                Job corner
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-primary">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-primary">
                Apply for membership
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-wide uppercase">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-foreground/70">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> House 12, Road 7, Mirpur
              DOHS, Dhaka 1216, Bangladesh
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" /> +880 1713 656580
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" /> info@bpmf.org.bd
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10 py-5 text-center text-xs text-ink-foreground/60">
        © {new Date().getFullYear()} Bangladesh Pharma Microbiologists Foundation. All rights
        reserved.
      </div>
    </footer>
  );
}
