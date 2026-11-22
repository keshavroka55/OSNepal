import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import { NepalFlag } from '../NepalFlag';
import { ExternalLink } from 'lucide-react';




type FooterLink = {
  label: string;
  path: string;
  external?: boolean;
};
const REPO = 'https://github.com/keshavroka55/OSNepal';

const footerLinks: Record<string, FooterLink[]> = {
  Explore: [
    { label: 'Discover projects', path: '/discover' },
    { label: 'Open source', path: '/open-source' },
    { label: 'Ideas & feedback', path: '/ideas' },
    { label: 'Leaderboard', path: '/leaderboard' },
  ],
  Community: [
    { label: 'People', path: '/people' },
    { label: 'Discussions', path: '/ecosystem' },
    { label: 'Share a project', path: '/create' },
    { label: 'For investors', path: '/register' },
  ],
  Legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' },
  ],

  Project: [
    { label: 'GitHub', path: REPO, external: true },
    { label: 'Contribute', path: `${REPO}/blob/main/CONTRIBUTING.md`, external: true },
    { label: 'Report an issue', path: `${REPO}/issues`, external: true },
    { label: 'Contributors', path: `${REPO}/graphs/contributors`, external: true },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-[1240px] px-4 pt-14 pb-8 sm:px-6 sm:pt-16 lg:px-8">
        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 md:gap-x-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[13px] text-foreground/80 transition-colors hover:text-foreground">
                        {link.label}
                        <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="inline-block text-[13px] text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-6 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-[13px] font-semibold text-foreground">
              Open Source Nepal
            </span>
          </div>


          <p className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
            Made in Nepal <NepalFlag className="h-4 w-auto" /> for builders everywhere.
          </p>
          {/* Copyright */}
          <p className="text-[12px] text-muted-foreground sm:text-right">
            &copy; {new Date().getFullYear()} Open Source Nepal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}