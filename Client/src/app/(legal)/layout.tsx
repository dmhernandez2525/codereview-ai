import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <header className="border-b bg-white dark:bg-gray-950">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <CodeIcon className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">CodeReview AI</span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} CodeReview AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  );
}
