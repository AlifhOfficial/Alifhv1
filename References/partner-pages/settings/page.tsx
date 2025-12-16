import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireAuth } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SettingsActions } from "./settings-actions";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  BadgeCheck, 
  Calendar, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  FileText, 
  Mail, 
  Phone, 
  Globe, 
  MessageCircle,
  Clock,
  Truck,
  Car,
  RefreshCw,
  Shield,
  FileCheck,
  AlertTriangle,
  Wallet,
  Percent,
  Award
} from "lucide-react";

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'suspended': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardDisplayArea
      title="Settings"
      description="Manage your dealership settings and preferences"
    >
      <div className="max-w-5xl mx-auto px-8 py-12 space-y-12">
        {/* Account Status Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-medium text-foreground">{partner.name || 'Dealership Account'}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                {getStatusIcon(partner.status)}
                <span className="capitalize">{partner.status}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span className="capitalize">{partner.tier} Tier</span>
              </div>
              {partner.verifiedAt && (
                <>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Member Since</div>
            <div className="text-sm font-medium">{formatDate(partner.createdAt)}</div>
          </div>
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Services & Features */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Services & Features</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage your dealership services</p>
            </div>
            <SettingsActions type="services" data={partner.features} />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { key: 'homeDelivery', label: 'Home Delivery', icon: Truck, enabled: partner.features?.homeDelivery },
              { key: 'testDriveAvailable', label: 'Test Drive', icon: Car, enabled: partner.features?.testDriveAvailable },
              { key: 'financing', label: 'Financing', icon: CreditCard, enabled: partner.features?.financing },
              { key: 'tradeIn', label: 'Trade-In', icon: RefreshCw, enabled: partner.features?.tradeIn },
              { key: 'warranty', label: 'Warranty', icon: ShieldCheck, enabled: partner.features?.warranty },
              { key: 'insurance', label: 'Insurance', icon: Shield, enabled: partner.features?.insurance },
              { key: 'registration', label: 'Registration', icon: FileText, enabled: partner.features?.registration },
              { key: 'exportAssistance', label: 'Export', icon: Globe, enabled: partner.features?.exportAssistance },
            ].map((service) => (
              <div
                key={service.key}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  service.enabled 
                    ? 'border-border bg-background' 
                    : 'border-transparent opacity-50'
                }`}
              >
                <service.icon className={`w-4 h-4 ${service.enabled ? 'text-foreground' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">{service.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Business Hours */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Business Hours</h2>
              <p className="text-sm text-muted-foreground mt-1">Set your operating hours</p>
            </div>
            <SettingsActions type="businessHours" data={partner.businessHours} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
              const daySchedule = partner.businessHours?.[day as keyof typeof partner.businessHours];
              const isClosed = !daySchedule || daySchedule.isClosed;
              
              return (
                <div key={day} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                  <span className="text-sm font-medium capitalize text-muted-foreground">{day}</span>
                  {isClosed ? (
                    <span className="text-sm text-muted-foreground">Closed</span>
                  ) : (
                    <span className="text-sm font-medium">
                      {daySchedule.open} - {daySchedule.close}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Financial Settings */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Financial Settings</h2>
              <p className="text-sm text-muted-foreground mt-1">Billing and commission details</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Percent className="w-3.5 h-3.5" />
                Commission Rate
              </div>
              <div className="text-lg font-medium">{formatPercentage(partner.commissionRate)}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Award className="w-3.5 h-3.5" />
                Subscription Plan
              </div>
              <div className="text-lg font-medium capitalize">{partner.subscriptionPlan ?? 'N/A'}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="w-3.5 h-3.5" />
                Payment Terms
              </div>
              <div className="text-lg font-medium">{partner.paymentTerms ?? 'Standard'}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wallet className="w-3.5 h-3.5" />
                Credit Limit
              </div>
              <div className="text-lg font-medium">
                {partner.creditLimit ? `AED ${(partner.creditLimit / 100).toLocaleString()}` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Notification Preferences */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage your alerts</p>
            </div>
            <SettingsActions type="notifications" data={partner.notificationPreferences} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {partner.notificationPreferences && Object.entries(partner.notificationPreferences).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {value ? (
                  <CheckCircle2 className="w-4 h-4 text-foreground" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* License & Compliance */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">License & Compliance</h2>
              <p className="text-sm text-muted-foreground mt-1">Legal documents and status</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Trade License</div>
                  <div className="text-sm text-muted-foreground mt-1">{partner.tradeLicense}</div>
                  <div className="text-xs text-muted-foreground mt-1">Expires: {formatDate(partner.licenseExpiry)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Tax Registration</div>
                  <div className="text-sm text-muted-foreground mt-1">{partner.taxRegistrationNumber ?? 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Insurance</div>
                  <div className="text-sm text-muted-foreground mt-1">Valid until {formatDate(partner.insuranceExpiry)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Compliance Score</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-foreground" 
                        style={{ width: `${partner.complianceScore ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{partner.complianceScore ?? 0}/100</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Last Audit: {formatDate(partner.lastAuditDate)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Contact Information */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Contact Information</h2>
              <p className="text-sm text-muted-foreground mt-1">Public contact details</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{partner.email}</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{partner.phone}</span>
            </div>

            {partner.alternatePhone && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{partner.alternatePhone}</span>
              </div>
            )}

            {partner.whatsapp && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{partner.whatsapp}</span>
              </div>
            )}

            {partner.website && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                  {partner.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
