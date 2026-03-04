'use client';

import { useState } from 'react';
import { Calendar, PlusCircle, Video } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateLiveSessionData } from '@ocp/shared-types';

interface CreateSessionDialogProps {
  /** Сургалтын ID */
  courseId: string;
  /** Товлосон хичээл хадгалах */
  onSubmit: (data: CreateLiveSessionData) => void;
  /** Шууд эхлүүлэх (create + start) */
  onStartNow: (title: string, description?: string) => void;
  /** Хичээл үүсгэж байгаа эсэх */
  isPending?: boolean;
  /** Шууд эхлүүлж байгаа эсэх */
  isStartingNow?: boolean;
}

type Mode = 'now' | 'schedule';

/**
 * Шинэ session үүсгэх dialog.
 * "Шууд эхлүүлэх" горимд зөвхөн гарчиг шаардлагатай.
 * "Товлох" горимд эхлэх/дуусах цаг бас шаардлагатай.
 */
export function CreateSessionDialog({
  courseId: _courseId,
  onSubmit,
  onStartNow,
  isPending,
  isStartingNow,
}: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('now');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setScheduledStart('');
    setScheduledEnd('');
    setMode('now');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (mode === 'now') {
      onStartNow(title, description || undefined);
    } else {
      if (!scheduledStart || !scheduledEnd) return;
      onSubmit({
        courseId: _courseId,
        title,
        description: description || undefined,
        scheduledStart: new Date(scheduledStart).toISOString(),
        scheduledEnd: new Date(scheduledEnd).toISOString(),
      });
    }

    resetForm();
    setOpen(false);
  };

  const loading = mode === 'now' ? isStartingNow : isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl bg-primary font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40">
          <PlusCircle className="size-5" />
          Шинэ хичээл үүсгэх
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Шинэ шууд хичээл</DialogTitle>
          <DialogDescription>
            Хичээлийг яг одоо эхлүүлэх эсвэл ирээдүйд товлоно уу.
          </DialogDescription>
        </DialogHeader>

        {/* Горим сонголт */}
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-1">
          <button
            type="button"
            onClick={() => setMode('now')}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              mode === 'now'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Video className="size-4" />
            Шууд эхлүүлэх
          </button>
          <button
            type="button"
            onClick={() => setMode('schedule')}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              mode === 'schedule'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="size-4" />
            Товлох
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Гарчиг */}
          <div className="space-y-2">
            <Label htmlFor="title">Гарчиг</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Жишээ: Lab 01 — Оршил"
              required
              autoFocus
            />
          </div>

          {/* Тайлбар */}
          <div className="space-y-2">
            <Label htmlFor="description">Тайлбар (заавал биш)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Хичээлийн товч тайлбар..."
            />
          </div>

          {/* Товлох горимд л цаг харуулна */}
          {mode === 'schedule' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Эхлэх цаг</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={scheduledStart}
                  onChange={(e) => setScheduledStart(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Дуусах цаг</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={scheduledEnd}
                  onChange={(e) => setScheduledEnd(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Цуцлах
            </Button>
            <Button type="submit" disabled={!!loading} className="bg-primary font-bold">
              {loading
                ? mode === 'now'
                  ? 'Эхлүүлж байна...'
                  : 'Хадгалж байна...'
                : mode === 'now'
                  ? 'Эхлүүлэх'
                  : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
