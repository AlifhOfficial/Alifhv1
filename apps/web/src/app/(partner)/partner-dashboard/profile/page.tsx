import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireAuth } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ProfileActions } from "./profile-actions";

export default async function PartnerProfilePage() {
  const user = await requireAuth();

  // Fetch partner data
  const membership = await db
    .select({
      partner: schema.partner,
    })
    .from(schema.partnerStaff)
    .leftJoin(schema.partner, eq(schema.partnerStaff.partnerId, schema.partner.id))
    .where(
      and(
        eq(schema.partnerStaff.userId, user.id),
        eq(schema.partnerStaff.status, "active")
      )
    )
    .limit(1);

  const partner = membership[0]?.partner;

  if (!partner) {
    redirect('/partner-dashboard');
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <DashboardDisplayArea
      title="Company Profile"
      description="View and manage your dealership information"
      action={<ProfileActions partner={partner} />}
    >
      <div className="p-6 md:p-10 space-y-12">
        {/* Company Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-foreground">Company Information</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Legal Name</label>
              <div className="text-sm text-foreground">{partner.companyNameLegal}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Brand Name</label>
              <div className="text-sm text-foreground">{partner.brandName}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Trade License</label>
              <div className="text-sm text-foreground font-mono">{partner.tradeLicense}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">License Expiry</label>
              <div className="text-sm text-foreground">{formatDate(partner.tradeLicenseExpiry)}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Email</label>
              <div className="text-sm text-foreground">{partner.email}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Phone</label>
              <div className="text-sm text-foreground">{partner.phone}</div>
            </div>

            {partner.website && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Website</label>
                <div className="text-sm text-foreground">
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {partner.website}
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Emirate</label>
              <div className="text-sm text-foreground">{partner.emirate || 'N/A'}</div>
            </div>
          </div>

          {partner.address && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Address</label>
              <div className="text-sm text-foreground">{partner.address}</div>
            </div>
          )}

          {partner.description && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Description</label>
              <div className="text-sm text-foreground leading-relaxed">{partner.description}</div>
            </div>
          )}
        </div>

        <div className="border-t border-border/60" />

        {/* Business Details */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-foreground">Business Details</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            {partner.experienceYears && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Experience</label>
                <div className="text-sm text-foreground">{partner.experienceYears} years</div>
              </div>
            )}

            {partner.foundedYear && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Founded</label>
                <div className="text-sm text-foreground">{partner.foundedYear}</div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Showrooms</label>
              <div className="text-sm text-foreground">{partner.showroomCount}</div>
            </div>
          </div>

          {partner.specialties && partner.specialties.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Specialties</label>
              <div className="flex flex-wrap gap-2">
                {partner.specialties.map((specialty, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium bg-muted text-foreground rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {partner.badges && partner.badges.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Badges</label>
              <div className="flex flex-wrap gap-2">
                {partner.badges.map((badge, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border/60" />

        {/* Services & Features */}
        {partner.features && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-foreground">Services & Features</h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(partner.features).map(([key, value]) => (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    value ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`text-2xl ${value ? '' : 'opacity-30'}`}>
                    {key === 'homeDelivery' && '🚚'}
                    {key === 'testDriveAvailable' && '🚗'}
                    {key === 'financing' && '💳'}
                    {key === 'tradeIn' && '🔄'}
                    {key === 'warranty' && '✓'}
                    {key === 'insurance' && '🛡️'}
                    {key === 'registration' && '📋'}
                    {key === 'exportAssistance' && '✈️'}
                  </div>
                  <div className={value ? 'text-foreground' : 'text-muted-foreground'}>
                    <div className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-xs">
                      {value ? 'Available' : 'Not offered'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border/60" />

        {/* Business Hours */}
        {partner.businessHours && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-foreground">Business Hours</h2>
            
            <div className="space-y-3">
              {Object.entries(partner.businessHours).map(([day, hours]: [string, any]) => (
                <div
                  key={day}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
                >
                  <div className="text-sm font-medium text-foreground capitalize">
                    {day}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {hours.isClosed ? (
                      <span className="text-red-600">Closed</span>
                    ) : (
                      <span>{hours.open} - {hours.close}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border/60" />

        {/* Account Status */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-foreground">Account Status</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Status</label>
              <div className="text-sm text-foreground">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  partner.status === 'active' ? 'bg-green-100 text-green-800' :
                  partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {partner.status}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Tier</label>
              <div className="text-sm text-foreground">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  partner.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                  partner.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                  partner.tier === 'black' ? 'bg-gray-900 text-white' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {partner.tier?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Verified</label>
              <div className="text-sm text-foreground">
                {partner.isVerified ? (
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not verified</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Member Since</label>
              <div className="text-sm text-foreground">{formatDate(partner.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
