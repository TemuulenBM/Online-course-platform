'use client';

import Link from 'next/link';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  BookOpen,
  ArrowRight,
  Star,
  TrendingUp,
  Lightbulb,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';

/** Нийгэмлэгийн статистик */
const STATS = [
  { label: 'Идэвхтэй гишүүд', value: '10,000+', icon: Users, color: 'text-primary' },
  { label: 'Хэлэлцүүлгүүд', value: '500+', icon: MessageSquare, color: 'text-emerald-500' },
  { label: 'Хариулагдсан асуултууд', value: '8,200+', icon: ThumbsUp, color: 'text-blue-500' },
  { label: 'Сургалт ярилцсан', value: '300+', icon: BookOpen, color: 'text-amber-500' },
];

/** Нийгэмлэгийн давуу тал */
const BENEFITS = [
  {
    icon: Lightbulb,
    title: 'Мэдлэгээ хуваалц',
    desc: 'Өөрийн туршлага, ойлголтоо хуваалцаж бусдын суралцахад туслаарай.',
    color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
  },
  {
    icon: Users,
    title: 'Хамтрагчтай бол',
    desc: 'Ижил чиглэлийн суралцагчидтай холбогдож project хамтран хийгээрэй.',
    color: 'bg-primary/10 dark:bg-primary/20 text-primary',
  },
  {
    icon: MessageSquare,
    title: 'Асуулт тавь',
    desc: 'Ойлгоогүй зүйлээ менторууд болон бусад суралцагчдаас асуугаарай.',
    color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500',
  },
  {
    icon: TrendingUp,
    title: 'Хамт ахидаг',
    desc: 'Нийгэмлэгийн дэмжлэгтэй суралцах нь хэд дахин илүү үр дүнтэй.',
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
  },
];

/** Сүүлийн хэлэлцүүлгийн жишээ статик өгөгдөл */
const RECENT_DISCUSSIONS = [
  {
    id: '1',
    category: 'JavaScript',
    title: 'React Server Components ба Client Components-ийн ялгаа юу вэ?',
    author: 'Батбаяр Г.',
    authorInitials: 'БГ',
    authorGradient: 'from-violet-500 to-purple-600',
    replies: 24,
    upvotes: 87,
    timeAgo: '2 цагийн өмнө',
    hot: true,
  },
  {
    id: '2',
    category: 'Python',
    title: 'Machine Learning-д ямар математик мэдлэг шаардлагатай вэ?',
    author: 'Нарантуяа Д.',
    authorInitials: 'НД',
    authorGradient: 'from-pink-500 to-rose-500',
    replies: 31,
    upvotes: 142,
    timeAgo: '5 цагийн өмнө',
    hot: true,
  },
  {
    id: '3',
    category: 'UI/UX',
    title: 'Figma-ийн Auto Layout ашиглах best practice-ууд',
    author: 'Энхболд Ч.',
    authorInitials: 'ЭЧ',
    authorGradient: 'from-blue-500 to-cyan-500',
    replies: 18,
    upvotes: 63,
    timeAgo: '1 өдрийн өмнө',
    hot: false,
  },
  {
    id: '4',
    category: 'Career',
    title: 'Junior developer-ийн анхны ажлын байр хэрхэн олох вэ?',
    author: 'Сарантуяа Б.',
    authorInitials: 'СБ',
    authorGradient: 'from-emerald-500 to-teal-500',
    replies: 47,
    upvotes: 215,
    timeAgo: '2 өдрийн өмнө',
    hot: false,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  JavaScript: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Python: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'UI/UX': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Career: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export default function CommunityPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-16 pb-16 lg:pb-20 bg-white dark:bg-slate-950">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
              <Heart className="size-4 text-primary" />
              <span className="text-sm font-medium text-primary">Мобайл + Вэб нийгэмлэг</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight">
              Манай{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                нийгэмлэгт
              </span>{' '}
              нэгдээрэй
            </h1>
            <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              10,000 гаруй суралцагчид, менторуудтай хамтран суралц, асуул, хуваалц. Дангаараа
              суралцах шаардлагагүй.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
              {isAuthenticated ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-primary to-[#9575ED] text-white rounded-full px-8 h-12 font-semibold hover:opacity-90 shadow-lg shadow-primary/25"
                >
                  <Link href={ROUTES.DASHBOARD}>
                    Хэлэлцүүлэгт орох
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-primary to-[#9575ED] text-white rounded-full px-8 h-12 font-semibold hover:opacity-90 shadow-lg shadow-primary/25"
                  >
                    <Link href={ROUTES.REGISTER}>
                      Нийгэмлэгт нэгдэх
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 h-12 font-semibold border-gray-200 dark:border-slate-700"
                  >
                    <Link href={ROUTES.LOGIN}>Нэвтрэх</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Статистик */}
        <section className="py-10 border-y border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS.map((stat) => {
                const StatIcon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <StatIcon className={`size-7 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-3xl font-black text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Сүүлийн хэлэлцүүлгүүд */}
        <section className="py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
                  Идэвхтэй хэлэлцүүлгүүд
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Сүүлийн хэлэлцүүлэгт нэгдэж оролцоорой
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="hidden sm:flex rounded-full border-gray-200 dark:border-slate-700"
              >
                <Link href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}>
                  Бүгдийг харах
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {RECENT_DISCUSSIONS.map((post) => (
                <div
                  key={post.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
                  onClick={() =>
                    (window.location.href = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER)
                  }
                >
                  <div className="flex items-start gap-4">
                    {/* Author avatar */}
                    <div
                      className={`size-10 rounded-xl bg-gradient-to-br ${post.authorGradient} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                    >
                      {post.authorInitials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {post.category}
                        </span>
                        {post.hot && (
                          <Badge className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-0 hover:bg-red-100">
                            🔥 Халуун
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">{post.timeAgo}</span>
                      </div>

                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="font-medium text-gray-500 dark:text-gray-400">
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="size-3.5" />
                          {post.replies} хариулт
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="size-3.5 text-amber-400" />
                          {post.upvotes}
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="size-4 text-gray-300 shrink-0 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Нийгэмлэгийн давуу талууд */}
        <section className="py-16 lg:py-20 bg-gray-50 dark:bg-slate-900/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                Яагаад нийгэмлэгт нэгдэх хэрэгтэй вэ?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
                Дангаараа суралцах нь хэцүү. Хамт суралцах нь 3 дахин хурдан, илүү үр дүнтэй.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((benefit) => {
                const BenefitIcon = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 text-center hover:shadow-md transition-shadow"
                  >
                    <div
                      className={`size-12 rounded-2xl ${benefit.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <BenefitIcon className="size-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {benefit.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Join CTA */}
        <section className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#9575ED] p-10 lg:p-16 text-center text-white">
              <div className="absolute top-[-20%] right-[-5%] size-[300px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <Users className="size-12 mx-auto mb-4 opacity-90" />
                <h2 className="text-3xl lg:text-4xl font-black">Өнөөдрөөс нэгдэж эхэл</h2>
                <p className="mt-4 text-white/80 text-lg max-w-xl mx-auto leading-relaxed">
                  10,000 гаруй суралцагч аль хэдийн манай нийгэмлэгт байна. Та дараагийнх нь бол.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-8 bg-white text-primary hover:bg-white/90 rounded-full px-10 font-bold shadow-lg"
                >
                  <Link href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}>
                    {isAuthenticated ? 'Нийгэмлэг рүү орох' : 'Үнэгүй нэгдэх'}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
