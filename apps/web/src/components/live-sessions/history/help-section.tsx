'use client';

import { HelpCircle } from 'lucide-react';

/**
 * "Missing a session?" — хуудасны доод тал.
 */
export function HelpSection() {
  return (
    <div className="mt-12 rounded-3xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center">
      <HelpCircle className="mx-auto mb-3 size-10 text-primary" />
      <p className="font-medium text-slate-600">Хичээл эсвэл бичлэг олдохгүй байна уу?</p>
      <p className="mb-4 text-sm text-slate-500">
        Бичлэг нь шууд хичээл дууссанаас хойш 24 цагийн дотор бэлэн болно.
      </p>
      <button className="text-sm font-bold text-primary hover:text-primary/80">Тусламж авах</button>
    </div>
  );
}
