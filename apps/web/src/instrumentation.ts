export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { db } = await import('./lib/db');
    await db.$connect().catch((err: Error) => {
      console.error('DB pre-connect failed:', err.message);
    });
  }
}
