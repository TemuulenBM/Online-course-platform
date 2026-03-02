'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Copy,
  Upload,
  Loader2,
  Building2,
  CreditCard,
  AlertCircle,
  FileImage,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '@ocp/shared-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUploadProof } from '@/hooks/api';

/** Банкны дансны мэдээлэл — системийн тохиргооноос авах хүртэл */
const BANK_INFO = {
  bankName: 'Хаан Банк',
  accountNumber: '5100123456',
  accountName: 'Learnify LLC',
} as const;

type ModalStep = 'bank-info' | 'upload' | 'success';

interface CoursePaymentModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  courseTitle: string;
}

/** Төлбөрийн modal — 3 алхам: банкны мэдээлэл → баримт upload → амжилт */
export function CoursePaymentModal({ open, onClose, order, courseTitle }: CoursePaymentModalProps) {
  const [step, setStep] = useState<ModalStep>('bank-info');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadProofMutation = useUploadProof();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} хуулагдлаа`));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = () => {
    if (!order || !selectedFile) return;
    uploadProofMutation.mutate(
      { id: order.id, file: selectedFile },
      {
        onSuccess: () => {
          setStep('success');
        },
        onError: () => {
          toast.error('Баримт upload хийхэд алдаа гарлаа. Дахин оролдоно уу.');
        },
      },
    );
  };

  const handleClose = () => {
    setStep('bank-info');
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  if (!order) return null;

  const amount = order.amount.toLocaleString();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {/* ── Алхам 1: Банкны мэдээлэл ── */}
        {step === 'bank-info' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="size-5 text-primary" />
                Захиалга үүслээ
              </DialogTitle>
            </DialogHeader>

            {/* Захиалгын мэдээлэл */}
            <div className="bg-primary/5 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Сургалт</span>
                <span className="font-semibold text-right max-w-[60%] line-clamp-1">
                  {courseTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Захиалгын дугаар</span>
                <button
                  className="font-mono text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                  onClick={() => handleCopy(order.id, 'Захиалгын дугаар')}
                >
                  #{order.id.slice(0, 8).toUpperCase()}
                  <Copy className="size-3" />
                </button>
              </div>
              <div className="flex justify-between border-t border-primary/10 pt-2 mt-2">
                <span className="text-slate-500 font-medium">Нийт дүн</span>
                <span className="text-xl font-black text-primary">{amount}₮</span>
              </div>
            </div>

            {/* Банкны мэдээлэл */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Building2 className="size-4 text-primary" />
                Банкны шилжүүлгийн мэдээлэл
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {[
                  { label: 'Банк', value: BANK_INFO.bankName },
                  { label: 'Дансны дугаар', value: BANK_INFO.accountNumber, copyable: true },
                  { label: 'Хүлээн авагч', value: BANK_INFO.accountName },
                  {
                    label: 'Гүйлгээний утга',
                    value: order.id.slice(0, 8).toUpperCase(),
                    copyable: true,
                  },
                ].map(({ label, value, copyable }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-slate-500">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{value}</span>
                      {copyable && (
                        <button
                          onClick={() => handleCopy(value, label)}
                          className="text-slate-400 hover:text-primary transition-colors"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>
                  Гүйлгээний утганд заасан дугаарыг заавал оруулна уу. Оруулаагүй тохиолдолд төлбөр
                  баталгаажихгүй.
                </span>
              </div>
            </div>

            {/* Товчнууд */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Хаах
              </button>
              <button
                onClick={() => setStep('upload')}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="size-4" />
                Баримт оруулах
              </button>
            </div>
          </>
        )}

        {/* ── Алхам 2: Баримт upload ── */}
        {step === 'upload' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <FileImage className="size-5 text-primary" />
                Төлбөрийн баримт оруулах
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm text-slate-500">
              Банкны гүйлгээний баримтын зургийг оруулна уу. PNG, JPG, PDF форматтай файл зөвшөөрнө.
            </p>

            {/* File drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
              />
              {previewUrl ? (
                <div className="space-y-2">
                  <img
                    src={previewUrl}
                    alt="Баримтын урдчилсан харагдац"
                    className="max-h-40 mx-auto rounded-lg object-contain"
                  />
                  <p className="text-xs text-slate-500">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileImage className="size-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Файл сонгохын тулд дарна уу
                  </p>
                  <p className="text-xs text-slate-400">PNG, JPG, PDF (макс 10MB)</p>
                </div>
              )}
            </div>

            {/* Товчнууд */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('bank-info')}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Буцах
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploadProofMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {uploadProofMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Илгээж байна...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    Илгээх
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* ── Алхам 3: Амжилт ── */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-5">
            <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto">
              <CheckCircle className="size-9 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Баримт амжилттай илгээгдлээ!</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Таны төлбөрийн баримт хүлээн авагдлаа. Админ баталгаажуулсны дараа сургалт нээгдэнэ.
                Энэ нь ихэвчлэн 1–24 цагийн дотор хийгддэг.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Хаах
              </button>
              <Link href="/orders" className="flex-1">
                <button className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
                  Захиалгууд харах
                </button>
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
