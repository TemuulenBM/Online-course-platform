'use client';

import { MessageCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface DiscussionEmptyStateProps {
  title: string;
  description?: string;
}

/** Хоосон state — нийтлэл/сэтгэгдэл байхгүй үед */
export function DiscussionEmptyState({ title, description }: DiscussionEmptyStateProps) {
  return <EmptyState icon={MessageCircle} title={title} description={description} />;
}
