
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  actionButton?: {
    href: string;
    label: string;
    icon?: ReactNode;
  };
}

export function PageHeader({ title, description, actionButton }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
      {actionButton && (
        <Link href={actionButton.href} passHref className="mt-4 md:mt-0">
          <Button variant="default">
            {actionButton.icon || <PlusCircle className="mr-2 h-4 w-4" />}
            {actionButton.label}
          </Button>
        </Link>
      )}
    </div>
  );
}
