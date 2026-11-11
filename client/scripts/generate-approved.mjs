import { spawnSync } from 'node:child_process';

const candidates = process.platform === 'win32'
  ? [['py', ['-3', 'scripts/generate-approved.py']], ['python', ['scripts/generate-approved.py']], ['python3', ['scripts/generate-approved.py']]]
  : [['python3', ['scripts/generate-approved.py']], ['python', ['scripts/generate-approved.py']]];

for (const [command, args] of candidates) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (!result.error && result.status === 0) process.exit(0);
  if (result.error?.code !== 'ENOENT') process.exit(result.status ?? 1);
}

console.error('Python 3 is required. Install Python 3 or add it to PATH.');
process.exit(1);
