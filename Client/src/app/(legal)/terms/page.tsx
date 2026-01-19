export const metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <h1>Terms of Service</h1>
      <p className="lead">Last updated: January 2024</p>

      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of CodeReview AI
        (&quot;Service&quot;). By using our Service, you agree to these Terms.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using CodeReview AI, you agree to be bound by these Terms and our Privacy
        Policy. If you do not agree, do not use the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        CodeReview AI provides AI-powered code review services for software development teams. The
        Service analyzes pull requests and provides feedback using artificial intelligence.
      </p>

      <h2>3. Account Registration</h2>
      <p>To use the Service, you must:</p>
      <ul>
        <li>Create an account with accurate information</li>
        <li>Be at least 18 years old or have parental consent</li>
        <li>Maintain the security of your account credentials</li>
        <li>Accept responsibility for all activities under your account</li>
      </ul>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any illegal purpose</li>
        <li>Attempt to reverse engineer or extract AI models</li>
        <li>Submit malicious code designed to attack our systems</li>
        <li>Share your account with unauthorized users</li>
        <li>Exceed rate limits or abuse the Service</li>
        <li>Resell or redistribute the Service without authorization</li>
      </ul>

      <h2>5. API Keys (BYOK)</h2>
      <p>If you use your own API keys (Bring Your Own Key):</p>
      <ul>
        <li>You are responsible for any charges from AI providers</li>
        <li>We encrypt and securely store your keys</li>
        <li>You may revoke access at any time by deleting your keys</li>
        <li>We are not liable for issues caused by invalid or revoked keys</li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>
        <strong>Your Code:</strong> You retain all rights to your code. We do not claim any
        ownership of code processed through our Service.
      </p>
      <p>
        <strong>Our Service:</strong> CodeReview AI and its technology are owned by us. You may not
        copy, modify, or distribute our Service without permission.
      </p>

      <h2>7. Payment and Billing</h2>
      <p>For paid plans:</p>
      <ul>
        <li>Billing is monthly or annual, based on your selection</li>
        <li>Prices are subject to change with 30 days notice</li>
        <li>Refunds are available within 14 days of initial purchase</li>
        <li>You may cancel at any time; access continues until period end</li>
      </ul>

      <h2>8. Service Availability</h2>
      <p>
        We strive for 99.9% uptime but do not guarantee uninterrupted service. We may suspend
        service for maintenance with reasonable notice.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, CODEREVIEW AI IS PROVIDED &quot;AS IS&quot;. WE ARE
        NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES. OUR TOTAL
        LIABILITY IS LIMITED TO FEES PAID IN THE LAST 12 MONTHS.
      </p>

      <h2>10. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless CodeReview AI from any claims arising from your use
        of the Service or violation of these Terms.
      </p>

      <h2>11. Termination</h2>
      <p>
        We may terminate your account for violation of these Terms. You may terminate your account
        at any time through your account settings.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        We may modify these Terms at any time. Continued use after changes constitutes acceptance.
        Material changes will be communicated via email.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms are governed by the laws of Delaware, United States. Disputes will be resolved
        in the courts of Delaware.
      </p>

      <h2>14. Contact</h2>
      <p>
        For questions about these Terms, contact us at:{' '}
        <a href="mailto:legal@codereview.ai">legal@codereview.ai</a>
      </p>
    </article>
  );
}
