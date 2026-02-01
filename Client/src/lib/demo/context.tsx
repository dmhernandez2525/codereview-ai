'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

import {
  demoUser,
  demoRepositories,
  demoReviews,
  demoDashboardStats,
  demoRecentReviews,
  getDemoReviewById,
} from './data';

import type { Review, ReviewFull, RepositoryWithStats } from '@/lib/api';
import type { User } from '@/lib/store/slices/authSlice';

interface DemoContextType {
  isDemo: boolean;
  user: User;
  repositories: RepositoryWithStats[];
  reviews: Review[];
  dashboardStats: typeof demoDashboardStats;
  recentReviews: typeof demoRecentReviews;
  getReviewById: (id: number) => ReviewFull | null;
  filterReviews: (status: string, searchQuery: string) => Review[];
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

interface DemoProviderProps {
  children: ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  const [isDemo] = useState(true);

  const filterReviews = useCallback((status: string, searchQuery: string): Review[] => {
    return demoReviews.filter((review) => {
      const matchesStatus = status === 'all' || review.status === status;
      const matchesSearch =
        !searchQuery ||
        review.prTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.repository?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.prNumber.toString().includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, []);

  const exitDemo = useCallback(() => {
    // Navigate to the main site
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  const value: DemoContextType = {
    isDemo,
    user: demoUser,
    repositories: demoRepositories,
    reviews: demoReviews,
    dashboardStats: demoDashboardStats,
    recentReviews: demoRecentReviews,
    getReviewById: getDemoReviewById,
    filterReviews,
    exitDemo,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextType {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

export function useDemoOptional(): DemoContextType | null {
  return useContext(DemoContext);
}
