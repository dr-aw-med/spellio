'use client';

import React from 'react';
import { Navigation, NavItem } from './Navigation';
import { cn } from '@/lib/utils';

export interface MainLayoutProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  userRole?: 'parent' | 'child';
  onLogout?: () => void;
  showNavigation?: boolean;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  navItems = [],
  userRole,
  onLogout,
  showNavigation = true,
  className,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showNavigation && (
        <Navigation items={navItems} userRole={userRole} onLogout={onLogout} />
      )}
      <main className={cn('flex-1', className)}>{children}</main>
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Application de Dictée. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;

