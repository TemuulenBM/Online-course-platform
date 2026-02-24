'use client';

import { BookOpen, Trophy, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStats } from '@/hooks/api/use-profile';

interface PublicProfileTabsProps {
  userId: string;
}

export function PublicProfileTabs({ userId }: PublicProfileTabsProps) {
  const { data: stats } = useUserStats(userId);

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="courses">
        <TabsList className="bg-transparent border-b border-[#9c7aff]/10 w-full justify-start rounded-none h-auto p-0">
          <TabsTrigger
            value="courses"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#9c7aff] data-[state=active]:text-[#9c7aff] data-[state=active]:shadow-none px-6 py-4 text-sm font-medium"
          >
            Хичээлүүд
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#9c7aff] data-[state=active]:text-[#9c7aff] data-[state=active]:shadow-none px-6 py-4 text-sm font-medium"
          >
            Тэмдэглэл
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#9c7aff] data-[state=active]:text-[#9c7aff] data-[state=active]:shadow-none px-6 py-4 text-sm font-medium"
          >
            Ололт амжилт
          </TabsTrigger>
        </TabsList>

        {/* Хичээлүүд tab */}
        <TabsContent value="courses" className="mt-6">
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <BookOpen className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">Хичээлийн жагсаалт удахгүй нэмэгдэнэ</p>
          </div>
        </TabsContent>

        {/* Тэмдэглэл tab */}
        <TabsContent value="notes" className="mt-6">
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <BookOpen className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">Тэмдэглэл одоогоор байхгүй байна</p>
          </div>
        </TabsContent>

        {/* Ололт амжилт tab */}
        <TabsContent value="achievements" className="mt-6">
          {stats && stats.totalCertificates > 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-[#9c7aff]/10 rounded-2xl flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-[#9c7aff]" />
              </div>
              <p className="text-lg font-bold text-slate-900">
                {stats.totalCertificates} сертификат
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {stats.completedCourses} сургалт амжилттай дүүргэсэн
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Trophy className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">Ололт амжилт одоогоор байхгүй байна</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
