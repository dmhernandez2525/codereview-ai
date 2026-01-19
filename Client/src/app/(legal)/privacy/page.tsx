export const metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="lead">Last updated: January 2024</p>

      <p>
        CodeReview AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
        protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard
        your information when you use our service.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>Account Information</h3>
      <p>When you create an account, we collect:</p>
      <ul>
        <li>Email address</li>
        <li>Name (optional)</li>
        <li>Password (hashed and salted)</li>
        <li>OAuth tokens for connected platforms (encrypted)</li>
      </ul>

      <h3>Usage Data</h3>
      <p>We collect anonymized usage data including:</p>
      <ul>
        <li>Number of reviews processed</li>
        <li>Token usage statistics</li>
        <li>Feature usage patterns</li>
        <li>Error logs (without code content)</li>
      </ul>

      <h3>Code Data</h3>
      <p>
        <strong>We do not store your code.</strong> Code is processed in memory only during review
        and is never persisted to our databases. This is our zero-retention architecture.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>We use collected information to:</p>
      <ul>
        <li>Provide and maintain our service</li>
        <li>Process code reviews</li>
        <li>Send service-related communications</li>
        <li>Improve our AI models and service quality</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. Data Security</h2>
      <p>We implement industry-standard security measures:</p>
      <ul>
        <li>AES-256 encryption for API keys at rest</li>
        <li>TLS 1.3 for all data in transit</li>
        <li>SOC 2 Type II compliance (in progress)</li>
        <li>Regular security audits</li>
        <li>Zero-retention architecture for code</li>
      </ul>

      <h2>4. Third-Party Services</h2>
      <p>We use the following third-party services:</p>
      <ul>
        <li>
          <strong>AI Providers</strong> (OpenAI, Anthropic, Google): To process code reviews. When
          you use BYOK, your code goes directly to these providers.
        </li>
        <li>
          <strong>Git Platforms</strong> (GitHub, GitLab, etc.): To access repository data and post
          review comments.
        </li>
        <li>
          <strong>Infrastructure</strong>: Cloud hosting providers for running our service.
        </li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>We retain data as follows:</p>
      <ul>
        <li>
          <strong>Code:</strong> Never stored (zero-retention)
        </li>
        <li>
          <strong>Review metadata:</strong> 90 days, then anonymized
        </li>
        <li>
          <strong>Account data:</strong> Until account deletion
        </li>
        <li>
          <strong>Audit logs:</strong> 1 year
        </li>
      </ul>

      <h2>6. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Request data deletion</li>
        <li>Export your data</li>
        <li>Opt-out of non-essential communications</li>
        <li>Revoke connected platform access</li>
      </ul>

      <h2>7. GDPR Compliance</h2>
      <p>
        For users in the European Economic Area, we comply with GDPR requirements. Our legal basis
        for processing is contract performance and legitimate interest.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        For privacy-related inquiries, contact us at:{' '}
        <a href="mailto:privacy@codereview.ai">privacy@codereview.ai</a>
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this policy periodically. We will notify you of significant changes via email
        or through the service.
      </p>
    </article>
  );
}
