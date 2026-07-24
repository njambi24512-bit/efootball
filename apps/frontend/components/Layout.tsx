import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Menu, ShieldCheck, X } from 'lucide-react';

const links = [
  { href: '/', label: 'Home', exact: true },
  { href: '/chat', label: 'Chat' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/news', label: 'News' }
];

function NavItem({ href, label, exact, onClick }: { href: string; label: string; exact?: boolean; onClick?: () => void }) {
  const router = useRouter();
  const isActive = exact ? router.pathname === href : router.pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-3 py-2 text-sm font-semibold uppercase tracking-wider2 transition-colors ${
        isActive ? 'text-floodlight' : 'text-slate-card hover:text-chalk'
      }`}
    >
      {label}
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-pitch-lighter bg-pitch/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-turf bg-turf/20">
              <span className="h-2.5 w-2.5 rounded-full bg-floodlight" />
            </span>
            <span className="font-display text-2xl tracking-wider2 leading-none">
              MATCH<span className="text-turf">DAY</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavItem key={link.href} href={link.href} label={link.label} exact={link.exact} />
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/verify" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider2 text-slate-card hover:text-chalk">
              <ShieldCheck size={15} className="text-turf" />
              Verify ID
            </Link>
            <Link href="/profile" className="flex items-center gap-2 rounded-full border border-pitch-lighter bg-pitch-lighter py-1 pl-1 pr-3 transition-colors hover:border-turf">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-turf-dark font-mono text-xs font-bold text-chalk">
                8.8
              </span>
              <span className="text-sm font-medium">Matchday</span>
            </Link>
          </div>

          <button className="text-chalk md:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="flex flex-col gap-1 border-t border-pitch-lighter px-4 py-3 md:hidden">
            {links.map((link) => (
              <NavItem key={link.href} href={link.href} label={link.label} exact={link.exact} onClick={() => setOpen(false)} />
            ))}
            <NavItem href="/verify" label="Verify ID" onClick={() => setOpen(false)} />
            <NavItem href="/profile" label="Profile" onClick={() => setOpen(false)} />
          </div>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">{children}</main>

      <footer className="mt-12 border-t border-pitch-lighter py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-card sm:flex-row sm:px-6">
          <span>Matchday is a fan-made community platform — not affiliated with Konami.</span>
          <span>© 2026 Matchday</span>
        </div>
      </footer>
    </div>
  );
}
