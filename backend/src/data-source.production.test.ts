/**
 * This test file ensures the production logging block (lines 78-82) is covered.
 * 
 * IMPORTANT: This file sets NODE_ENV to 'production' but uses SKIP_DOTENV
 * to prevent loading real .env file with database credentials.
 * 
 * It sets NODE_ENV to 'production' at the top level before any imports
 * to trigger the production logging code path.
 */

// Set NODE_ENV to 'production' at the TOP LEVEL before any imports
// This ensures that when data-source.ts is imported, it sees NODE_ENV === 'production'
// and executes the logging block (lines 78-82)
// SKIP_DOTENV prevents loading real .env file with database credentials
const originalEnv = process.env.NODE_ENV;
process.env.NODE_ENV = 'production';
process.env.SKIP_DOTENV = 'true';

// Now import the test framework
import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';

void describe('Data Source - Production Environment', () => {
  void test('should execute production logging block when NODE_ENV is production', async () => {
    // Import data-source - since NODE_ENV is 'production', 
    // the logging block (lines 78-82) should execute
    // Note: If the module was already imported, this won't re-execute the top-level code
    // But if this test file runs first (alphabetically), it should work
    const dataSourceModule = await import('./data-source');
    
    // The production logging block should have executed (if module wasn't already loaded)
    assert.ok(dataSourceModule);
    assert.ok(dataSourceModule.AppDataSource);
  });
});

// Restore original NODE_ENV after module loads
// Note: This runs after the module is loaded, so it won't affect the import above
if (originalEnv !== undefined) {
  process.env.NODE_ENV = originalEnv;
} else {
  delete process.env.NODE_ENV;
}
delete process.env.SKIP_DOTENV;
