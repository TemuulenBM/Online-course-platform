'use client';

import Link from 'next/link';
import { Star, Users, BookOpen, ArrowRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ROUTES } from '@/lib/constants';

/** Менторуудын статик мэдээлэл — API байхгүй тул design showcase */
const MENTORS = [
  {
    id: '1',
    name: 'Батбаяр Ганзориг',
    title: 'Senior Full-Stack Developer',
    avatar: 'БГ',
    gradient: 'from-violet-500 to-purple-600',
    courses: 12,
    students: 3420,
    rating: 4.9,
    tags: ['React', 'Node.js', 'TypeScript'],
  },
  {
    id: '2',
    name: 'Нарантуяа Дорж',
    title: 'UX/UI Designer & Product Lead',
    avatar: 'НД',
    gradient: 'from-pink-500 to-rose-500',
    courses: 8,
    students: 2180,
    rating: 4.8,
    tags: ['Figma', 'UX Research', 'Design Systems'],
  },
  {
    id: '3',
    name: 'Энхболд Чимэд',
    title: 'Data Scientist & ML Engineer',
    avatar: 'ЭЧ',
    gradient: 'from-blue-500 to-cyan-500',
    courses: 6,
    students: 1890,
    rating: 4.9,
    tags: ['Python', 'Machine Learning', 'TensorFlow'],
  },
  {
    id: '4',
    name: 'Сарантуяа Бямба',
    title: 'Digital Marketing Specialist',
    avatar: 'СБ',
    gradient: 'from-emerald-500 to-teal-500',
    courses: 10,
    students: 4200,
    rating: 4.7,
    tags: ['SEO', 'Content Marketing', 'Analytics'],
  },
  {
    id: '5',
    name: 'Мөнхбаяр Лхагва',
    title: 'Cloud Architect & DevOps',
    avatar: 'МЛ',
    gradient: 'from-orange-500 to-amber-500',
    courses: 7,
    students: 1560,
    rating: 4.8,
    tags: ['AWS', 'Docker', 'Kubernetes'],
  },
  {
    id: '6',
    name: 'Болормаа Цэвэл',
    title: 'Business Strategy & Entrepreneurship',
    avatar: 'БЦ',
    gradient: 'from-indigo-500 to-violet-500',
    courses: 5,
    students: 2890,
    rating: 4.9,
    tags: ['Startup', 'Lean Canvas', 'Leadership'],
  },
  {
    id: '7',
    name: 'Ганбаатар Сүрэн',
    title: 'Mobile App Developer',
    avatar: 'ГС',
    gradient: 'from-red-500 to-orange-500',
    courses: 9,
    students: 2100,
    rating: 4.6,
    tags: ['React Native', 'Flutter', 'Swift'],
  },
  {
    id: '8',
    name: 'Дэлгэрмаа Нямаа',
    title: 'Cybersecurity & Ethical Hacking',
    avatar: 'ДН',
    gradient: 'from-slate-600 to-gray-700',
    courses: 4,
    students: 980,
    rating: 4.8,
    tags: ['Penetration Testing', 'Network Security', 'OSCP'],
  },
];

export default function MentorsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <main>
        {/* Hero хэсэг */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-16 pb-12">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
              <GraduationCap className="size-4 text-primary" />
              <span className="text-sm font-medium text-primary">200+ Идэвхтэй ментор</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              Манай шилдэг{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                менторуудтай
              </span>{' '}
              танилц
            </h1>
            <p className="mt-5 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Туршлагатай мэргэжилтнүүдээс суралц. Бидний менторууд нь тус тусдаа чиглэлийн
              мэргэжилтнүүд бөгөөд таны карьерыг дэмжихэд бэлэн байна.
            </p>
          </div>
        </section>

        {/* Менторуудын grid */}
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {MENTORS.map((mentor, i) => (
                <div
                  key={mentor.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Avatar */}
                  <div
                    className={`size-16 rounded-2xl bg-gradient-to-br ${mentor.gradient} flex items-center justify-center text-white text-xl font-bold mb-4 group-hover:scale-105 transition-transform duration-300`}
                  >
                    {mentor.avatar}
                  </div>

                  {/* Нэр, цол */}
                  <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                    {mentor.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                    {mentor.title}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {mentor.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Статистик */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-3.5 text-primary" />
                      {mentor.courses} сургалт
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5 text-emerald-500" />
                      {mentor.students.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Star className="size-3.5 text-amber-400 fill-amber-400" />
                      {mentor.rating}
                    </span>
                  </div>

                  {/* CTA */}
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full mt-4 text-primary hover:bg-primary/10 rounded-xl font-medium"
                  >
                    <Link href={ROUTES.REGISTER}>
                      Профайл харах
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ментор болох CTA */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#9575ED] p-10 lg:p-16 text-white text-center">
              {/* Чимэглэлийн blur */}
              <div className="absolute top-[-30%] right-[-10%] size-[400px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-[-20%] left-[-5%] size-[300px] bg-black/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <GraduationCap className="size-12 mx-auto mb-5 opacity-90" />
                <h2 className="text-3xl lg:text-4xl font-black leading-tight">
                  Та ч гэсэн ментор болж болно
                </h2>
                <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
                  Өөрийн мэдлэг, туршлагаа хуваалцаж мянга мянган суралцагчдад тусалж, нэмэлт орлого
                  олоорой.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 rounded-full px-8 font-semibold shadow-lg"
                  >
                    <Link href={ROUTES.REGISTER}>Ментор болох</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/40 text-white hover:bg-white/10 rounded-full px-8 font-semibold"
                  >
                    <Link href={ROUTES.COURSES}>Сургалтуудыг үзэх</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
