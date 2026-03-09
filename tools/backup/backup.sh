#!/bin/bash
# =============================================================================
# Database Backup Script — PostgreSQL + MongoDB
# =============================================================================
# Хэрэглээ:
#   ./tools/backup/backup.sh                  # Локал backup
#   ./tools/backup/backup.sh --upload-r2      # Backup + Cloudflare R2 руу upload
#   ./tools/backup/backup.sh --cleanup 30     # 30 хоногоос хуучин backup устгах
#
# Cron тохиргоо (өдөр бүр 02:00):
#   0 2 * * * /path/to/tools/backup/backup.sh --upload-r2 --cleanup 30
#
# Шаардлагатай environment variables:
#   DATABASE_URL          — PostgreSQL connection string
#   MONGODB_URI           — MongoDB connection string
#   S3_ENDPOINT           — Cloudflare R2 endpoint (--upload-r2 үед)
#   S3_ACCESS_KEY         — R2 access key (--upload-r2 үед)
#   S3_SECRET_KEY         — R2 secret key (--upload-r2 үед)
#   BACKUP_S3_BUCKET      — R2 bucket нэр (default: ocp-backups)
# =============================================================================

set -euo pipefail

# Тохиргоо
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_S3_BUCKET="${BACKUP_S3_BUCKET:-ocp-backups}"
RETENTION_DAYS=30
UPLOAD_R2=false

# Өнгөт output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Аргументууд шалгах
while [[ $# -gt 0 ]]; do
  case $1 in
    --upload-r2) UPLOAD_R2=true; shift ;;
    --cleanup) RETENTION_DAYS="${2:-30}"; shift 2 ;;
    --backup-dir) BACKUP_DIR="$2"; shift 2 ;;
    *) log_error "Тодорхойгүй аргумент: $1"; exit 1 ;;
  esac
done

# Backup хавтас үүсгэх
mkdir -p "$BACKUP_DIR/postgresql"
mkdir -p "$BACKUP_DIR/mongodb"

# .env файлаас environment variables унших (хэрэв тохируулаагүй бол)
if [ -f "$PROJECT_ROOT/apps/api/.env" ]; then
  set -a
  source "$PROJECT_ROOT/apps/api/.env"
  set +a
fi

# =============================================================================
# PostgreSQL Backup
# =============================================================================
backup_postgresql() {
  log_info "PostgreSQL backup эхэллээ..."

  if [ -z "${DATABASE_URL:-}" ]; then
    log_error "DATABASE_URL тохируулаагүй байна"
    return 1
  fi

  local pg_file="$BACKUP_DIR/postgresql/pg_backup_${TIMESTAMP}.sql.gz"

  if pg_dump "$DATABASE_URL" | gzip > "$pg_file"; then
    local size=$(du -h "$pg_file" | cut -f1)
    log_info "PostgreSQL backup амжилттай: $pg_file ($size)"
    echo "$pg_file"
  else
    log_error "PostgreSQL backup амжилтгүй боллоо"
    rm -f "$pg_file"
    return 1
  fi
}

# =============================================================================
# MongoDB Backup
# =============================================================================
backup_mongodb() {
  log_info "MongoDB backup эхэллээ..."

  if [ -z "${MONGODB_URI:-}" ]; then
    log_error "MONGODB_URI тохируулаагүй байна"
    return 1
  fi

  local mongo_dir="$BACKUP_DIR/mongodb/mongo_backup_${TIMESTAMP}"

  if mongodump --uri="$MONGODB_URI" --out="$mongo_dir" --quiet 2>/dev/null; then
    # Архивлах
    local mongo_file="${mongo_dir}.tar.gz"
    tar -czf "$mongo_file" -C "$BACKUP_DIR/mongodb" "mongo_backup_${TIMESTAMP}"
    rm -rf "$mongo_dir"

    local size=$(du -h "$mongo_file" | cut -f1)
    log_info "MongoDB backup амжилттай: $mongo_file ($size)"
    echo "$mongo_file"
  else
    log_error "MongoDB backup амжилтгүй боллоо"
    rm -rf "$mongo_dir"
    return 1
  fi
}

# =============================================================================
# Cloudflare R2 руу Upload (S3-compatible)
# =============================================================================
upload_to_r2() {
  local file="$1"
  local filename=$(basename "$file")

  if [ -z "${S3_ENDPOINT:-}" ] || [ -z "${S3_ACCESS_KEY:-}" ] || [ -z "${S3_SECRET_KEY:-}" ]; then
    log_warn "R2 credentials тохируулаагүй — upload алгасаж байна"
    return 0
  fi

  log_info "R2 руу upload хийж байна: $filename"

  export AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY"
  export AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY"

  if aws s3 cp "$file" "s3://${BACKUP_S3_BUCKET}/backups/${TIMESTAMP}/${filename}" \
    --endpoint-url "$S3_ENDPOINT" \
    --quiet 2>/dev/null; then
    log_info "R2 upload амжилттай: $filename"
  else
    log_error "R2 upload амжилтгүй: $filename"
    return 1
  fi
}

# =============================================================================
# Хуучин backup устгах
# =============================================================================
cleanup_old_backups() {
  log_info "${RETENTION_DAYS} хоногоос хуучин backup-уудыг устгаж байна..."

  local count=0
  while IFS= read -r -d '' file; do
    rm -f "$file"
    count=$((count + 1))
  done < <(find "$BACKUP_DIR" -name "*.gz" -mtime "+${RETENTION_DAYS}" -print0 2>/dev/null)

  if [ "$count" -gt 0 ]; then
    log_info "$count хуучин backup устгагдлаа"
  else
    log_info "Устгах хуучин backup байхгүй байна"
  fi
}

# =============================================================================
# Үндсэн ажиллагаа
# =============================================================================
main() {
  log_info "=== Database Backup эхэллээ: $(date) ==="

  local pg_file=""
  local mongo_file=""
  local exit_code=0

  # PostgreSQL backup
  if pg_file=$(backup_postgresql); then
    if [ "$UPLOAD_R2" = true ] && [ -n "$pg_file" ]; then
      upload_to_r2 "$pg_file" || true
    fi
  else
    exit_code=1
  fi

  # MongoDB backup
  if mongo_file=$(backup_mongodb); then
    if [ "$UPLOAD_R2" = true ] && [ -n "$mongo_file" ]; then
      upload_to_r2 "$mongo_file" || true
    fi
  else
    exit_code=1
  fi

  # Хуучин backup цэвэрлэх
  cleanup_old_backups

  if [ "$exit_code" -eq 0 ]; then
    log_info "=== Бүх backup амжилттай дууслаа ==="
  else
    log_error "=== Зарим backup амжилтгүй боллоо ==="
  fi

  return $exit_code
}

main "$@"
