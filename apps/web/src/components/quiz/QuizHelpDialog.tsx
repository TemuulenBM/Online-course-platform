'use client';

import { useTranslations } from 'next-intl';
import { Keyboard, BookmarkIcon, Clock, CheckCircle, HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface QuizHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Quiz-ийн тусламжийн dialog — keyboard shortcuts, зааварчилгаа.
 */
export function QuizHelpDialog({ open, onOpenChange }: QuizHelpDialogProps) {
  const t = useTranslations('quiz');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            {t('helpDialogTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Keyboard shortcuts */}
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
              <Keyboard className="size-4 text-primary" />
              Keyboard Shortcuts
            </h4>
            <div className="space-y-2">
              <ShortcutRow keys={['←', '→']} label="Асуулт хооронд шилжих" />
              <ShortcutRow keys={['1', '2', '...']} label="Тухайн асуулт руу шууд очих" />
            </div>
          </div>

          {/* Bookmark */}
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
              <BookmarkIcon className="size-4 text-primary" />
              {t('bookmark')}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Эргэж харах асуултуудыг тэмдэглэж болно. Тэмдэглэсэн асуултууд навигаторт ялгаатай
              өнгөөр харагдана.
            </p>
          </div>

          {/* Timer */}
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
              <Clock className="size-4 text-primary" />
              {t('duration')}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              5 минут үлдэхэд анхааруулга гарна. 1 минут үлдэхэд таймер улаан болно. Хугацаа
              дуусахад шалгалт автоматаар илгээгдэнэ.
            </p>
          </div>

          {/* Зааварчилгаа */}
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
              <CheckCircle className="size-4 text-primary" />
              {t('instructions')}
            </h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {t('instruction1')}
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {t('instruction2')}
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {t('instruction3')}
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Keyboard shortcut мөр */
function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((k) => (
          <Badge key={k} variant="secondary" className="font-mono text-xs px-2">
            {k}
          </Badge>
        ))}
      </div>
    </div>
  );
}
