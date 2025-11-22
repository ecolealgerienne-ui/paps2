#!/bin/sh
set -e

echo "🔧 Starting AniTra API container..."

# Vérifier que les fichiers essentiels sont présents
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found!"
  exit 1
fi

if [ ! -f "prisma/schema.prisma" ]; then
  echo "❌ Error: prisma/schema.prisma not found!"
  exit 1
fi

echo "✅ Files check passed"

# Générer le client Prisma
echo "📦 Generating Prisma Client..."
npx prisma generate

# Attendre que PostgreSQL soit prêt (au cas où)
echo "⏳ Waiting for PostgreSQL..."
until npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; do
  echo "   PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is ready"

# Appliquer les migrations
echo "🔄 Applying database migrations..."
npx prisma migrate deploy

echo "✅ Database migrations applied"

# Démarrer l'application
echo "🚀 Starting NestJS application..."
exec npm run start:dev
