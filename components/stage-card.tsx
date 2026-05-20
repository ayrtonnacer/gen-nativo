'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Type as type, LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StageCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  count: number;
  color: string;
  href: string;
}

export function StageCard({ title, description, icon: Icon, count, color, href }: StageCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <Badge variant="secondary" className="text-lg font-semibold">
            {count}
          </Badge>
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" className="w-full">
          <Link href={href}>
            Ver lotes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
