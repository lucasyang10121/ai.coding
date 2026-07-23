import Link from 'next/link';

// This component is the top navigation bar for the app.
export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4 text-slate-100">
      <Link href="/" className="text-lg font-semibold">
        Custom Draft Simulator
      </Link>
      <div className="flex gap-4 text-sm">
        <Link href="/lobbies">Lobbies</Link>
        <Link href="/players">Players</Link>
        <Link href="/results/1">Results</Link>
      </div>
    </nav>
  );
}
