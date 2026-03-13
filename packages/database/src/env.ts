const STAGING_HOST = 'stage.revvup.ae';
const STAGING_BRANCH = 'stage';

export function isStageDeployment(): boolean {
  const appUrls = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter(Boolean) as string[];

  return (
    process.env.APP_ENV === 'staging' ||
    process.env.VERCEL_GIT_COMMIT_REF === STAGING_BRANCH ||
    appUrls.some((url) => url.includes(STAGING_HOST))
  );
}

export function getDatabaseUrl(): string | undefined {
  if (isStageDeployment() && process.env.STAGING_DATABASE_URL) {
    return process.env.STAGING_DATABASE_URL;
  }

  return process.env.DATABASE_URL;
}

export function isDatabaseConfigured(): boolean {
  return !!getDatabaseUrl();
}

