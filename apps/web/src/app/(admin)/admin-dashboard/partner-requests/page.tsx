import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireRole } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

export default async function PartnerRequestsPage() {
  const user = await requireRole("admin");

  // Fetch partner requests with user info
  const requests = await db
    .select({
      id: schema.partnerRequest.id,
      companyNameLegal: schema.partnerRequest.companyNameLegal,
      brandName: schema.partnerRequest.brandName,
      tradeLicense: schema.partnerRequest.tradeLicense,
      email: schema.partnerRequest.email,
      phone: schema.partnerRequest.phone,
      emirate: schema.partnerRequest.emirate,
      status: schema.partnerRequest.status,
      experienceYears: schema.partnerRequest.experienceYears,
      specialties: schema.partnerRequest.specialties,
      createdAt: schema.partnerRequest.createdAt,
      reviewedAt: schema.partnerRequest.reviewedAt,
      rejectionReason: schema.partnerRequest.rejectionReason,
      user: {
        name: schema.user.name,
        email: schema.user.email,
      },
    })
    .from(schema.partnerRequest)
    .leftJoin(schema.user, eq(schema.partnerRequest.userId, schema.user.id))
    .orderBy(desc(schema.partnerRequest.createdAt))
    .limit(100);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <DashboardDisplayArea
      title="Partner Applications"
      description="Review and manage partner applications"
    >
      <div className="p-6 md:p-10">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Pending Review</div>
            <div className="text-2xl font-semibold text-foreground">{pendingCount}</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Approved</div>
            <div className="text-2xl font-semibold text-foreground">{approvedCount}</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Rejected</div>
            <div className="text-2xl font-semibold text-foreground">{rejectedCount}</div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">All Applications</h2>
            <div className="text-sm text-muted-foreground">{requests.length} applications</div>
          </div>

          {requests.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground">No partner applications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  href={`/admin-dashboard/partner-requests/${request.id}`}
                  className="block bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-medium text-foreground">
                          {request.brandName || request.companyNameLegal}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Legal Name</div>
                          <div className="text-sm text-foreground mt-1">{request.companyNameLegal}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Trade License</div>
                          <div className="text-sm text-foreground mt-1">{request.tradeLicense}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Emirate</div>
                          <div className="text-sm text-foreground mt-1">{request.emirate || 'N/A'}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Experience</div>
                          <div className="text-sm text-foreground mt-1">
                            {request.experienceYears ? `${request.experienceYears} years` : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {request.specialties && request.specialties.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-muted-foreground mb-2">Specialties</div>
                          <div className="flex flex-wrap gap-2">
                            {request.specialties.slice(0, 3).map((specialty, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2 py-1 text-xs bg-muted text-foreground rounded"
                              >
                                {specialty}
                              </span>
                            ))}
                            {request.specialties.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                                +{request.specialties.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="text-xs text-red-600 font-medium mb-1">Rejection Reason</div>
                          <div className="text-sm text-red-700">{request.rejectionReason}</div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-border/60">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Applied by: {request.user?.name || request.user?.email || 'Unknown'}</span>
                          <span>
                            {request.status === 'pending' 
                              ? `Submitted ${new Date(request.createdAt).toLocaleDateString()}`
                              : `Reviewed ${request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : 'N/A'}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
