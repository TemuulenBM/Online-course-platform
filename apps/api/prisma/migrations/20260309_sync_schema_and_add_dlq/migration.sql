-- EmailVerification таблиц
CREATE TABLE "email_verifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "email_verifications_user_id_idx" ON "email_verifications"("user_id");
CREATE INDEX "email_verifications_token_idx" ON "email_verifications"("token");

ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FailedJob (DLQ) таблиц
CREATE TABLE "failed_jobs" (
    "id" TEXT NOT NULL,
    "queue_name" TEXT NOT NULL,
    "job_name" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "job_data" JSONB NOT NULL,
    "error_message" TEXT NOT NULL,
    "error_stack" TEXT,
    "attempts_made" INTEGER NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "failed_jobs_queue_name_idx" ON "failed_jobs"("queue_name");
CREATE INDEX "failed_jobs_status_idx" ON "failed_jobs"("status");
CREATE INDEX "failed_jobs_severity_idx" ON "failed_jobs"("severity");
CREATE INDEX "failed_jobs_created_at_idx" ON "failed_jobs"("created_at");

-- Гүйцэтгэл сайжруулах индексүүд (production readiness)
CREATE INDEX IF NOT EXISTS "analytics_events_event_name_created_at_idx" ON "analytics_events"("event_name", "created_at");
CREATE INDEX IF NOT EXISTS "courses_status_created_at_idx" ON "courses"("status", "created_at");
CREATE INDEX IF NOT EXISTS "enrollments_user_id_status_idx" ON "enrollments"("user_id", "status");
CREATE INDEX IF NOT EXISTS "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");
CREATE INDEX IF NOT EXISTS "sessions_expires_at_idx" ON "sessions"("expires_at");
CREATE INDEX IF NOT EXISTS "subscriptions_status_current_period_end_idx" ON "subscriptions"("status", "current_period_end");
