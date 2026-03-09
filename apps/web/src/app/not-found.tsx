import Link from 'next/link';

/**
 * 404 — Хуудас олдсонгүй.
 * Next.js App Router-ийн not-found boundary.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <span className="text-8xl font-bold text-primary/20">404</span>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-foreground">Хуудас олдсонгүй</h1>

        <p className="mb-8 text-muted-foreground">
          Уучлаарай, таны хайж буй хуудас байхгүй эсвэл зөөгдсөн байна.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Нүүр хуудас
          </Link>
          <Link
            href="/courses"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Сургалтууд
          </Link>
        </div>
      </div>
    </div>
  );
}
