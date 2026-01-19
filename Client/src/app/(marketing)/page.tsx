import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white px-6 py-24 dark:from-gray-900 dark:to-gray-950 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <SparklesIcon className="h-4 w-4" />
            AI-Powered Code Reviews
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Ship better code,{' '}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              faster
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Get instant, AI-powered code reviews on every pull request. Find bugs, security issues,
            and style problems before they reach production.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-lg bg-primary px-8 py-3 font-semibold text-white hover:bg-primary/90 sm:w-auto"
            >
              Start Free Trial
            </Link>
            <Link
              href="/docs"
              className="w-full rounded-lg border border-gray-300 px-8 py-3 font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 sm:w-auto"
            >
              Read the Docs
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            No credit card required • Free tier available forever
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-y bg-white px-6 py-24 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need for better code reviews
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              Built for modern development workflows with enterprise-grade security.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BoltIcon className="h-6 w-6" />}
              title="Instant Reviews"
              description="Get detailed code reviews in seconds, not hours. AI analyzes your changes the moment you push."
            />
            <FeatureCard
              icon={<ShieldIcon className="h-6 w-6" />}
              title="Security First"
              description="Detect security vulnerabilities, SQL injection, XSS, and more before they become problems."
            />
            <FeatureCard
              icon={<KeyIcon className="h-6 w-6" />}
              title="Bring Your Own Key"
              description="Use your own API keys for 67% cost savings. Full control over AI provider and model selection."
            />
            <FeatureCard
              icon={<LockIcon className="h-6 w-6" />}
              title="Zero Retention"
              description="Your code is never stored after review. Processing happens in memory only."
            />
            <FeatureCard
              icon={<CodeIcon className="h-6 w-6" />}
              title="Multi-Platform"
              description="Works with GitHub, GitLab, Bitbucket, and Azure DevOps. One tool for all your repos."
            />
            <FeatureCard
              icon={<SettingsIcon className="h-6 w-6" />}
              title="Fully Configurable"
              description="Customize review rules with .codereview.yaml. Set guidelines, exclude paths, and more."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              Get started in minutes with our simple setup process.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Step
              number="1"
              title="Connect Your Repo"
              description="Install the GitHub App on your repositories. We'll automatically receive webhook events."
            />
            <Step
              number="2"
              title="Configure Reviews"
              description="Add a .codereview.yaml file to customize how reviews work for your project."
            />
            <Step
              number="3"
              title="Get AI Reviews"
              description="Every pull request gets an instant, detailed review with actionable feedback."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Ready to improve your code quality?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            Join thousands of developers who use CodeReview AI to ship better code.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex rounded-lg bg-white px-8 py-3 font-semibold text-primary hover:bg-gray-100"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-gray-50/50 p-6 dark:bg-gray-900/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
        {number}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

// Icons
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
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

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
