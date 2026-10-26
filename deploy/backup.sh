#!/bin/sh
set -eu
umask 077
base=/opt/standalone-site/shared
stamp=$(date -u +%Y%m%dT%H%M%SZ)
target="$base/backups/$stamp"
mkdir -p "$target"
docker exec standalone-site-db pg_dump -U pawsite -d pawsite -Fc --no-owner --no-acl > "$target/database.dump"
tar -czf "$target/media.tar.gz" -C "$base/media" .
cp "$base/site.env" "$target/site.env"
cp "$base/postgres.env" "$target/postgres.env"
printf 'Backup saved: %s\n' "$target"
