'use client';

import { useState } from 'react';
import { Plus, Settings, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

import { useSettings, useUpsertSetting, useDeleteSetting } from '@/hooks/api';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SystemSetting } from '@/lib/api-services/admin.service';

/** Ангиллын tabs */
const categories = [
  { value: '', label: 'Бүгд' },
  { value: 'general', label: 'Ерөнхий' },
  { value: 'payment', label: 'Төлбөр' },
  { value: 'email', label: 'Имэйл' },
  { value: 'notification', label: 'Мэдэгдэл' },
  { value: 'security', label: 'Аюулгүй байдал' },
];

/** Тохиргоо хуудас — category tabs + CRUD */
export default function AdminSettingsPage() {
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editSetting, setEditSetting] = useState<SystemSetting | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);

  const { data: settings, isLoading } = useSettings(activeCategory || undefined);
  const upsertMutation = useUpsertSetting();
  const deleteMutation = useDeleteSetting();

  const filteredSettings = settings?.filter((s) =>
    searchQuery
      ? s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  );

  const handleSave = (
    key: string,
    data: { value: unknown; description?: string; category?: string; isPublic?: boolean },
  ) => {
    upsertMutation.mutate(
      { key, data },
      {
        onSuccess: () => {
          toast.success('Тохиргоо амжилттай хадгалагдлаа');
          setEditSetting(null);
          setIsAddOpen(false);
        },
        onError: () => toast.error('Тохиргоо хадгалахад алдаа гарлаа'),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteKey) return;
    deleteMutation.mutate(deleteKey, {
      onSuccess: () => {
        toast.success('Тохиргоо амжилттай устгагдлаа');
        setDeleteKey(null);
      },
      onError: () => toast.error('Устгахад алдаа гарлаа'),
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
        <SidebarTrigger className="lg:hidden mr-4" />
        <Settings className="size-5 text-[#9c7aff] mr-2" />
        <h2 className="text-xl font-bold">Тохиргоо</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-[#f6f5f8]">
        <div className="max-w-[1200px] mx-auto">
          {/* Title + Actions */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Системийн тохиргоо</h1>
              <p className="text-sm text-slate-500 mt-1">Платформын ерөнхий тохиргоог удирдах</p>
            </div>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="bg-[#9c7aff] hover:bg-[#8b6ae8] text-white rounded-xl"
            >
              <Plus className="size-4 mr-2" />
              Тохиргоо нэмэх
            </Button>
          </div>

          {/* Category tabs + Search */}
          <div className="flex items-center gap-4 mb-6">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1">
              <TabsList className="bg-white border border-slate-200">
                {categories.map((cat) => (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    className="data-[state=active]:bg-[#9c7aff] data-[state=active]:text-white rounded-lg"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#9c7aff] focus:outline-none w-64"
                placeholder="Хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Settings table */}
          <div className="bg-white rounded-2xl border border-[#9c7aff]/5 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-60 flex-1" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredSettings && filteredSettings.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-[#9c7aff]/5">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Түлхүүр</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Утга</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Тайлбар</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">
                      Ангилал
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">
                      Public
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">
                      Үйлдэл
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#9c7aff]/5">
                  {filteredSettings.map((setting) => (
                    <tr key={setting.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded text-[#9c7aff]">
                          {setting.key}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 max-w-[200px] truncate">
                        {typeof setting.value === 'object'
                          ? JSON.stringify(setting.value)
                          : String(setting.value)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                        {setting.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="secondary" className="text-xs">
                          {setting.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`size-2 rounded-full inline-block ${setting.isPublic ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditSetting(setting)}
                            className="size-8 flex items-center justify-center rounded-lg hover:bg-[#9c7aff]/10 text-slate-500 hover:text-[#9c7aff] transition-colors"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteKey(setting.key)}
                            className="size-8 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center">
                <Settings className="size-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Тохиргоо байхгүй</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit/Add dialog */}
      <SettingFormDialog
        open={!!editSetting || isAddOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditSetting(null);
            setIsAddOpen(false);
          }
        }}
        setting={editSetting}
        onSave={handleSave}
        isPending={upsertMutation.isPending}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteKey} onOpenChange={(open) => !open && setDeleteKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Тохиргоо устгах</AlertDialogTitle>
            <AlertDialogDescription>
              <code className="font-mono text-[#9c7aff]">{deleteKey}</code> тохиргоог устгахдаа
              итгэлтэй байна уу?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Болих</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700"
              disabled={deleteMutation.isPending}
            >
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Тохиргоо нэмэх/засах dialog */
function SettingFormDialog({
  open,
  onOpenChange,
  setting,
  onSave,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: SystemSetting | null;
  onSave: (
    key: string,
    data: { value: unknown; description?: string; category?: string; isPublic?: boolean },
  ) => void;
  isPending: boolean;
}) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [isPublic, setIsPublic] = useState(false);

  const isEdit = !!setting;

  /** Dialog нээгдэхэд утгуудыг тавих */
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && setting) {
      setKey(setting.key);
      setValue(
        typeof setting.value === 'object'
          ? JSON.stringify(setting.value, null, 2)
          : String(setting.value),
      );
      setDescription(setting.description || '');
      setCategory(setting.category);
      setIsPublic(setting.isPublic);
    } else if (newOpen) {
      setKey('');
      setValue('');
      setDescription('');
      setCategory('general');
      setIsPublic(false);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = () => {
    let parsedValue: unknown = value;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      /* string утга хэвээр */
    }
    onSave(isEdit ? setting!.key : key, {
      value: parsedValue,
      description: description || undefined,
      category,
      isPublic,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Тохиргоо засах' : 'Шинэ тохиргоо нэмэх'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!isEdit && (
            <div>
              <Label htmlFor="key">Түлхүүр</Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="site.name"
                className="mt-1 font-mono"
              />
            </div>
          )}
          <div>
            <Label htmlFor="value">Утга (JSON эсвэл text)</Label>
            <Textarea
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='"Learnify" эсвэл {"key": "value"}'
              className="mt-1 font-mono min-h-[80px]"
            />
          </div>
          <div>
            <Label htmlFor="description">Тайлбар</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Тохиргооны тайлбар"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Ангилал</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="general">Ерөнхий</option>
                <option value="payment">Төлбөр</option>
                <option value="email">Имэйл</option>
                <option value="notification">Мэдэгдэл</option>
                <option value="security">Аюулгүй байдал</option>
              </select>
            </div>
            <div className="flex items-end gap-2 pb-1">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="size-4 rounded accent-[#9c7aff]"
              />
              <Label htmlFor="isPublic" className="text-sm">
                Public тохиргоо
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Болих
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || (!isEdit && !key)}
            className="bg-[#9c7aff] hover:bg-[#8b6ae8]"
          >
            {isPending ? 'Хадгалж байна...' : 'Хадгалах'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
