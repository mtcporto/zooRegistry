'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Rows, Binary, ShieldHalf, Squirrel, Info } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/classes', label: 'Classes', icon: Rows },
  { href: '/ordens', label: 'Ordens', icon: Binary },
  { href: '/familias', label: 'Famílias', icon: ShieldHalf },
  { href: '/animais', label: 'Animais', icon: Squirrel },
  { href: '/cadastros', label: 'Cadastros', icon: Info },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="p-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                className={cn(
                  'w-full justify-start',
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold' : 'hover:bg-sidebar-accent/50'
                )}
                isActive={isActive}
                tooltip={item.label}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="truncate">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
