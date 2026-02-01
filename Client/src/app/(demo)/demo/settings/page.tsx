'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDemo } from '@/lib/demo';

export default function DemoSettingsPage() {
  const { user } = useDemo();
  const [activeTab, setActiveTab] = useState<'profile' | 'api-keys' | 'notifications' | 'billing'>(
    'profile'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar navigation */}
        <nav className="lg:w-48 flex lg:flex-col gap-1">
          <TabButton
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            icon={UserIcon}
          >
            Profile
          </TabButton>
          <TabButton
            active={activeTab === 'api-keys'}
            onClick={() => setActiveTab('api-keys')}
            icon={KeyIcon}
          >
            API Keys
          </TabButton>
          <TabButton
            active={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
            icon={BellIcon}
          >
            Notifications
          </TabButton>
          <TabButton
            active={activeTab === 'billing'}
            onClick={() => setActiveTab('billing')}
            icon={CreditCardIcon}
          >
            Billing
          </TabButton>
        </nav>

        {/* Content area */}
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileSettings user={user} />}
          {activeTab === 'api-keys' && <ApiKeysSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'billing' && <BillingSettings />}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
  icon: Icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground'
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function ProfileSettings({ user }: { user: { username: string; email: string } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your personal information and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <Button variant="outline" size="sm" disabled>
              Change Avatar
            </Button>
            <p className="text-xs text-muted-foreground mt-1">JPG, GIF or PNG. Max size 2MB.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue={user.username} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user.email} disabled />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            className="w-full min-h-24 px-3 py-2 text-sm rounded-md border bg-background resize-none disabled:opacity-50"
            placeholder="Tell us about yourself..."
            disabled
          />
        </div>

        <div className="flex justify-end">
          <Button disabled>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ApiKeysSettings() {
  const demoApiKeys = [
    {
      id: 1,
      name: 'OpenAI',
      provider: 'openai',
      isConfigured: true,
      lastUsed: '2 hours ago',
    },
    {
      id: 2,
      name: 'Anthropic',
      provider: 'anthropic',
      isConfigured: false,
      lastUsed: null,
    },
    {
      id: 3,
      name: 'Google AI',
      provider: 'google',
      isConfigured: false,
      lastUsed: null,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Provider API Keys</CardTitle>
          <CardDescription>
            Configure your AI provider API keys for code reviews. At least one provider is required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {demoApiKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    key.isConfigured
                      ? 'bg-green-100 dark:bg-green-900'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <ProviderIcon
                    provider={key.provider}
                    className={`h-5 w-5 ${
                      key.isConfigured ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {key.isConfigured ? (
                      <>Configured - Last used {key.lastUsed}</>
                    ) : (
                      'Not configured'
                    )}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                {key.isConfigured ? 'Update' : 'Configure'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Provider</CardTitle>
          <CardDescription>
            Select which AI provider to use by default for new reviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <ProviderIcon
                provider="openai"
                className="h-5 w-5 text-green-600 dark:text-green-400"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">OpenAI (GPT-4o)</p>
              <p className="text-sm text-muted-foreground">
                High-quality code reviews with detailed explanations
              </p>
            </div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const notifications = [
    {
      id: 1,
      title: 'Review Completed',
      description: 'Get notified when an AI review is completed',
      email: true,
      push: true,
    },
    {
      id: 2,
      title: 'Review Failed',
      description: 'Get notified when a review fails',
      email: true,
      push: true,
    },
    {
      id: 3,
      title: 'Weekly Summary',
      description: 'Receive a weekly summary of your code reviews',
      email: true,
      push: false,
    },
    {
      id: 4,
      title: 'New Features',
      description: 'Learn about new features and updates',
      email: false,
      push: false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to be notified about activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-[1fr_80px_80px] gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
            <span>Notification</span>
            <span className="text-center">Email</span>
            <span className="text-center">Push</span>
          </div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="grid grid-cols-[1fr_80px_80px] gap-4 items-center"
            >
              <div>
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.description}</p>
              </div>
              <div className="flex justify-center">
                <ToggleSwitch checked={notification.email} disabled />
              </div>
              <div className="flex justify-center">
                <ToggleSwitch checked={notification.push} disabled />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <Button disabled>Save Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the Free plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div>
              <p className="font-semibold text-lg">Free Plan</p>
              <p className="text-sm text-muted-foreground">100 reviews/month - Basic AI models</p>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
              Current
            </span>
          </div>
          <Button className="w-full mt-4" disabled>
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Track your usage against your plan limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageBar label="Reviews" used={48} limit={100} />
          <UsageBar label="Tokens" used={145000} limit={500000} />
          <UsageBar label="Repositories" used={4} limit={5} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Add a payment method to upgrade your plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>
            <CreditCardIcon className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleSwitch({ checked, disabled }: { checked: boolean; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className={`w-10 h-6 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage > 80;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span
          className={isNearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}
        >
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isNearLimit ? 'bg-amber-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ProviderIcon({ className }: { provider: string; className?: string }) {
  // Simple icon for demo purposes
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

// Icons
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}
