export default function FeaturesPage() {
  return (
    <div className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Features</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Powerful AI-driven code review capabilities built for modern development teams.
          </p>
        </div>

        {/* Feature Sections */}
        <div className="mt-24 space-y-24">
          {/* AI-Powered Reviews */}
          <FeatureSection
            badge="Core Feature"
            title="AI-Powered Code Reviews"
            description="Get intelligent, context-aware feedback on every pull request. Our AI understands your codebase and provides actionable suggestions."
            features={[
              'Automatic review on every PR',
              'Context-aware analysis',
              'Severity-based categorization',
              'Suggested fixes with code snippets',
              'Performance optimization tips',
              'Best practices enforcement',
            ]}
            imageAlt="AI review interface"
          />

          {/* Security Analysis */}
          <FeatureSection
            badge="Security"
            title="Security-First Analysis"
            description="Detect vulnerabilities before they reach production. Our security scanner identifies common attack vectors and potential exploits."
            features={[
              'SQL injection detection',
              'XSS vulnerability scanning',
              'Secrets detection in code',
              'Dependency vulnerability alerts',
              'OWASP Top 10 coverage',
              'Custom security rules',
            ]}
            imageAlt="Security analysis dashboard"
            reversed
          />

          {/* BYOK */}
          <FeatureSection
            badge="Cost Savings"
            title="Bring Your Own Key (BYOK)"
            description="Use your own API keys for OpenAI, Anthropic, or Google AI. Save 67% compared to managed AI services while maintaining full control."
            features={[
              'Support for OpenAI, Claude, Gemini',
              'AES-256 encrypted key storage',
              'Pay AI providers directly',
              'No markup on API costs',
              'Key usage tracking',
              'Automatic key validation',
            ]}
            imageAlt="BYOK configuration"
          />

          {/* Configuration */}
          <FeatureSection
            badge="Customization"
            title="Flexible Configuration"
            description="Customize every aspect of your code reviews with .codereview.yaml. Set project-specific rules and guidelines."
            features={[
              'YAML-based configuration',
              'Path-specific instructions',
              'Custom review guidelines',
              'Exclude patterns for ignored paths',
              'Multiple review profiles',
              'Inheritance from org settings',
            ]}
            imageAlt="Configuration editor"
            reversed
          />

          {/* Integrations */}
          <FeatureSection
            badge="Integrations"
            title="Works Where You Work"
            description="Seamlessly integrates with your existing Git workflow. No context switching required."
            features={[
              'GitHub (GitHub.com & Enterprise)',
              'GitLab (SaaS & Self-hosted)',
              'Bitbucket Cloud',
              'Azure DevOps',
              'Slack notifications',
              'Webhook support',
            ]}
            imageAlt="Platform integrations"
          />

          {/* Zero Retention */}
          <FeatureSection
            badge="Privacy"
            title="Zero Code Retention"
            description="Your code is processed in memory only and never stored. We believe your code should stay yours."
            features={[
              'In-memory processing only',
              'No code storage after review',
              'Audit logs without code content',
              'TLS 1.3 encryption in transit',
              'SOC 2 Type II compliance',
              'GDPR compliant',
            ]}
            imageAlt="Security architecture"
            reversed
          />
        </div>
      </div>
    </div>
  );
}

function FeatureSection({
  badge,
  title,
  description,
  features,
  imageAlt,
  reversed = false,
}: {
  badge: string;
  title: string;
  description: string;
  features: string[];
  imageAlt: string;
  reversed?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-12 lg:flex-row lg:items-center ${reversed ? 'lg:flex-row-reverse' : ''}`}>
      <div className="flex-1">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {badge}
        </span>
        <h2 className="mt-4 text-3xl font-bold">{title}</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{description}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          <div className="flex h-full items-center justify-center text-gray-400">
            {imageAlt}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
