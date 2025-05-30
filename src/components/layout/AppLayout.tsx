
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
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <SidebarHSF>
        <SidebarInset>{children}</SidebarInset>
      </SidebarHSF>
    </SidebarProvider>
  );
}

function SidebarHSF({ children }: { children: ReactNode }) {
  return (
    <Sidebar>
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
  );
}
