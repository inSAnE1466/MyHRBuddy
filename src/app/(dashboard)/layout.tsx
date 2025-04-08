import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Users, Search, LayoutDashboard, LogOut } from 'lucide-react';

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl text-primary">MyHRBuddy</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
            <Link 
              href="/"
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/applicants"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Users className="mr-2 h-4 w-4" />
              Applicants
            </Link>
            <Link
              href="/search"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Search className="mr-2 h-4 w-4" />
              AI Search
            </Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">
                {session?.user?.email || 'User'}
              </span>
              <form action="/api/auth/signout" method="post">
                <button className="flex items-center text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
                  <LogOut className="mr-1 h-4 w-4" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DashboardLayout;