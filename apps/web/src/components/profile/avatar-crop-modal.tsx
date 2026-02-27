'use client';

import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Loader2, ZoomIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getCroppedImage, type Area } from '@/lib/crop-image';

interface AvatarCropModalProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropDone: (croppedBlob: Blob) => void;
}

/**
 * Аватар зургийг 1:1 харьцаатай crop хийх modal.
 * react-easy-crop + shadcn Dialog ашиглана.
 */
export function AvatarCropModal({ open, imageSrc, onClose, onCropDone }: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  /** Crop хийж parent руу Blob дамжуулах */
  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const blob = await getCroppedImage(imageSrc, croppedAreaPixels);
      onCropDone(blob);
    } catch {
      /* getCroppedImage алдаа — parent дотор toast.error гарна */
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Аватар тохируулах</DialogTitle>
          <DialogDescription>Зургаа чирж эсвэл томруулж тохируулна уу</DialogDescription>
        </DialogHeader>

        {/* Cropper талбар */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-2">
          <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#9c7aff]"
          />
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#f6f5f8] text-slate-600 font-semibold rounded-xl hover:bg-[#9c7aff]/10 hover:text-[#9c7aff] transition-all disabled:opacity-50"
          >
            Цуцлах
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !croppedAreaPixels}
            className="px-8 py-2.5 bg-[#9c7aff] text-white font-bold rounded-xl shadow-lg shadow-[#9c7aff]/25 hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Хадгалах
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
