'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ApiKey {
  id: number;
  provider: 'openai' | 'anthropic' | 'gemini';
  keyHint: string;
  isValid: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

// Mock data
const mockApiKeys: ApiKey[] = [
  {
    id: 1,
    provider: 'openai',
    keyHint: '****Xk4m',
    isValid: true,
    lastUsedAt: '2024-01-18T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', prefix: 'sk-', description: 'GPT-4, GPT-4 Turbo, GPT-3.5' },
  {
    value: 'anthropic',
    label: 'Anthropic',
    prefix: 'sk-ant-',
    description: 'Claude 3, Claude 2, Claude Instant',
  },
  {
    value: 'gemini',
    label: 'Google AI',
    prefix: 'AIza',
    description: 'Gemini Pro, Gemini Ultra',
  },
] as const;

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newKey, setNewKey] = useState({ provider: 'openai', apiKey: '' });
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationResult(null);

    // TODO: Implement actual API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock validation
    if (newKey.apiKey.length < 20) {
      setValidationResult({ valid: false, error: 'API key appears to be too short' });
      setIsLoading(false);
      return;
    }

    // Mock success
    const newApiKey: ApiKey = {
      id: Date.now(),
      provider: newKey.provider as 'openai' | 'anthropic' | 'gemini',
      keyHint: `****${newKey.apiKey.slice(-4)}`,
      isValid: true,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
    };

    setApiKeys([...apiKeys, newApiKey]);
    setNewKey({ provider: 'openai', apiKey: '' });
    setIsDialogOpen(false);
    setIsLoading(false);
  };

  const handleDeleteKey = (id: number) => {
    // TODO: Implement actual API call
    setApiKeys(apiKeys.filter((key) => key.id !== id));
  };

  const handleTestKey = (id: number) => {
    // TODO: Implement actual API call
    void id; // Placeholder for future async implementation
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return 'Never';
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return <OpenAIIcon className="h-5 w-5" />;
      case 'anthropic':
        return <AnthropicIcon className="h-5 w-5" />;
      case 'gemini':
        return <GeminiIcon className="h-5 w-5" />;
      default:
        return <KeyIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      {/* Settings Navigation */}
      <div className="flex gap-2 border-b pb-4">
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            Profile
          </Button>
        </Link>
        <Link href="/settings/api-keys">
          <Button variant="secondary" size="sm">
            API Keys
          </Button>
        </Link>
        <Link href="/settings/notifications">
          <Button variant="ghost" size="sm">
            Notifications
          </Button>
        </Link>
      </div>

      {/* API Keys Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your AI provider API keys. Your keys are encrypted and stored securely.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add API Key</DialogTitle>
                <DialogDescription>
                  Add a new API key for an AI provider. Your key will be encrypted and stored
                  securely.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => void handleAddKey(e)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <select
                    id="provider"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={newKey.provider}
                    onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                  >
                    {PROVIDERS.map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label} - {provider.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={newKey.apiKey}
                    onChange={(e) => setNewKey({ ...newKey, apiKey: e.target.value })}
                    placeholder={`Enter your ${PROVIDERS.find((p) => p.value === newKey.provider)?.label} API key`}
                  />
                  <p className="text-sm text-muted-foreground">
                    Keys typically start with &quot;
                    {PROVIDERS.find((p) => p.value === newKey.provider)?.prefix}&quot;
                  </p>
                </div>
                {validationResult && !validationResult.valid && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {validationResult.error}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || !newKey.apiKey}>
                    {isLoading ? 'Validating...' : 'Add Key'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="py-8 text-center">
              <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No API keys</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add an API key to start using AI-powered code reviews.
              </p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                Add Your First API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      {getProviderIcon(key.provider)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">{key.provider}</p>
                        <StatusBadge valid={key.isValid} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {key.keyHint} • Last used {formatDate(key.lastUsedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleTestKey(key.id)}>
                      Test
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* BYOK Info */}
      <Card>
        <CardHeader>
          <CardTitle>Bring Your Own Key (BYOK)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            With BYOK, you use your own API keys for AI providers, giving you full control over
            costs and usage. Your keys are:
          </p>
          <ul className="list-inside list-disc space-y-2 text-muted-foreground">
            <li>
              <strong>Encrypted at rest</strong> using AES-256-GCM encryption
            </li>
            <li>
              <strong>Never logged</strong> - only the last 4 characters are stored for reference
            </li>
            <li>
              <strong>Transmitted securely</strong> over HTTPS with TLS 1.3
            </li>
            <li>
              <strong>Revocable</strong> - delete your key anytime to revoke access
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Need help getting an API key?{' '}
            <a href="/docs/api-keys" className="text-primary underline">
              Read our guide
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Components
function StatusBadge({ valid }: { valid: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        valid
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      }`}
    >
      {valid ? 'Valid' : 'Invalid'}
    </span>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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

function OpenAIIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function AnthropicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.304 3.541h-3.672l6.696 16.918h3.672l-6.696-16.918zm-10.608 0L0 20.459h3.744l1.368-3.6h7.056l1.368 3.6h3.744l-6.696-16.918h-3.888zm.456 10.08l2.448-6.456 2.448 6.456H7.152z" />
    </svg>
  );
}

function GeminiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 21.818c-5.422 0-9.818-4.396-9.818-9.818S6.578 2.182 12 2.182 21.818 6.578 21.818 12 17.422 21.818 12 21.818z" />
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}
