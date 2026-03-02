'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Zap, Shield, Building2, HelpCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

/** Үнийн төлөвлөгөөний тодорхойлолт */
const PLANS = [
  {
    id: 'free',
    name: 'Үнэгүй',
    icon: Zap,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Суралцахаа эхлэх хамгийн сайн арга. Захиалга, карт шаардлагагүй.',
    color: 'from-slate-500 to-gray-600',
    cta: 'Үнэгүй эхлэх',
    ctaHref: ROUTES.REGISTER,
    ctaVariant: 'outline' as const,
    popular: false,
    features: [
      { label: '10 үнэгүй сургалтад хандах', included: true },
      { label: 'Үндсэн дасгал, тест', included: true },
      { label: 'Community форумд оролцох', included: true },
      { label: 'Мобайл апп ашиглах', included: true },
      { label: 'Сертификат авах', included: false },
      { label: 'Live session-д оролцох', included: false },
      { label: 'Ментортой 1:1 хуралдах', included: false },
      { label: 'Байгууллагын удирдлага', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Shield,
    monthlyPrice: 29900,
    yearlyPrice: 24900,
    description: 'Бүх сургалт, сертификат, live session. Карьераа хурдасга.',
    color: 'from-primary to-[#9575ED]',
    cta: 'Pro эхлэх',
    ctaHref: ROUTES.REGISTER,
    ctaVariant: 'default' as const,
    popular: true,
    features: [
      { label: 'Бүх 500+ сургалтад хандах', included: true },
      { label: 'Тест, дасгал, дүгнэлт', included: true },
      { label: 'Community форумд оролцох', included: true },
      { label: 'Мобайл апп ашиглах', included: true },
      { label: 'Сертификат авах', included: true },
      { label: 'Live session-д оролцох', included: true },
      { label: 'Ментортой 1:1 хуралдах', included: false },
      { label: 'Байгууллагын удирдлага', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    monthlyPrice: null,
    yearlyPrice: null,
    description: 'Байгуулллагынхаа хэрэгт тохируулсан сургалтын тогтолцоо.',
    color: 'from-amber-500 to-orange-500',
    cta: 'Холбоо барих',
    ctaHref: 'mailto:sales@learnify.mn',
    ctaVariant: 'outline' as const,
    popular: false,
    features: [
      { label: 'Бүх сургалтад хандах', included: true },
      { label: 'Захиалгат сургалт бэлтгэх', included: true },
      { label: 'Community форумд оролцох', included: true },
      { label: 'Мобайл апп ашиглах', included: true },
      { label: 'Сертификат авах', included: true },
      { label: 'Live session-д оролцох', included: true },
      { label: 'Ментортой 1:1 хуралдах', included: true },
      { label: 'Байгууллагын удирдлага', included: true },
    ],
  },
];

/** Түгээмэл асуултуудын жагсаалт */
const FAQS = [
  {
    question: 'Үнэгүй горимоос Pro руу хэзээ ч шилжиж болно уу?',
    answer:
      'Тийм! Та хэдийд ч Pro горим идэвхжүүлж болно. Шилжих өдрөөс эхлэн бүх контентэд нэвтэрнэ.',
  },
  {
    question: 'Жилийн захиалгыг цуцлах боломжтой юу?',
    answer:
      'Та захиалгаа хүссэн үедээ цуцлах боломжтой. Цуцлах дараа үлдсэн хугацаанд хандах эрх хэвээр байна.',
  },
  {
    question: 'Нэг данснаас хэд хэдэн хүн сурч болох уу?',
    answer:
      'Нэг данс нэг хүнд зориулагдсан. Хэд хэдэн хүн хамтран суралцах бол Enterprise тариф авахыг зөвлөнө.',
  },
  {
    question: 'Буцаан олголт хийдэг үү?',
    answer:
      'Хэрэв та захиалга хийснээс хойш 7 хоногийн дотор сургалтын агуулгад сэтгэл хангалуун биш бол буцаан олголт хийх боломжтой.',
  },
];

export default function PricingPage() {
  /* Жилийн/сарын toggle */
  const [isYearly, setIsYearly] = useState(false);
  /* FAQ accordion state */
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="pt-16 pb-12 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-5 bg-primary/10 text-primary hover:bg-primary/15 border-0 font-medium px-4 py-1.5">
              Ил тод үнийн бодлого
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              Өөрт тохирсон
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {' '}
                тарифыг{' '}
              </span>
              сонго
            </h1>
            <p className="mt-5 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              Нэмэлт зардалгүй, нуугдмал төлбөргүй. Хэдийд ч буцааж болно.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 mt-8 p-1.5 bg-gray-100 dark:bg-slate-800 rounded-full">
              <button
                onClick={() => setIsYearly(false)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all',
                  !isYearly
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400',
                )}
              >
                Сарын
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                  isYearly
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400',
                )}
              >
                Жилийн
                <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  -17%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="pb-16 lg:pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {PLANS.map((plan) => {
                const PlanIcon = plan.icon;
                const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      'relative flex flex-col rounded-3xl border p-8 transition-all duration-300',
                      plan.popular
                        ? 'border-primary/30 shadow-xl shadow-primary/10 bg-white dark:bg-slate-900 scale-[1.02]'
                        : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:border-gray-300 dark:hover:border-slate-700',
                    )}
                  >
                    {/* Popular badge */}
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-primary to-[#9575ED] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                          Хамгийн алдартай
                        </span>
                      </div>
                    )}

                    {/* Plan header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`size-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                      >
                        <PlanIcon className="size-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                    </div>

                    {/* Үнэ */}
                    <div className="mb-4">
                      {price === null ? (
                        <p className="text-3xl font-black text-gray-900 dark:text-white">
                          Захиалгат
                        </p>
                      ) : price === 0 ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-gray-900 dark:text-white">
                            ₮0
                          </span>
                          <span className="text-gray-400 text-sm">/сар</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-gray-900 dark:text-white">
                            ₮{price.toLocaleString()}
                          </span>
                          <span className="text-gray-400 text-sm">/сар</span>
                        </div>
                      )}
                      {isYearly && plan.yearlyPrice !== null && plan.yearlyPrice !== 0 && (
                        <p className="text-xs text-emerald-500 mt-1 font-medium">
                          Жилд ₮{(plan.monthlyPrice! - plan.yearlyPrice).toLocaleString()} хэмнэнэ
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                      {plan.description}
                    </p>

                    {/* CTA товч */}
                    <Button
                      asChild
                      variant={plan.popular ? 'default' : plan.ctaVariant}
                      size="lg"
                      className={cn(
                        'w-full rounded-xl font-semibold mb-8',
                        plan.popular &&
                          'bg-gradient-to-r from-primary to-[#9575ED] hover:opacity-90',
                      )}
                    >
                      <Link href={plan.ctaHref}>{plan.cta}</Link>
                    </Button>

                    {/* Feature жагсаалт */}
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          {feature.included ? (
                            <div className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                              <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          ) : (
                            <div className="size-5 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              <X className="size-3 text-gray-400" />
                            </div>
                          )}
                          <span
                            className={cn(
                              'text-sm',
                              feature.included
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-400 dark:text-gray-600',
                            )}
                          >
                            {feature.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ хэсэг */}
        <section className="py-16 lg:py-20 bg-gray-50 dark:bg-slate-900/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary/10 mb-4">
                <HelpCircle className="size-6 text-primary" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                Түгээмэл асуултууд
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white text-sm pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'size-4 text-gray-400 shrink-0 transition-transform duration-200',
                        openFaq === i && 'rotate-180',
                      )}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <p className="text-center mt-10 text-sm text-gray-500 dark:text-gray-400">
              Асуулт байна уу?{' '}
              <a
                href="mailto:hello@learnify.mn"
                className="text-primary font-medium hover:underline"
              >
                Бидэнтэй холбоо барь
              </a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
