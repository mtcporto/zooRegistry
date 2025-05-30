
import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';
import { Button } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';
import Link from 'next/link';

interface AppLayoutProps {
  children: ReactNode; // This is the page content from (e.g.) app/page.tsx
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      {/* The actual Sidebar component that acts as a peer */}
      <Sidebar> {/* This is from @/components/ui/sidebar */}
        <SidebarHeader className="p-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 h-10 w-10">
              <PawPrint className="h-7 w-7" />
            </Button>
            <h1 className="text-xl font-semibold text-primary">Zoo Registry</h1>
          </Link>
          <SidebarTrigger className="ml-auto md:hidden" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4">
          {/* Footer content if any */}
        </SidebarFooter>
      </Sidebar>

      {/* The main content area, which is styled based on the Sidebar peer */}
      <SidebarInset>
        {children} {/* This is where the actual page content goes */}
      </SidebarInset>
    </SidebarProvider>
  );
}
