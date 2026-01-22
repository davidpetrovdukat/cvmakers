// Helper script to run Prisma migrate deploy, and self-heal a known
// failed migration state (P3009) for `0004_add_client_meta`.
// It attempts a deploy; if it fails, it marks the migration as rolled back
// and retries the deploy.

const { spawnSync } = require('node:child_process');

function run(cmd) {
  const res = spawnSync(cmd, { shell: true, stdio: 'inherit' });
  return res.status === 0;
}

console.log('[prisma-deploy] Running prisma migrate deploy...');
if (run('npx prisma migrate deploy')) {
  process.exit(0);
}

console.warn('[prisma-deploy] Deploy failed. Trying to resolve failed migrations and retry...');
// Resolve latest known failures in order (most recent first)
// Note: Only resolve migrations that are actually in failed state
run('npx prisma migrate resolve --rolled-back 20250925131202_add_document_metadata');

if (!run('npx prisma migrate deploy')) {
  console.error('[prisma-deploy] Deploy failed after resolve attempt.');
  process.exit(1);
}

console.log('[prisma-deploy] Deploy succeeded after resolve.');
