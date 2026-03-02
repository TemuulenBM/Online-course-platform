'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * CTA placeholder card — "Таны хичээл байхгүй байна уу?"
 * Grid-ийн хамгийн сүүлд harагдана.
 */
export function CtaCard() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/10 bg-primary/5 p-8 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary">
        <Plus className="size-6" />
      </div>
      <h4 className="mb-2 text-lg font-bold">Таны хичээл байхгүй байна уу?</h4>
      <p className="mb-6 text-sm text-slate-500">
        Өөрийн мэдлэгээ бусадтай хуваалцаж, шууд хичээлээ энд байршуулаарай.
      </p>
      <Button className="rounded-xl bg-primary px-6 font-bold shadow-md">Хүсэлт илгээх</Button>
    </div>
  );
}
