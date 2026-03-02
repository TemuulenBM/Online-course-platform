'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Lesson, CreateLiveSessionData } from '@ocp/shared-types';

interface CreateSessionDialogProps {
  /** Dropdown-д харуулах хичээлүүд */
  lessons: Lesson[];
  /** Хадгалахад дуудагдана */
  onSubmit: (data: CreateLiveSessionData) => void;
  /** Mutation pending эсэх */
  isPending?: boolean;
}

/**
 * Шинэ session товлох / засах dialog.
 */
export function CreateSessionDialog({ lessons, onSubmit, isPending }: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [lessonId, setLessonId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');

  const liveLessons = lessons.filter((l) => l.lessonType === 'live');

  const resetForm = () => {
    setLessonId('');
    setTitle('');
    setDescription('');
    setScheduledStart('');
    setScheduledEnd('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonId || !title || !scheduledStart || !scheduledEnd) return;

    onSubmit({
      lessonId,
      title,
      description: description || undefined,
      scheduledStart: new Date(scheduledStart).toISOString(),
      scheduledEnd: new Date(scheduledEnd).toISOString(),
    });

    resetForm();
    setOpen(false);
  };

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
          <DialogTitle>Шинэ шууд хичээл товлох</DialogTitle>
          <DialogDescription>Хичээлийн мэдээлэл болон цагийг оруулна уу.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Хичээл сонгох */}
          <div className="space-y-2">
            <Label htmlFor="lessonId">Хичээл</Label>
            <Select value={lessonId} onValueChange={setLessonId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Хичээл сонгох..." />
              </SelectTrigger>
              <SelectContent>
                {liveLessons.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    LIVE төрлийн хичээл олдсонгүй
                  </SelectItem>
                ) : (
                  liveLessons.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Гарчиг */}
          <div className="space-y-2">
            <Label htmlFor="title">Гарчиг</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Жишээ: Мэдээллийн технологийн үндэс - Lab 04"
              required
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

          {/* Эхлэх цаг */}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Цуцлах
            </Button>
            <Button type="submit" disabled={isPending} className="bg-primary font-bold">
              {isPending ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
