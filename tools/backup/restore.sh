#!/bin/bash
# =============================================================================
# Database Restore Script — PostgreSQL + MongoDB
# =============================================================================
# Хэрэглээ:
#   ./tools/backup/restore.sh --pg backups/postgresql/pg_backup_20260309.sql.gz
#   ./tools/backup/restore.sh --mongo backups/mongodb/mongo_backup_20260309.tar.gz
#   ./tools/backup/restore.sh --pg pg_backup.sql.gz --mongo mongo_backup.tar.gz
#
# АНХААРУУЛГА: Restore хийхэд одоогийн өгөгдөл УСТГАГДАНА!
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

PG_FILE=""
MONGO_FILE=""

# Аргументууд
while [[ $# -gt 0 ]]; do
  case $1 in
    --pg) PG_FILE="$2"; shift 2 ;;
    --mongo) MONGO_FILE="$2"; shift 2 ;;
    *) log_error "Тодорхойгүй аргумент: $1"; exit 1 ;;
  esac
done

# .env файлаас environment variables унших
if [ -f "$PROJECT_ROOT/apps/api/.env" ]; then
  set -a
  source "$PROJECT_ROOT/apps/api/.env"
  set +a
fi

# =============================================================================
# PostgreSQL Restore
# =============================================================================
restore_postgresql() {
  local file="$1"
  log_warn "PostgreSQL restore хийх гэж байна. Одоогийн өгөгдөл УСТГАГДАНА!"
  read -p "Үргэлжлүүлэх үү? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    log_info "Цуцлагдлаа"
    return 0
  fi

  if [ -z "${DATABASE_URL:-}" ]; then
    log_error "DATABASE_URL тохируулаагүй байна"
    return 1
  fi

  log_info "PostgreSQL restore эхэллээ: $file"

  if gunzip -c "$file" | psql "$DATABASE_URL" > /dev/null 2>&1; then
    log_info "PostgreSQL restore амжилттай"
  else
    log_error "PostgreSQL restore амжилтгүй"
    return 1
  fi
}

# =============================================================================
# MongoDB Restore
# =============================================================================
restore_mongodb() {
  local file="$1"
  log_warn "MongoDB restore хийх гэж байна. Одоогийн өгөгдөл УСТГАГДАНА!"
  read -p "Үргэлжлүүлэх үү? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    log_info "Цуцлагдлаа"
    return 0
  fi

  if [ -z "${MONGODB_URI:-}" ]; then
    log_error "MONGODB_URI тохируулаагүй байна"
    return 1
  fi

  local temp_dir=$(mktemp -d)
  log_info "MongoDB restore эхэллээ: $file"

  tar -xzf "$file" -C "$temp_dir"

  # Извлэгдсэн хавтас олох
  local dump_dir=$(find "$temp_dir" -mindepth 1 -maxdepth 1 -type d | head -1)

  if mongorestore --uri="$MONGODB_URI" --drop "$dump_dir" --quiet 2>/dev/null; then
    log_info "MongoDB restore амжилттай"
  else
    log_error "MongoDB restore амжилтгүй"
    rm -rf "$temp_dir"
    return 1
  fi

  rm -rf "$temp_dir"
}

# =============================================================================
# Үндсэн ажиллагаа
# =============================================================================
main() {
  if [ -z "$PG_FILE" ] && [ -z "$MONGO_FILE" ]; then
    log_error "Хэрэглээ: ./restore.sh --pg <файл> --mongo <файл>"
    exit 1
  fi

  if [ -n "$PG_FILE" ]; then
    if [ ! -f "$PG_FILE" ]; then
      log_error "Файл олдсонгүй: $PG_FILE"
      exit 1
    fi
    restore_postgresql "$PG_FILE"
  fi

  if [ -n "$MONGO_FILE" ]; then
    if [ ! -f "$MONGO_FILE" ]; then
      log_error "Файл олдсонгүй: $MONGO_FILE"
      exit 1
    fi
    restore_mongodb "$MONGO_FILE"
  fi

  log_info "Restore дууслаа"
}

main "$@"
