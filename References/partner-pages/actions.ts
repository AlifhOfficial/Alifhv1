"use server";

import { revalidatePath } from "next/cache";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/roles";
import { createId } from "@paralleldrive/cuid2";

// ==================== HELPER ====================

async function getPartnerIdForUser(userId: string): Promise<string | null> {
  const membership = await db
    .select({
      partnerId: schema.partnerStaff.partnerId,
      role: schema.partnerStaff.role,
    })
    .from(schema.partnerStaff)
    .where(
      and(
        eq(schema.partnerStaff.userId, userId),
        eq(schema.partnerStaff.status, "active")
      )
    )
    .limit(1);

  return membership[0]?.partnerId ?? null;
}

// ==================== PARTNER ACTIONS ====================

export async function updatePartnerProfile(formData: FormData) {
  const user = await requireAuth();
  const partnerId = await getPartnerIdForUser(user.id);

  if (!partnerId) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const updates: any = {};

    // Company Information
    if (formData.get("brandName")) updates.brandName = formData.get("brandName");
    if (formData.get("description")) updates.description = formData.get("description");
    if (formData.get("phone")) updates.phone = formData.get("phone");
    if (formData.get("alternatePhone")) updates.alternatePhone = formData.get("alternatePhone");
    if (formData.get("email")) updates.email = formData.get("email");
    if (formData.get("website")) updates.website = formData.get("website");
    if (formData.get("whatsapp")) updates.whatsapp = formData.get("whatsapp");

    // Address
    if (formData.get("street")) updates.street = formData.get("street");
    if (formData.get("area")) updates.area = formData.get("area");
    if (formData.get("city")) updates.city = formData.get("city");
    if (formData.get("emirate")) updates.emirate = formData.get("emirate");
    if (formData.get("poBox")) updates.poBox = formData.get("poBox");
    
    // Business Details
    if (formData.get("yearsInBusiness")) {
      updates.yearsInBusiness = parseInt(formData.get("yearsInBusiness") as string);
    }
    if (formData.get("foundedYear")) {
      updates.foundedYear = parseInt(formData.get("foundedYear") as string);
    }
    if (formData.get("showroomCount")) {
      updates.showroomCount = parseInt(formData.get("showroomCount") as string);
    }

    await db
      .update(schema.partner)
      .set(updates)
      .where(eq(schema.partner.id, partnerId));

    revalidatePath("/partner-dashboard/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBusinessHours(formData: FormData) {
  const user = await requireAuth();
  const partnerId = await getPartnerIdForUser(user.id);

  if (!partnerId) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const businessHours: any = {};
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    days.forEach(day => {
      const isClosed = formData.get(`${day}_closed`) === 'true';
      if (isClosed) {
        businessHours[day] = { isClosed: true };
      } else {
        businessHours[day] = {
          isClosed: false,
          open: formData.get(`${day}_open`) || '09:00',
          close: formData.get(`${day}_close`) || '18:00',
        };
      }
    });

    await db
      .update(schema.partner)
      .set({ businessHours })
      .where(eq(schema.partner.id, partnerId));

    revalidatePath("/partner-dashboard/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateServiceFeatures(formData: FormData) {
  const user = await requireAuth();
  const partnerId = await getPartnerIdForUser(user.id);

  if (!partnerId) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const features = {
      homeDelivery: formData.get("homeDelivery") === "true",
      testDriveAvailable: formData.get("testDriveAvailable") === "true",
      financing: formData.get("financing") === "true",
      tradeIn: formData.get("tradeIn") === "true",
      warranty: formData.get("warranty") === "true",
      insurance: formData.get("insurance") === "true",
      registration: formData.get("registration") === "true",
      exportAssistance: formData.get("exportAssistance") === "true",
    };

    await db
      .update(schema.partner)
      .set({ features })
      .where(eq(schema.partner.id, partnerId));

    revalidatePath("/partner-dashboard/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateNotificationPreferences(formData: FormData) {
  const user = await requireAuth();
  const partnerId = await getPartnerIdForUser(user.id);

  if (!partnerId) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const notificationPreferences = {
      emailNewLead: formData.get("emailNewLead") === "true",
      emailBooking: formData.get("emailBooking") === "true",
      emailMessage: formData.get("emailMessage") === "true",
      emailSale: formData.get("emailSale") === "true",
      emailReview: formData.get("emailReview") === "true",
      emailMarketing: formData.get("emailMarketing") === "true",
      smsNewLead: formData.get("smsNewLead") === "true",
      smsBooking: formData.get("smsBooking") === "true",
    };

    await db
      .update(schema.partner)
      .set({ notificationPreferences })
      .where(eq(schema.partner.id, partnerId));

    revalidatePath("/partner-dashboard/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== STAFF ACTIONS ====================

export async function createStaffMember(formData: FormData) {
  const user = await requireAuth();
  const partnerId = await getPartnerIdForUser(user.id);

  if (!partnerId) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const email = formData.get("email") as string;
    
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1);

    if (!existingUser) {
      return { success: false, error: "User with this email not found. They need to sign up first." };
    }

    // Check if already a staff member
    const [existingStaff] = await db
      .select()
      .from(schema.partnerStaff)
      .where(
        and(
          eq(schema.partnerStaff.partnerId, partnerId),
          eq(schema.partnerStaff.userId, existingUser.id)
        )
      )
      .limit(1);

    if (existingStaff) {
      return { success: false, error: "This user is already a staff member" };
    }

    // Create staff member
    await db.insert(schema.partnerStaff).values({
      id: `staff_${createId()}`,
      partnerId,
      userId: existingUser.id,
      role: (formData.get("role") as any) || "member",
      title: formData.get("title") as string,
      department: formData.get("department") as string,
      status: "invited",
      permissions: {},
    });

    revalidatePath("/partner-dashboard/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStaffMember(staffId: string, formData: FormData) {
  const user = await requireAuth();
  const partnerId = await getPartnerIdForUser(user.id);

  if (!partnerId) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const updates: any = {};

    if (formData.get("role")) updates.role = formData.get("role");
    if (formData.get("title")) updates.title = formData.get("title");
    if (formData.get("department")) updates.department = formData.get("department");
    if (formData.get("status")) updates.status = formData.get("status");

    await db
      .update(schema.partnerStaff)
      .set(updates)
      .where(
        and(
          eq(schema.partnerStaff.id, staffId),
          eq(schema.partnerStaff.partnerId, partnerId)
        )
      );

    revalidatePath("/partner-dashboard/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStaffMember(staffId: string) {
  const user = await requireAuth();
  const partnerId = await getPartnerIdForUser(user.id);

  if (!partnerId) {
    return { success: false, error: "Not authorized" };
  }

  try {
    await db
      .delete(schema.partnerStaff)
      .where(
        and(
          eq(schema.partnerStaff.id, staffId),
          eq(schema.partnerStaff.partnerId, partnerId)
        )
      );

    revalidatePath("/partner-dashboard/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== REVIEW ACTIONS ====================

export async function respondToReview(reviewId: string, response: string) {
  const user = await requireAuth();
  const partnerId = await getPartnerIdForUser(user.id);

  if (!partnerId) {
    return { success: false, error: "Not authorized" };
  }

  try {
    await db
      .update(schema.partnerReview)
      .set({
        partnerResponse: response,
        respondedAt: new Date(),
      })
      .where(
        and(
          eq(schema.partnerReview.id, reviewId),
          eq(schema.partnerReview.partnerId, partnerId)
        )
      );

    revalidatePath("/partner-dashboard/reviews");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteReviewResponse(reviewId: string) {
  const user = await requireAuth();
  const partnerId = await getPartnerIdForUser(user.id);

  if (!partnerId) {
    return { success: false, error: "Not authorized" };
  }

  try {
    await db
      .update(schema.partnerReview)
      .set({
        partnerResponse: null,
        respondedAt: null,
      })
      .where(
        and(
          eq(schema.partnerReview.id, reviewId),
          eq(schema.partnerReview.partnerId, partnerId)
        )
      );

    revalidatePath("/partner-dashboard/reviews");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
