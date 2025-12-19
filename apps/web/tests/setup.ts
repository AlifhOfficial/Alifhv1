import { mock } from "bun:test";

type SessionUser = { id: string; email?: string; role?: string };

const defaultQuota = {
  currentMonthSuperlikesUsed: 0,
  maxSuperlikesPerMonth: 5,
  premiumSuperlikesBonus: 0,
  periodEndDate: null as string | null,
  periodStartDate: null as string | null,
};

const cacheStore = new Map<string, { value: any; expires: number }>();

export const memoryCache = {
  get<T>(key: string): T | null {
    const entry = cacheStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      cacheStore.delete(key);
      return null;
    }
    return entry.value as T;
  },
  set<T>(key: string, value: T, ttlSeconds: number = 60) {
    cacheStore.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
  },
  delete(...keys: string[]) {
    keys.forEach((key) => cacheStore.delete(key));
  },
  clear() {
    cacheStore.clear();
  },
  stats() {
    const now = Date.now();
    let expired = 0;
    for (const entry of cacheStore.values()) {
      if (now > entry.expires) expired++;
    }
    return { total: cacheStore.size, expired, active: cacheStore.size - expired };
  },
};

export const CacheKeys = {
  userSession: (userId: string) => `user:${userId}:session`,
  listingDetail: (listingId: string) => `listing:${listingId}:detail`,
  listingCards: (filters: string) => `listings:cards:${filters}`,
  listingCardsBatch: (ids: string[]) => `listings:cards:batch:${ids.sort().join(",")}`,
  partnerInventory: (partnerId: string, status?: string) => `listings:partner:${partnerId}:${status || "all"}`,
  partnerMiniProfile: (partnerId: string) => `partner:${partnerId}:mini`,
} as const;

export const CacheTTL = {
  userSession: 30,
  listingDetail: 300,
  listingCards: 120,
  listingCardsBatch: 60,
  partnerInventory: 180,
  partnerMiniProfile: 60,
} as const;

const mockDbState = {
  selectQueue: [] as any[],
  insertResult: [] as any[],
  updateResult: [] as any[],
  executeResult: { rows: [] as any[] },
  queryUserResult: null as any,
};

export const mockState = {
  sessionUser: null as SessionUser | null,
  favoriteStatus: { favorites: [] as string[], superlikes: [] as string[] },
  superlikeQuota: { ...defaultQuota },
  toggleFavoriteResult: { isFavorite: true, isSuperliked: false },
  toggleSuperlikeResult: {
    isFavorite: false,
    isSuperliked: true,
    quota: { ...defaultQuota },
  },
  superlikeError: null as Error | null,
  partnerProfiles: {} as Record<string, any>,
  userProfiles: {} as Record<string, any>,
  userProfile: { id: "profile-1", avatar: null as string | null },
  ensureProfile: { id: "profile-ensured", avatar: null as string | null },
  signedUrl: null as string | null,
  storageStatus: {
    provider: "mock",
    bucket: "test-bucket",
    publicUrl: "https://mock-storage",
    isConfigured: true,
  },
  passwordResetResult: { ok: true },
  authHandlerResponse: new Response(JSON.stringify({ ok: true }), { status: 200 }),
};

export const passwordResetCalls: any[] = [];
export const uploadedFiles: any[] = [];

function nextSelectResult() {
  if (mockDbState.selectQueue.length > 0) {
    return mockDbState.selectQueue.shift();
  }
  return [];
}

function createSelectChain() {
  const result = nextSelectResult();
  const promise = Promise.resolve(result);

  const offsetChain: any = {
    offset: () => promise,
    then: promise.then.bind(promise),
  };

  const chain: any = {
    from: () => chain,
    leftJoin: () => chain,
    where: () => chain,
    orderBy: () => chain,
    limit: () => offsetChain,
    offset: () => promise,
    then: promise.then.bind(promise),
  };

  return chain;
}

function createInsertChain() {
  const promise = Promise.resolve(mockDbState.insertResult);
  const valuesChain: any = {
    returning: () => promise,
    then: promise.then.bind(promise),
  };
  const chain: any = {
    values: () => valuesChain,
    then: promise.then.bind(promise),
  };
  return chain;
}

function createUpdateChain() {
  const promise = Promise.resolve(mockDbState.updateResult);
  const whereChain: any = {
    where: () => promise,
    returning: () => promise,
    then: promise.then.bind(promise),
  };
  const chain: any = {
    set: () => whereChain,
    where: () => promise,
    then: promise.then.bind(promise),
  };
  return chain;
}

function createDeleteChain() {
  const promise = Promise.resolve(mockDbState.updateResult);
  const chain: any = {
    where: () => promise,
    returning: () => promise,
    then: promise.then.bind(promise),
  };
  return chain;
}

export function resetMocks() {
  mockState.sessionUser = null;
  mockState.favoriteStatus = { favorites: [], superlikes: [] };
  mockState.superlikeQuota = { ...defaultQuota };
  mockState.toggleFavoriteResult = { isFavorite: true, isSuperliked: false };
  mockState.toggleSuperlikeResult = {
    isFavorite: false,
    isSuperliked: true,
    quota: { ...defaultQuota },
  };
  mockState.superlikeError = null;
  mockState.partnerProfiles = {};
  mockState.userProfiles = {};
  mockState.userProfile = { id: "profile-1", avatar: null };
  mockState.ensureProfile = { id: "profile-ensured", avatar: null };
  mockState.signedUrl = null;
  mockState.storageStatus = {
    provider: "mock",
    bucket: "test-bucket",
    publicUrl: "https://mock-storage",
    isConfigured: true,
  };
  mockState.passwordResetResult = { ok: true };
  mockState.authHandlerResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });

  mockDbState.selectQueue = [];
  mockDbState.insertResult = [];
  mockDbState.updateResult = [];
  mockDbState.executeResult = { rows: [] };
  mockDbState.queryUserResult = null;

  passwordResetCalls.length = 0;
  uploadedFiles.length = 0;
  memoryCache.clear();
}

export function setSessionUser(user: SessionUser | null) {
  mockState.sessionUser = user;
}

export function setQueryUserResult(user: any) {
  mockDbState.queryUserResult = user;
}

export function queueSelectResults(...results: any[]) {
  mockDbState.selectQueue = results.slice();
}

export function setInsertResult(result: any[]) {
  mockDbState.insertResult = result;
}

export function setUpdateResult(result: any[]) {
  mockDbState.updateResult = result;
}

export function setExecuteResult(result: any) {
  mockDbState.executeResult = result;
}

export function setPartnerProfile(partnerId: string, profile: any) {
  mockState.partnerProfiles[partnerId] = profile;
}

export function createJsonRequest(path: string, method: string, body?: any, headers: Record<string, string> = {}) {
  const init: RequestInit = {
    method,
    headers: { ...headers },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json", ...init.headers };
  }

  return new Request(`http://localhost${path}`, init);
}

export function createFormDataRequest(path: string, formData: FormData, headers: Record<string, string> = {}) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    body: formData as any,
    headers,
  });
}

export async function readJson(response: Response) {
  return response.json();
}

mock.module("@alifh/database", () => {
  return {
    db: {
      select: createSelectChain,
      insert: createInsertChain,
      update: createUpdateChain,
      delete: createDeleteChain,
      execute: () => Promise.resolve(mockDbState.executeResult),
      query: {
        user: {
          findFirst: async () => mockDbState.queryUserResult,
        },
      },
    },
    memoryCache,
    CacheKeys,
    CacheTTL,
    carListing: {
      id: "id",
      partnerId: "partnerId",
      status: "status",
      createdAt: "createdAt",
    },
    partner: {
      id: "partnerId",
      brandName: "brandName",
      companyNameLegal: "companyNameLegal",
      isVerified: true,
      logo: "logo",
      phone: "phone",
      website: "website",
      emirate: "emirate",
      city: "city",
      platformRating: 5,
      platformReviewCount: 10,
      activeListings: 2,
    },
    kycRecord: {},
    userProfile: {},
    user: { id: "user", email: "email@example.com" },
    toggleFavoriteForUser: async () => mockState.toggleFavoriteResult,
    toggleSuperlikeForUser: async () => {
      if (mockState.superlikeError) throw mockState.superlikeError;
      return mockState.toggleSuperlikeResult;
    },
    getFavoriteStatusForListings: async () => mockState.favoriteStatus,
    getSuperlikeQuotaForUser: async () => mockState.superlikeQuota,
    getPartnerMiniProfile: async (partnerId: string) => mockState.partnerProfiles[partnerId] ?? null,
    updatePartnerMiniProfile: async (partnerId: string, data: any) => {
      const updated = { id: partnerId, ...(mockState.partnerProfiles[partnerId] || {}), ...data };
      mockState.partnerProfiles[partnerId] = updated;
      return updated;
    },
    getUserProfileByUserId: async (userId: string) =>
      mockState.userProfiles[userId] ?? mockState.userProfile ?? null,
    ensureUserProfile: async (userId: string) => {
      const ensured = { ...mockState.ensureProfile, userId };
      mockState.userProfiles[userId] = ensured;
      return ensured;
    },
    updateUserProfileByUserId: async (userId: string, data: any) => {
      const base = mockState.userProfiles[userId] ?? mockState.userProfile ?? {};
      const updated = { ...base, ...data, userId };
      mockState.userProfiles[userId] = updated;
      return updated;
    },
    memoryCacheStats: () => memoryCache.stats(),
  };
});

mock.module("drizzle-orm", () => ({
  eq: (...values: any[]) => ({ eq: values }),
  and: (...values: any[]) => values.filter(Boolean),
  desc: (value: any) => ({ desc: value }),
  inArray: (_column: any, values: any[]) => values,
}));

mock.module("@/lib/auth/session-context", () => ({
  getSessionUser: async () => mockState.sessionUser,
}));

mock.module("@/lib/auth", () => ({
  auth: {
    handler: async () => mockState.authHandlerResponse,
    api: {
      requestPasswordReset: async (payload: any) => {
        passwordResetCalls.push(payload);
        return mockState.passwordResetResult;
      },
      getSession: async () => ({ user: mockState.sessionUser }),
    },
  },
}));

mock.module("@/lib/storage", () => ({
  uploadFile: async (params: any) => {
    const keyParts = [];
    if (params.directory) keyParts.push(params.directory);
    keyParts.push(params.fileName || "file");
    const key = keyParts.join("/");
    uploadedFiles.push({ key, ...params });
    return {
      key,
      url: `https://mock-storage/${key}`,
      etag: "mock-etag",
    };
  },
  deleteFile: async () => {},
  getSignedUrl: async (key: string, options?: any) =>
    mockState.signedUrl || `https://mock-storage/${key}?exp=${options?.expiresIn || 900}`,
  getStorageStatus: () => mockState.storageStatus,
}));

process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
