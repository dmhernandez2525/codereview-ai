import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out CodeReview AI',
    features: [
      '3 repositories',
      '50 reviews/month',
      'GPT-3.5 Turbo only',
      'Basic code analysis',
      'Email support',
    ],
    cta: 'Get Started',
    href: '/register',
    popular: false,
  },
  {
    name: 'BYOK',
    price: '$10',
    period: 'per developer/month',
    description: 'Use your own API keys for full control',
    features: [
      'Unlimited repositories',
      'Unlimited reviews',
      'Your own OpenAI/Claude/Gemini keys',
      '67% cost savings vs managed',
      'Advanced security analysis',
      'Custom .codereview.yaml config',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    href: '/register?plan=byok',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$15',
    period: 'per developer/month',
    description: 'Managed AI with no key hassles',
    features: [
      'Everything in BYOK',
      'Managed AI keys included',
      'GPT-4, Claude 3, Gemini Pro',
      '$50/month API credits included',
      'Usage analytics dashboard',
      'Slack integration',
      '24/7 support',
    ],
    cta: 'Start Free Trial',
    href: '/register?plan=pro',
    popular: false,
  },
  {
    name: 'Team',
    price: '$24',
    period: 'per developer/month',
    description: 'For growing development teams',
    features: [
      'Everything in Pro',
      'Team management',
      'Organization-wide settings',
      'SSO (SAML/OIDC)',
      'Audit logs',
      'Custom review rules',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    href: '/contact?plan=team',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Start for free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                  : 'border-gray-200 dark:border-gray-800'
              } p-6`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">/{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <CheckIcon className="h-5 w-5 shrink-0 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 block w-full rounded-lg py-2.5 text-center text-sm font-semibold ${
                  plan.popular
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h3 className="text-xl font-semibold">Enterprise</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Custom solutions for large organizations with specific security and compliance
                needs.
              </p>
            </div>
            <Link
              href="/contact?plan=enterprise"
              className="shrink-0 rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary/90"
            >
              Contact Sales
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature>Self-hosted deployment</Feature>
            <Feature>Custom AI models</Feature>
            <Feature>Data residency options</Feature>
            <Feature>SLA guarantees</Feature>
            <Feature>Dedicated success manager</Feature>
            <Feature>Custom integrations</Feature>
            <Feature>Training & onboarding</Feature>
            <Feature>Volume discounts</Feature>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <h2 className="text-center text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <FAQ
              question="What is BYOK?"
              answer="BYOK (Bring Your Own Key) means you use your own API keys from OpenAI, Anthropic, or Google. You pay the AI providers directly, often saving 67% compared to managed pricing."
            />
            <FAQ
              question="Is there a free trial?"
              answer="Yes! All paid plans include a 14-day free trial. No credit card required to start."
            />
            <FAQ
              question="Can I change plans later?"
              answer="Absolutely. You can upgrade, downgrade, or cancel at any time. Changes take effect on your next billing cycle."
            />
            <FAQ
              question="What happens to my data?"
              answer="We follow a zero-retention policy. Your code is processed in memory and never stored after the review is complete."
            />
            <FAQ
              question="Do you support private repositories?"
              answer="Yes, we support private repositories on all plans. Your code stays private and secure."
            />
            <FAQ
              question="What AI models are supported?"
              answer="We support OpenAI (GPT-4, GPT-4 Turbo, GPT-3.5), Anthropic (Claude 3 family), and Google (Gemini Pro)."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckIcon className="h-4 w-4 text-green-500" />
      <span>{children}</span>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="font-semibold">{question}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{answer}</p>
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
