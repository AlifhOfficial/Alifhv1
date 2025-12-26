/**
 * API: Update/Delete Car Listing
 * PUT/DELETE /api/listings/[id]
 * 
 * Purpose: Update or delete a car listing
 * Authentication: Required (owner or staff only)
 * Session Source: getSessionUser() from middleware cache
 * 
 * Standards:
 * - Returns 401 for no auth
 * - Returns 403 for non-owner (unless staff)
 * - Returns 404 for listing not found
 * - Returns 400 for invalid input
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  CacheKeys,
  createAuditLogEntry,
  getActivePartnerStaffMembershipByUserIdAndPartnerId,
  getListingModerationContext,
  updateCarListing,
  updateCarListingByStaff,
  deleteCarListing,
  deleteCarListingByStaff,
  invalidateListingCaches,
  type UpdateCarListingInput,
} from '@alifh/database';
import { memoryCache } from '@alifh/database';
import { autoMatchConsignment } from '@/lib/consignment/auto-match';
import { getClientIp } from '@/lib/utils/get-client-ip';

export const runtime = 'nodejs';

async function canManagePartnerListing(
  user: { id: string; partnerMemberships?: any[] },
  partnerId: string
): Promise<boolean> {
  const sessionMembership = user.partnerMemberships?.find((m) => m.partnerId === partnerId);
  const roleFromSession = (sessionMembership as any)?.staffRole as string | undefined;
  if (sessionMembership) {
    return roleFromSession !== 'viewer';
  }

  const dbMembership = await getActivePartnerStaffMembershipByUserIdAndPartnerId(user.id, partnerId);
  return !!dbMembership && dbMembership.role !== 'viewer';
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const listing = await getListingModerationContext(id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();

    // Validate data types if provided
    if (body.year !== undefined) {
      if (typeof body.year !== 'number' || body.year < 1900 || body.year > new Date().getFullYear() + 1) {
        return NextResponse.json(
          { error: 'Invalid year' },
          { status: 400 }
        );
      }
    }

    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || body.price <= 0) {
        return NextResponse.json(
          { error: 'Invalid price' },
          { status: 400 }
        );
      }
    }

    if (body.mileage !== undefined) {
      if (typeof body.mileage !== 'number' || body.mileage < 0) {
        return NextResponse.json(
          { error: 'Invalid mileage' },
          { status: 400 }
        );
      }
    }

    if (body.specs !== undefined) {
      const validSpecs = ['gcc', 'american', 'european', 'japanese', 'canadian', 'other'];
      if (!validSpecs.includes(body.specs)) {
        return NextResponse.json(
          { 
            error: 'Invalid specs',
            validValues: validSpecs
          },
          { status: 400 }
        );
      }
    }

    if (body.steeringSide !== undefined) {
      const validSteeringSide = ['left', 'right'];
      if (!validSteeringSide.includes(body.steeringSide)) {
        return NextResponse.json(
          { 
            error: 'Invalid steeringSide',
            validValues: validSteeringSide
          },
          { status: 400 }
        );
      }
    }

    if (body.images !== undefined && !Array.isArray(body.images)) {
      return NextResponse.json(
        { error: 'Images must be an array' },
        { status: 400 }
      );
    }

    if (body.moderationStatus !== undefined) {
      const validModerationStatuses = ['draft', 'submitted', 'pending_review', 'approved', 'rejected'];
      if (!validModerationStatuses.includes(String(body.moderationStatus))) {
        return NextResponse.json(
          { error: 'Invalid moderationStatus', validValues: validModerationStatuses },
          { status: 400 }
        );
      }
    }

    if (body.lifecycleStatus !== undefined) {
      const validLifecycleStatuses = ['active', 'archived', 'sold', 'expired', 'deleted'];
      if (!validLifecycleStatuses.includes(String(body.lifecycleStatus))) {
        return NextResponse.json(
          { error: 'Invalid lifecycleStatus', validValues: validLifecycleStatuses },
          { status: 400 }
        );
      }
    }

    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    const isOwner = listing.userId === user.id;

    const isPartnerListing = listing.partnerId != null;
    const canManagePartner =
      !isAdmin && !isOwner && isPartnerListing
        ? await canManagePartnerListing(user as any, listing.partnerId as string)
        : false;

    if (!isOwner && !isAdmin && !(isPartnerListing && canManagePartner)) {
      return NextResponse.json(
        { error: 'Not authorized to update this listing' },
        { status: 403 }
      );
    }

    const requestedLifecycleStatus = body.lifecycleStatus !== undefined ? String(body.lifecycleStatus) : undefined;
    const isUnarchiving = listing.lifecycleStatus === 'archived' && requestedLifecycleStatus === 'active';

    if (isUnarchiving && !isAdmin) {
      const isResubmitting =
        (body.status !== undefined && String(body.status) === 'published') ||
        (body.moderationStatus !== undefined &&
          (String(body.moderationStatus) === 'submitted' || String(body.moderationStatus) === 'pending_review'));

      if (listing.suspensionReason && !isResubmitting) {
        return NextResponse.json(
          { error: 'This listing is suspended by an admin and cannot be unarchived without admin permission.' },
          { status: 403 }
        );
      }

      if (listing.moderationStatus === 'rejected') {
        const legacyResubmit = body.status !== undefined && String(body.status) === 'published';
        const explicitResubmit =
          body.moderationStatus !== undefined &&
          (String(body.moderationStatus) === 'submitted' || String(body.moderationStatus) === 'pending_review');

        if (!legacyResubmit && !explicitResubmit) {
          return NextResponse.json(
            { error: 'Rejected listings cannot be unarchived directly. Edit the listing and resubmit for review.' },
            { status: 400 }
          );
        }
      }
    }

    // Auto-set thumbnail to first image if images are provided and thumbnail is not explicitly set
    const thumbnail = body.thumbnail !== undefined 
      ? body.thumbnail 
      : (body.images && body.images.length > 0 ? body.images[0] : undefined);

    // Prepare update data
    const updateData: UpdateCarListingInput = {};

    // Only include fields that are present in the request
    if (body.make !== undefined) updateData.make = body.make;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.year !== undefined) updateData.year = body.year;
    if (body.trim !== undefined) updateData.trim = body.trim;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.vin !== undefined) updateData.vin = body.vin;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.isNegotiable !== undefined) updateData.isNegotiable = body.isNegotiable;
    if (body.bodyType !== undefined) updateData.bodyType = body.bodyType;
    if (body.fuelType !== undefined) updateData.fuelType = body.fuelType;
    if (body.transmission !== undefined) updateData.transmission = body.transmission;
    if (body.specs !== undefined) updateData.specs = body.specs;
    if (body.steeringSide !== undefined) updateData.steeringSide = body.steeringSide;
    if (body.engineSize !== undefined) updateData.engineSize = body.engineSize;
    if (body.engineType !== undefined) updateData.engineType = body.engineType;
    if (body.cylinders !== undefined) updateData.cylinders = body.cylinders;
    if (body.powerRange !== undefined) updateData.powerRange = body.powerRange;
    if (body.torque !== undefined) updateData.torque = body.torque;
    if (body.fuelEconomy !== undefined) updateData.fuelEconomy = body.fuelEconomy;
    if (body.doors !== undefined) updateData.doors = body.doors;
    if (body.seatingCapacity !== undefined) updateData.seatingCapacity = body.seatingCapacity;
    if (body.exteriorColor !== undefined) updateData.exteriorColor = body.exteriorColor;
    if (body.interiorColor !== undefined) updateData.interiorColor = body.interiorColor;
    if (body.mileage !== undefined) updateData.mileage = body.mileage;
    if (body.moderationStatus !== undefined) updateData.moderationStatus = body.moderationStatus;
    if (body.lifecycleStatus !== undefined) updateData.lifecycleStatus = body.lifecycleStatus;
    // Legacy overall status mapping (kept for current clients).
    // Prefer sending `moderationStatus` and/or `lifecycleStatus` directly.
    if (body.status !== undefined && body.moderationStatus === undefined && body.lifecycleStatus === undefined) {
      const legacyStatus = String(body.status);
      if (legacyStatus === 'draft') {
        updateData.moderationStatus = 'draft';
      } else if (legacyStatus === 'published') {
        const isSuspended = !!listing.suspensionReason;
        if (isSuspended && !isAdmin) {
          // Suspended listings can be edited and resubmitted for review, but not re-activated by non-admins.
          // Keep the moderation status transition within the owner-allowed set.
          updateData.moderationStatus = 'submitted';
        } else {
          updateData.moderationStatus = listing.postedByRole === 'staff' ? 'approved' : 'submitted';
          // Resubmitting after rejection should re-activate the listing for review/publish.
          if (listing.lifecycleStatus === 'archived') {
            updateData.lifecycleStatus = 'active';
          }
          // Clear prior rejection reason on resubmit.
          updateData.rejectionReason = null;
        }
      } else if (legacyStatus === 'pending') {
        updateData.moderationStatus = 'pending_review';
      } else if (legacyStatus === 'rejected') {
        updateData.moderationStatus = 'rejected';
      } else if (['active', 'archived', 'sold', 'expired', 'deleted'].includes(legacyStatus)) {
        updateData.lifecycleStatus = legacyStatus as any;
      }
    }
    if (body.exportStatus !== undefined) updateData.exportStatus = body.exportStatus;
    if (body.warrantyType !== undefined) updateData.warrantyType = body.warrantyType;
    if (body.sellerType !== undefined) updateData.sellerType = body.sellerType;
    if (body.emirate !== undefined) updateData.emirate = body.emirate;
    if (body.city !== undefined) updateData.city = body.city;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.technicalFeatures !== undefined) updateData.technicalFeatures = body.technicalFeatures;
    if (body.extras !== undefined) updateData.extras = body.extras;
    if (body.specialNotes !== undefined) updateData.specialNotes = body.specialNotes;
    if (body.badges !== undefined) updateData.badges = body.badges;
    if (body.tags !== undefined) updateData.tags = body.tags;

    // Moderation invariants are enforced in DB mutations:
    // - `posted_by_role = user` cannot become public without admin approval.
    // - Any edit to a public user-posted listing triggers re-moderation and hides it (V1 behavior).

    // Suspension invariants (API-level guard):
    // A suspended listing is archived by admin and cannot be re-activated by the owner or partner staff.
    if (!isAdmin && listing.suspensionReason) {
      const isResubmitting =
        (body.status !== undefined && String(body.status) === 'published') ||
        (updateData.moderationStatus !== undefined &&
          (String(updateData.moderationStatus) === 'submitted' || String(updateData.moderationStatus) === 'pending_review'));

      if (isResubmitting) {
        // Keep the moderation status transition within the owner-allowed set.
        updateData.moderationStatus = 'submitted';
      }

      const attemptsToActivate =
        updateData.lifecycleStatus !== undefined &&
        listing.lifecycleStatus === 'archived' &&
        String(updateData.lifecycleStatus) === 'active';

      if (attemptsToActivate) {
        if (isResubmitting) {
          updateData.lifecycleStatus = 'archived';
        } else {
          return NextResponse.json(
            { error: 'This listing is suspended by an admin and cannot be re-activated without admin permission.' },
            { status: 403 }
          );
        }
      }
    }

    // Rejection invariants (API-level guard):
    // Prevent re-activating an admin-rejected listing unless the request also changes moderation state (resubmission).
    if (!isAdmin && listing.moderationStatus === 'rejected') {
      const attemptsToActivate =
        updateData.lifecycleStatus !== undefined &&
        listing.lifecycleStatus === 'archived' &&
        String(updateData.lifecycleStatus) === 'active';

      if (attemptsToActivate) {
        const isResubmitting =
          updateData.moderationStatus !== undefined && String(updateData.moderationStatus) !== 'rejected';

        if (!isResubmitting) {
          return NextResponse.json(
            { error: 'Rejected listings cannot be re-activated directly. Edit the listing and resubmit for review.' },
            { status: 400 }
          );
        }
      }
    }

    let success: boolean;
    
    if (isAdmin || (isPartnerListing && !isOwner)) {
      // Admins and partner staff can update any listing
      // Pass user.id for price history tracking
      success = await updateCarListingByStaff(id, updateData, user.id);
    } else {
      // Regular users can only update their own listings
      success = await updateCarListing(id, user.id, updateData);
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Listing not found or unauthorized' },
        { status: 404 }
      );
    }

    // Invalidate listing caches so edits reflect immediately
    invalidateListingCaches(id, listing.partnerId || undefined);

    const updated = await getListingModerationContext(id);
    const now = new Date();
    const isPublic =
      updated?.moderationStatus === 'approved' &&
      updated?.lifecycleStatus === 'active' &&
      !!updated?.expiresAt &&
      updated.expiresAt.getTime() > now.getTime();

    const wasPublic =
      listing.moderationStatus === 'approved' &&
      listing.lifecycleStatus === 'active' &&
      !!listing.expiresAt &&
      listing.expiresAt.getTime() > now.getTime();

    const auditAction =
      updated && listing.lifecycleStatus !== updated.lifecycleStatus
        ? updated.lifecycleStatus === 'archived'
          ? 'listing.archive'
          : listing.lifecycleStatus === 'archived' && updated.lifecycleStatus === 'active'
          ? 'listing.unarchive'
          : updated.lifecycleStatus === 'deleted'
          ? 'listing.delete'
          : 'listing.update'
        : 'listing.update';

    void createAuditLogEntry({
      action: auditAction,
      entityType: 'car_listing',
      entityId: id,
      userId: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent'),
      metadata: {
        requestedFields: Object.keys(updateData),
        isAdmin,
        isOwner,
        partnerId: listing.partnerId ?? null,
        wasPublic,
        isPublic,
      },
      oldValues: {
        moderationStatus: listing.moderationStatus,
        lifecycleStatus: listing.lifecycleStatus,
        publishedAt: listing.publishedAt ? listing.publishedAt.toISOString() : null,
        expiresAt: listing.expiresAt ? listing.expiresAt.toISOString() : null,
      },
      newValues: updated
        ? {
            moderationStatus: updated.moderationStatus,
            lifecycleStatus: updated.lifecycleStatus,
            publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
            expiresAt: updated.expiresAt ? updated.expiresAt.toISOString() : null,
          }
        : null,
    }).catch((error) => {
      console.error('[Audit] Failed to write listing update log:', error);
    });

    // Auto-match with consignment partners if it becomes public (staff-posted listings)
    // Run in background - don't block the user's response
    if (updated?.postedByRole === 'staff' && isPublic) {
      autoMatchConsignment(id).catch((error) => {
        console.error('[Consignment] Background auto-match failed:', error);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
      },
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    if (error instanceof Error && error.message.includes('Not authorized to change moderation status')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const listing = await getListingModerationContext(id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'super_admin' || user.role === 'admin';
    const isOwner = listing.userId === user.id;
    const isPartnerListing = listing.partnerId != null;
    const canManagePartner =
      !isAdmin && !isOwner && isPartnerListing
        ? await canManagePartnerListing(user as any, listing.partnerId as string)
        : false;

    if (!isOwner && !isAdmin && !(isPartnerListing && canManagePartner)) {
      return NextResponse.json(
        { error: 'Not authorized to delete this listing' },
        { status: 403 }
      );
    }

    // Check if user is admin/super_admin
    let success: boolean;
    
    if (isAdmin) {
      // Platform admins can hard delete
      success = await deleteCarListingByStaff(id);
    } else if (isPartnerListing) {
      // Partner staff: soft delete (lifecycle -> deleted)
      success = await updateCarListingByStaff(id, { lifecycleStatus: 'deleted', deletedAt: new Date() });
    } else {
      // Regular users soft delete (lifecycle -> deleted)
      success = await deleteCarListing(id, user.id);
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Listing not found or unauthorized' },
        { status: 404 }
      );
    }

    // Invalidate listing caches so removal reflects immediately
    invalidateListingCaches(id, listing.partnerId || undefined);

    void createAuditLogEntry({
      action: isAdmin ? 'listing.hard_delete' : 'listing.delete',
      entityType: 'car_listing',
      entityId: id,
      userId: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent'),
      metadata: {
        isAdmin,
        isOwner,
        partnerId: listing.partnerId ?? null,
      },
      oldValues: {
        moderationStatus: listing.moderationStatus,
        lifecycleStatus: listing.lifecycleStatus,
        publishedAt: listing.publishedAt ? listing.publishedAt.toISOString() : null,
        expiresAt: listing.expiresAt ? listing.expiresAt.toISOString() : null,
      },
      newValues: isAdmin ? null : { lifecycleStatus: 'deleted' },
    }).catch((error) => {
      console.error('[Audit] Failed to write listing delete log:', error);
    });

    return NextResponse.json({
      success: true,
      message: isAdmin ? 'Listing permanently deleted' : 'Listing deleted',
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
