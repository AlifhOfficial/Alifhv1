import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireAuth } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SettingsActions } from "./settings-actions";

export default async function PartnerSettingsPage() {
  const user = await requireAuth();

  // Fetch partner data
  const membership = await db
    .select({
      partnerId: schema.partnerStaff.partnerId,
      role: schema.partnerStaff.role,
    })
    .from(schema.partnerStaff)
    .where(
      and(
        eq(schema.partnerStaff.userId, user.id),
        eq(schema.partnerStaff.status, "active")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    redirect('/partner-dashboard');
  }

  const partnerId = membership[0].partnerId;

  // Fetch partner details
  const [partner] = await db
    .select()
    .from(schema.partner)
    .where(eq(schema.partner.id, partnerId))
    .limit(1);

  if (!partner) {
    redirect('/partner-dashboard');
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPercentage = (value: number | null) => {
    if (!value) return '0%';
    return `${value.toFixed(1)}%`;
  };

  return (
    <DashboardDisplayArea
      title="Settings"
      description="Manage your dealership settings and preferences"
    >
      <div className="p-6 md:p-10 space-y-12">
        {/* Account Status */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-foreground">Account Status</h2>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Status</div>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  partner.status === 'active' ? 'bg-green-100 text-green-800' :
                  partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  partner.status === 'suspended' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {partner.status}
                </span>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Membership Tier</div>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  partner.tier === 'black' ? 'bg-gray-900 text-white' :
                  partner.tier === 'platinum' ? 'bg-gray-400 text-white' :
                  partner.tier === 'gold' ? 'bg-yellow-500 text-white' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  {partner.tier}
                </span>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Verified</div>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  partner.verifiedAt ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {partner.verifiedAt ? '✓ Verified' : 'Not Verified'}
                </span>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Member Since</div>
                <div className="text-sm font-medium text-foreground">
                  {formatDate(partner.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services & Features */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Services & Features</h2>
            <SettingsActions type="services" data={partner.features} />
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'homeDelivery', label: '🚚 Home Delivery', enabled: partner.features?.homeDelivery },
                { key: 'testDriveAvailable', label: '🚗 Test Drive Available', enabled: partner.features?.testDriveAvailable },
                { key: 'financing', label: '💰 Financing Options', enabled: partner.features?.financing },
                { key: 'tradeIn', label: '🔄 Trade-In Service', enabled: partner.features?.tradeIn },
                { key: 'warranty', label: '✅ Warranty Available', enabled: partner.features?.warranty },
                { key: 'insurance', label: '🛡️ Insurance Assistance', enabled: partner.features?.insurance },
                { key: 'registration', label: '📋 Registration Service', enabled: partner.features?.registration },
                { key: 'exportAssistance', label: '🌍 Export Assistance', enabled: partner.features?.exportAssistance },
              ].map((service) => (
                <div
                  key={service.key}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    service.enabled 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium text-foreground">{service.label}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    service.enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {service.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Business Hours</h2>
            <SettingsActions type="businessHours" data={partner.businessHours} />
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-3">
              {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => {
                const daySchedule = partner.businessHours?.[day as keyof typeof partner.businessHours];
                const isClosed = !daySchedule || daySchedule.isClosed;
                
                return (
                  <div key={day} className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
                    <div className="text-sm font-medium text-foreground capitalize min-w-[100px]">
                      {day}
                    </div>
                    {isClosed ? (
                      <span className="text-sm text-muted-foreground">Closed</span>
                    ) : (
                      <span className="text-sm text-foreground">
                        {daySchedule.open} - {daySchedule.close}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-foreground">Financial Settings</h2>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Commission Rate</div>
                <div className="text-lg font-medium text-foreground">
                  {formatPercentage(partner.commissionRate)}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Subscription Plan</div>
                <div className="text-lg font-medium text-foreground">
                  {partner.subscriptionPlan ?? 'N/A'}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Payment Terms</div>
                <div className="text-lg font-medium text-foreground">
                  {partner.paymentTerms ?? 'Standard'}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Credit Limit</div>
                <div className="text-lg font-medium text-foreground">
                  {partner.creditLimit ? `AED ${(partner.creditLimit / 100).toLocaleString()}` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Notification Preferences</h2>
            <SettingsActions type="notifications" data={partner.notificationPreferences} />
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-4">
              {partner.notificationPreferences && Object.entries(partner.notificationPreferences).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-3 border-b border-border/60 last:border-0"
                >
                  <div className="text-sm font-medium text-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    value 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {value ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* License & Compliance */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-foreground">License & Compliance</h2>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Trade License</div>
                <div className="text-sm font-medium text-foreground">
                  {partner.tradeLicense}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">License Expiry</div>
                <div className="text-sm font-medium text-foreground">
                  {formatDate(partner.licenseExpiry)}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Tax Registration</div>
                <div className="text-sm font-medium text-foreground">
                  {partner.taxRegistrationNumber ?? 'N/A'}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Insurance Valid Until</div>
                <div className="text-sm font-medium text-foreground">
                  {formatDate(partner.insuranceExpiry)}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Compliance Score</div>
                <div className="text-sm font-medium text-foreground">
                  {partner.complianceScore ?? 0}/100
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Last Audit</div>
                <div className="text-sm font-medium text-foreground">
                  {formatDate(partner.lastAuditDate)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-foreground">Contact Information</h2>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Primary Email</div>
                <div className="text-sm font-medium text-foreground">
                  {partner.email}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Primary Phone</div>
                <div className="text-sm font-medium text-foreground">
                  {partner.phone}
                </div>
              </div>

              {partner.alternatePhone && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Alternate Phone</div>
                  <div className="text-sm font-medium text-foreground">
                    {partner.alternatePhone}
                  </div>
                </div>
              )}

              {partner.whatsapp && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">WhatsApp</div>
                  <div className="text-sm font-medium text-foreground">
                    {partner.whatsapp}
                  </div>
                </div>
              )}

              {partner.website && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Website</div>
                  <div className="text-sm font-medium text-foreground">
                    {partner.website}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
