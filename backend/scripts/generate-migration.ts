#!/usr/bin/env node

import { execSync } from 'node:child_process';
import * as readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter migration name: ', (migrationName) => {
  if (!migrationName || migrationName.trim() === '') {
    console.error('Error: Migration name cannot be empty');
    rl.close();
    process.exit(1);
  }

  // Using replace with global flag (replaceAll doesn't work with regex patterns)
  const sanitizedName = migrationName.trim().replace(/[^a-zA-Z0-9]/g, '');
  if (sanitizedName === '') {
    console.error(
      'Error: Migration name must contain at least one alphanumeric character',
    );
    rl.close();
    process.exit(1);
  }

  const migrationPath = `migrations/${sanitizedName}`;
  const command = `typeorm-ts-node-commonjs migration:generate -d src/data-source.ts ${migrationPath}`;

  console.log(`\nGenerating migration: ${sanitizedName}`);
  console.log(`Path: ${migrationPath}\n`);

  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`\n✅ Migration generated successfully: ${migrationPath}`);
  } catch {
    console.error('\n❌ Failed to generate migration');
    rl.close();
    process.exit(1);
  }

  rl.close();
});
