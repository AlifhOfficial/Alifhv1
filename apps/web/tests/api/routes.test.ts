import "../setup";
import { beforeEach, describe, expect, it } from "bun:test";
import {
  CacheKeys,
  CacheTTL,
  createFormDataRequest,
  createJsonRequest,
  memoryCache,
  mockState,
  passwordResetCalls,
  queueSelectResults,
  readJson,
  resetMocks,
  setInsertResult,
  setPartnerProfile,
  setQueryUserResult,
  setSessionUser,
  setUpdateResult,
  uploadedFiles,
} from "../setup";

const authRoute = await import("../../src/app/api/auth/[...auth]/route");
const magicLinkRoute = await import("../../src/app/api/auth/magic-link-validated/route");
const passwordResetRoute = await import("../../src/app/api/auth/password-reset-validated/route");
const favoritesRoute = await import("../../src/app/api/engagement/favorites/route");
const favoritesStatusRoute = await import("../../src/app/api/engagement/favorites-status/route");
const superlikesRoute = await import("../../src/app/api/engagement/superlikes/route");
const userProfileRoute = await import("../../src/app/api/profile/user-profile/route");
const deleteAccountRoute = await import("../../src/app/api/profile/delete-account/route");
const listingDetailRoute = await import("../../src/app/api/listings/[id]/route");
const carCardRoute = await import("../../src/app/api/listings/car-card/route");
const partnerDealerProfileRoute = await import("../../src/app/api/partners/[partnerId]/dealer-profile/route");
const storageStatusRoute = await import("../../src/app/api/storage/status/route");
const storageSignRoute = await import("../../src/app/api/storage/sign/route");
const storageUploadRoute = await import("../../src/app/api/storage/upload/route");
const kycSubmitRoute = await import("../../src/app/api/kyc/submit/route");
const kycRequestsRoute = await import("../../src/app/api/kyc/requests/route");
const emailLogRoute = await import("../../src/app/api/dev/email-log/route");

beforeEach(() => {
  resetMocks();
});

describe("Auth validation routes", () => {
  it("rejects invalid magic link payload", async () => {
    const request = createJsonRequest("/api/auth/magic-link-validated", "POST", { email: "bad-email" });
    const response = await magicLinkRoute.POST(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid input");
  });

  it("returns 400 for magic link when user is missing", async () => {
    setQueryUserResult(null);
    const request = createJsonRequest("/api/auth/magic-link-validated", "POST", { email: "user@example.com" });
    const response = await magicLinkRoute.POST(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(String(body.error)).toContain("No account found");
  });

  it("accepts magic link requests for existing users", async () => {
    setQueryUserResult({ id: "user-1", email: "user@example.com" });
    const request = createJsonRequest("/api/auth/magic-link-validated", "POST", { email: "user@example.com" });
    const response = await magicLinkRoute.POST(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("rejects invalid password reset payload", async () => {
    const request = createJsonRequest("/api/auth/password-reset-validated", "POST", { email: "nope" });
    const response = await passwordResetRoute.POST(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid input");
  });

  it("returns 400 when password reset user does not exist", async () => {
    setQueryUserResult(null);
    const request = createJsonRequest("/api/auth/password-reset-validated", "POST", { email: "ghost@example.com" });
    const response = await passwordResetRoute.POST(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(String(body.error)).toContain("No account found");
  });

  it("passes through password reset requests to auth api", async () => {
    setQueryUserResult({ id: "user-1", email: "user@example.com" });
    mockState.passwordResetResult = { success: true, token: "reset-token" };

    const request = createJsonRequest("/api/auth/password-reset-validated", "POST", {
      email: "user@example.com",
      redirectTo: "https://app.test/reset",
    });
    const response = await passwordResetRoute.POST(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.token).toBe("reset-token");
    expect(passwordResetCalls.at(-1)?.body?.email).toBe("user@example.com");
  });

  it("adds CORS headers for allowed auth origins", async () => {
    const origin = "http://localhost:3000";
    const request = new Request("http://localhost:3000/api/auth", { headers: { origin } });
    mockState.authHandlerResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });

    const response = await authRoute.GET(request as any);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
    expect(response.status).toBe(200);
  });

  it("responds to OPTIONS preflight for auth", async () => {
    const origin = "http://localhost:3000";
    const request = new Request("http://localhost:3000/api/auth", {
      method: "OPTIONS",
      headers: { origin },
    });

    const response = await authRoute.OPTIONS(request as any);

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
  });
});

describe("Favorites & superlikes", () => {
  it("requires auth for favorites toggle", async () => {
    const request = createJsonRequest("/api/favorites", "POST", { listingId: "l1" });
    const response = await favoritesRoute.POST(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(401);
    expect(body.requiresAuth).toBe(true);
  });

  it("validates favorite payload", async () => {
    setSessionUser({ id: "user-1" });
    const request = createJsonRequest("/api/favorites", "POST", {});
    const response = await favoritesRoute.POST(request as any);
    expect(response.status).toBe(400);
  });

  it("toggles favorites for authenticated user", async () => {
    setSessionUser({ id: "user-1" });
    mockState.toggleFavoriteResult = { isFavorite: true, isSuperliked: false };

    const request = createJsonRequest("/api/favorites", "POST", { listingId: "car-1" });
    const response = await favoritesRoute.POST(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.status.isFavorite).toBe(true);
  });

  it("requires auth for superlikes", async () => {
    const request = createJsonRequest("/api/superlikes", "POST", { listingId: "car-1" });
    const response = await superlikesRoute.POST(request as any);
    expect(response.status).toBe(401);
  });

  it("enforces superlike validation errors", async () => {
    setSessionUser({ id: "user-1" });
    const request = createJsonRequest("/api/superlikes", "POST", {});
    const response = await superlikesRoute.POST(request as any);
    expect(response.status).toBe(400);
  });

  it("returns 429 when superlike limit reached", async () => {
    setSessionUser({ id: "user-1" });
    mockState.superlikeError = new Error("Superlike limit reached");

    const request = createJsonRequest("/api/superlikes", "POST", { listingId: "car-1" });
    const response = await superlikesRoute.POST(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(429);
    expect(body.error).toBe("Superlike limit reached");
  });

  it("returns toggle status and quota on success", async () => {
    setSessionUser({ id: "user-1" });
    mockState.toggleSuperlikeResult = {
      isFavorite: true,
      isSuperliked: true,
      quota: { ...mockState.superlikeQuota, remaining: 4 },
    };

    const request = createJsonRequest("/api/superlikes", "POST", { listingId: "car-1" });
    const response = await superlikesRoute.POST(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.status.isSuperliked).toBe(true);
    expect(body.quota.remaining).toBe(4);
  });

  it("returns empty favorites payload for guests", async () => {
    const response = await favoritesStatusRoute.GET(new Request("http://localhost/api/favorites-status") as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.favorites).toEqual([]);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("returns favorites, superlikes, and quota for authed users", async () => {
    setSessionUser({ id: "user-1" });
    mockState.favoriteStatus = { favorites: ["a"], superlikes: ["b"] };
    mockState.superlikeQuota = { ...mockState.superlikeQuota, currentMonthSuperlikesUsed: 1 };

    const response = await favoritesStatusRoute.GET(new Request("http://localhost/api/favorites-status") as any);
    const body = await readJson(response);

    expect(body.favorites).toEqual(["a"]);
    expect(body.superlikes).toEqual(["b"]);
    expect(body.quota.currentMonthSuperlikesUsed).toBe(1);
  });
});

describe("Profile APIs", () => {
  it("rejects unauthenticated profile GET", async () => {
    const response = await userProfileRoute.GET(new Request("http://localhost/api/profile/user-profile") as any);
    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toContain("no-cache");
  });

  it("ensures profile exists for authenticated users", async () => {
    setSessionUser({ id: "user-1" });
    mockState.userProfile = null as any;
    mockState.ensureProfile = { id: "profile-ensured", avatar: "avatar-key" };
    mockState.signedUrl = "https://signed/avatar-key";

    const response = await userProfileRoute.GET(new Request("http://localhost/api/profile/user-profile") as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.profile.id).toBe("profile-ensured");
    expect(body.profile.avatarUrl).toBe("https://signed/avatar-key");
  });

  it("validates profile updates", async () => {
    setSessionUser({ id: "user-1" });
    const request = createJsonRequest("/api/profile/user-profile", "PATCH", { locationLat: "bad" });
    const response = await userProfileRoute.PATCH(request as any);
    expect(response.status).toBe(400);
  });

  it("updates profile fields", async () => {
    setSessionUser({ id: "user-1" });
    mockState.userProfile = { id: "profile-1", avatar: "avatar-key" };
    mockState.signedUrl = "https://signed/avatar-key";

    const request = createJsonRequest("/api/profile/user-profile", "PATCH", { firstName: "Jane" });
    const response = await userProfileRoute.PATCH(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.profile.firstName).toBe("Jane");
    expect(body.profile.avatarUrl).toBe("https://signed/avatar-key");
  });

  it("marks account for deletion", async () => {
    setSessionUser({ id: "user-1" });
    mockState.userProfile = { id: "profile-1" };

    const response = await deleteAccountRoute.POST(
      createJsonRequest("/api/profile/delete-account", "POST") as any,
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(new Date(body.deletionDate).getTime()).toBeGreaterThan(Date.now());
  });
});

describe("Listing APIs", () => {
  it("returns cached listing detail when available", async () => {
    const cached = { id: "listing-1", make: "Tesla" };
    memoryCache.set(CacheKeys.listingDetail("listing-1"), cached, CacheTTL.listingDetail);

    const response = await listingDetailRoute.GET(
      new Request("http://localhost/api/listings/listing-1") as any,
      { params: Promise.resolve({ id: "listing-1" }) } as any,
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data).toEqual(cached);
  });

  it("returns 404 when listing is missing", async () => {
    queueSelectResults([]);
    const response = await listingDetailRoute.GET(
      new Request("http://localhost/api/listings/missing") as any,
      { params: Promise.resolve({ id: "missing" }) } as any,
    );
    expect(response.status).toBe(404);
  });

  it("fetches listing detail and caches it", async () => {
    const listing = { id: "listing-2", make: "Ford", model: "Mustang" };
    queueSelectResults([listing]);

    const response = await listingDetailRoute.GET(
      new Request("http://localhost/api/listings/listing-2") as any,
      { params: Promise.resolve({ id: "listing-2" }) } as any,
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data.id).toBe("listing-2");
    expect(memoryCache.get(CacheKeys.listingDetail("listing-2"))).toEqual(listing);
  });

  it("serves car cards from cache", async () => {
    const cached = { data: [{ id: "card-1" }], meta: { total: 1, limit: 1, offset: 0 } };
    const cacheKey = CacheKeys.listingCards("published:1:0");
    memoryCache.set(cacheKey, cached, CacheTTL.listingCards);

    const response = await carCardRoute.GET(
      new Request("http://localhost/api/listings/car-card?limit=1&offset=0") as any,
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data[0].id).toBe("card-1");
    expect(response.headers.get("Cache-Control")).toContain("public");
  });

  it("returns batch car cards for ids", async () => {
    const cards = [{ id: "a1" }, { id: "a2" }];
    queueSelectResults(cards);

    const response = await carCardRoute.GET(
      new Request("http://localhost/api/listings/car-card?ids=a1,a2") as any,
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.meta.total).toBe(2);
  });

  it("uses two-step fetch when ids not provided", async () => {
    queueSelectResults([{ id: "x1" }, { id: "x2" }], [
      { id: "x1", make: "Honda" },
      { id: "x2", make: "Audi" },
    ]);

    const response = await carCardRoute.GET(
      new Request("http://localhost/api/listings/car-card?limit=2&offset=0") as any,
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data.length).toBe(2);
  });
});

describe("Partner dealer profile", () => {
  it("returns 404 for unknown partner", async () => {
    const response = await partnerDealerProfileRoute.GET(
      new Request("http://localhost/api/partners/p1/dealer-profile") as any,
      { params: Promise.resolve({ partnerId: "missing" }) } as any,
    );
    expect(response.status).toBe(404);
  });

  it("returns partner dealer profile with cache headers", async () => {
    setPartnerProfile("p1", { id: "p1", brandName: "Dealer One" });
    const response = await partnerDealerProfileRoute.GET(
      new Request("http://localhost/api/partners/p1/dealer-profile") as any,
      { params: Promise.resolve({ partnerId: "p1" }) } as any,
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.id).toBe("p1");
    expect(response.headers.get("Cache-Control")).toContain("public");
  });

  it("requires auth for partner updates", async () => {
    const response = await partnerDealerProfileRoute.PATCH(
      new Request("http://localhost/api/partners/p1/dealer-profile", { method: "PATCH" }) as any,
      { params: Promise.resolve({ partnerId: "p1" }) } as any,
    );
    expect(response.status).toBe(401);
  });

  it("validates partner update payload", async () => {
    setSessionUser({ id: "staff-1" });
    const request = createJsonRequest("/api/partners/p1/dealer-profile", "PATCH", { showroomCount: "bad" });
    const response = await partnerDealerProfileRoute.PATCH(request as any, {
      params: Promise.resolve({ partnerId: "p1" }),
    } as any);
    expect(response.status).toBe(400);
  });

  it("updates partner dealer profile", async () => {
    setSessionUser({ id: "staff-1" });
    setPartnerProfile("p1", { id: "p1", brandName: "Old Name" });

    const request = createJsonRequest("/api/partners/p1/dealer-profile", "PATCH", { brandName: "New Name" });
    const response = await partnerDealerProfileRoute.PATCH(request as any, {
      params: Promise.resolve({ partnerId: "p1" }),
    } as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.brandName).toBe("New Name");
    expect(response.headers.get("Cache-Control")).toContain("no-cache");
  });
});

describe("Storage APIs", () => {
  it("returns storage status", async () => {
    const response = await storageStatusRoute.GET();
    const body = await readJson(response);

    expect(body.isConfigured).toBe(true);
    expect(body.provider).toBe("mock");
  });

  it("validates signed url input", async () => {
    const response = await storageSignRoute.POST(createJsonRequest("/api/storage/sign", "POST", {}) as any);
    expect(response.status).toBe(400);
  });

  it("returns signed url", async () => {
    const response = await storageSignRoute.POST(
      createJsonRequest("/api/storage/sign", "POST", { key: "files/doc.pdf", expiresIn: 60 }) as any,
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(String(body.url)).toContain("files/doc.pdf");
  });

  it("rejects uploads without file", async () => {
    const formData = new FormData();
    const response = await storageUploadRoute.POST(createFormDataRequest("/api/storage/upload", formData) as any);
    expect(response.status).toBe(400);
  });

  it("accepts uploads and returns key", async () => {
    const formData = new FormData();
    formData.append("file", new File([Buffer.from("hello")], "test.txt", { type: "text/plain" }));
    formData.append("directory", "uploads");

    const response = await storageUploadRoute.POST(createFormDataRequest("/api/storage/upload", formData) as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.key).toContain("uploads");
    expect(uploadedFiles.length).toBe(1);
  });
});

describe("KYC routes", () => {
  it("requires auth for KYC submit", async () => {
    const response = await kycSubmitRoute.POST(createJsonRequest("/api/kyc/submit", "POST", {}) as any);
    expect(response.status).toBe(401);
  });

  it("validates KYC payload", async () => {
    setSessionUser({ id: "user-1" });
    const response = await kycSubmitRoute.POST(createJsonRequest("/api/kyc/submit", "POST", {}) as any);
    expect(response.status).toBe(400);
  });

  it("creates KYC record", async () => {
    setSessionUser({ id: "user-1" });
    setInsertResult([{ id: "kyc_123", status: "pending" }]);

    const response = await kycSubmitRoute.POST(
      createJsonRequest("/api/kyc/submit", "POST", {
        documentType: "passport",
        documentNumber: "1234",
        documentFrontUrl: "https://files/front",
        selfieUrl: "https://files/selfie",
      }) as any,
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.record.id).toBe("kyc_123");
  });

  it("requires auth for KYC request listing", async () => {
    const response = await kycRequestsRoute.GET(new Request("http://localhost/api/kyc/requests") as any);
    expect(response.status).toBe(401);
  });

  it("returns paged KYC records", async () => {
    setSessionUser({ id: "admin" });
    queueSelectResults([
      { id: "kyc_1", userId: "user-1", status: "pending", createdAt: new Date().toISOString() },
    ]);

    const response = await kycRequestsRoute.GET(new Request("http://localhost/api/kyc/requests?limit=10") as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.records.length).toBe(1);
    expect(body.meta.total).toBe(1);
  });

  it("rejects invalid KYC patch payload", async () => {
    setSessionUser({ id: "admin" });
    const request = createJsonRequest("/api/kyc/requests", "PATCH", {});
    const response = await kycRequestsRoute.PATCH(request as any);
    expect(response.status).toBe(400);
  });

  it("returns 404 when KYC record not found", async () => {
    setSessionUser({ id: "admin" });
    queueSelectResults([]);
    const request = createJsonRequest("/api/kyc/requests", "PATCH", { kycId: "missing", action: "approve" });
    const response = await kycRequestsRoute.PATCH(request as any);
    expect(response.status).toBe(404);
  });

  it("approves KYC record", async () => {
    setSessionUser({ id: "admin" });
    queueSelectResults([{ id: "kyc_1", userId: "user-1" }]);
    setUpdateResult([{ id: "kyc_1" }]);

    const request = createJsonRequest("/api/kyc/requests", "PATCH", { kycId: "kyc_1", action: "approve" });
    const response = await kycRequestsRoute.PATCH(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("rejects KYC record with reason", async () => {
    setSessionUser({ id: "admin" });
    queueSelectResults([{ id: "kyc_2", userId: "user-2" }]);
    setUpdateResult([{ id: "kyc_2" }]);

    const request = createJsonRequest("/api/kyc/requests", "PATCH", {
      kycId: "kyc_2",
      action: "reject",
      rejectionReason: "Blurry document",
    });
    const response = await kycRequestsRoute.PATCH(request as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe("KYC request rejected");
  });
});

describe("Misc APIs", () => {
  it("returns email log stub", async () => {
    const response = await emailLogRoute.GET(new Request("http://localhost/api/dev/email-log") as any);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe("Email log endpoint");
  });
});
