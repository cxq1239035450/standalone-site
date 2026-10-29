import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

export const testUser = { email: `e2e-${randomUUID()}@example.test`, password: randomUUID() }

function manage(action: 'create' | 'delete') {
  if (process.env.E2E_DATABASE_COPY !== '1') throw new Error('Set E2E_DATABASE_COPY=1 only with DATABASE_URL pointing to a disposable test database.')
  execFileSync(process.execPath, ['--import', 'tsx', 'tests/helpers/manageUser.ts', action], {
    env: { ...process.env, E2E_TEST_EMAIL: testUser.email, E2E_TEST_PASSWORD: testUser.password },
    stdio: 'pipe',
  })
}
export async function seedTestUser(): Promise<void> { manage('create') }
export async function cleanupTestUser(): Promise<void> { manage('delete') }
