import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireAuth } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ProfileActions } from "./profile-actions";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Award,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Car,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Shield,
  FileText,
  BadgeCheck
} from "lucide-react";

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'suspended': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const services = [
    { key: 'homeDelivery', label: 'Home Delivery', icon: Truck },
    { key: 'testDriveAvailable', label: 'Test Drive', icon: Car },
    { key: 'financing', label: 'Financing', icon: CreditCard },
    { key: 'tradeIn', label: 'Trade-In', icon: RefreshCw },
    { key: 'warranty', label: 'Warranty', icon: ShieldCheck },
    { key: 'insurance', label: 'Insurance', icon: Shield },
    { key: 'registration', label: 'Registration', icon: FileText },
    { key: 'exportAssistance', label: 'Export', icon: Globe },
  ];

  return (
    <DashboardDisplayArea
      title="Company Profile"
      description="View and manage your dealership information"
      action={<ProfileActions partner={partner} />}
    >
      <div className="max-w-5xl mx-auto px-8 py-12 space-y-12">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-medium text-foreground">{partner.companyNameLegal || partner.brandName}</h2>
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
              {partner.isVerified && (
                <>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5 text-blue-600/80">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Verified Dealer</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {partner.brandName && (
             <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Brand Name</div>
                <div className="text-sm font-medium">{partner.brandName}</div>
             </div>
          )}
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Contact & Location */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Contact & Location</h2>
              <p className="text-sm text-muted-foreground mt-1">How customers can reach you</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Address</div>
                  <div className="text-sm text-muted-foreground mt-1">{partner.address || 'No address provided'}</div>
                  <div className="text-xs text-muted-foreground mt-1">{partner.emirate || 'Emirate not specified'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Website</div>
                  {partner.website ? (
                    <a 
                      href={partner.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-muted-foreground mt-1 hover:text-foreground transition-colors block"
                    >
                      {partner.website}
                    </a>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-1">Not provided</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm text-muted-foreground mt-1">{partner.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Phone</div>
                  <div className="text-sm text-muted-foreground mt-1">{partner.phone}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Business Details */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Business Details</h2>
              <p className="text-sm text-muted-foreground mt-1">Operational information</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" />
                Experience
              </div>
              <div className="text-lg font-medium">{partner.experienceYears ? `${partner.experienceYears} Years` : 'N/A'}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Founded
              </div>
              <div className="text-lg font-medium">{partner.foundedYear || 'N/A'}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                Showrooms
              </div>
              <div className="text-lg font-medium">{partner.showroomCount || 0}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="w-3.5 h-3.5" />
                Trade License
              </div>
              <div className="text-sm font-medium truncate" title={partner.tradeLicense}>{partner.tradeLicense}</div>
              <div className="text-xs text-muted-foreground">Exp: {formatDate(partner.tradeLicenseExpiry)}</div>
            </div>
          </div>

          {partner.description && (
            <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/40">
              <p className="text-sm text-muted-foreground leading-relaxed">{partner.description}</p>
            </div>
          )}
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Services & Features */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Services & Features</h2>
              <p className="text-sm text-muted-foreground mt-1">Services offered to customers</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((service) => {
              const isEnabled = partner.features?.[service.key];
              return (
                <div
                  key={service.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isEnabled 
                      ? 'border-border/60 bg-background' 
                      : 'border-transparent opacity-40'
                  }`}
                >
                  <service.icon className={`w-4 h-4 ${isEnabled ? 'text-foreground' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">{service.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Business Hours */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Business Hours</h2>
              <p className="text-sm text-muted-foreground mt-1">Weekly schedule</p>
            </div>
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
      </div>
    </DashboardDisplayArea>
  );
}
