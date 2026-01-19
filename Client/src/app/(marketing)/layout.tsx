import Link from 'next/link';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <CodeIcon className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">CodeReview AI</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Docs
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <CodeIcon className="h-6 w-6 text-primary" />
                <span className="font-bold">CodeReview AI</span>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                AI-powered code reviews for modern development teams.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Product</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/features" className="hover:text-primary">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/about" className="hover:text-primary">About</Link></li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-primary">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} CodeReview AI. All rights reserved.
          </div>
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
