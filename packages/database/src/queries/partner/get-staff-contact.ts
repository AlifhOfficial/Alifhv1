/**
 * Get Staff Contact Info
 * Staff member details for listing contact section
 */

import { eq } from 'drizzle-orm';
import { db } from '../../dbclient';
import { partnerStaff } from '../../schema/partner';

/**
 * Staff Contact Info - For listing contact section
 * Returns staff member details who posted the listing
 */
export async function getStaffContactInfo(staffId: string) {
  const result = await db.query.partnerStaff.findFirst({
    where: eq(partnerStaff.id, staffId),
    columns: {
      id: true,
      title: true,
      department: true,
      isPrimaryContact: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  });

  return result;
}
