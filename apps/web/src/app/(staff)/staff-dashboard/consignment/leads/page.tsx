'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/forms/button';
import { Badge } from '@/components/ui/data-display/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Car,
  Eye,
  Phone,
  Check,
  X,
  Star,
  TrendingUp,
  Clock,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Lead {
  lead: {
    id: string;
    status: string;
    isPriority: boolean;
    viewCount: number;
    createdAt: string;
    viewedAt?: string;
    contactedAt?: string;
    offerAmount?: number;
  };
  listing: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    thumbnail?: string;
    emirate: string;
    bodyType?: string;
    fuelType?: string;
  };
  user: {
    id: string;
    name: string;
    phone?: string;
    image?: string;
  };
}

interface Stats {
  total: number;
  new: number;
  viewed: number;
  contacted: number;
  inNegotiation: number;
  accepted: number;
  rejected: number;
}

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-500' },
  viewed: { label: 'Viewed', color: 'bg-purple-500' },
  interested: { label: 'Interested', color: 'bg-indigo-500' },
  contacted: { label: 'Contacted', color: 'bg-yellow-500' },
  in_negotiation: { label: 'Negotiating', color: 'bg-orange-500' },
  accepted: { label: 'Accepted', color: 'bg-green-500' },
  rejected: { label: 'Rejected', color: 'bg-red-500' },
};

export default function ConsignmentLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // Fetch leads when activeTab changes
  useEffect(() => {
    let cancelled = false;
    
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (activeTab !== 'all') {
          params.set('status', activeTab);
        }

        const response = await fetch(`/api/partner/consignment/leads?${params}`);
        if (!response.ok) throw new Error('Failed to fetch leads');

        const data = await response.json();
        if (cancelled) return;
        
        setLeads(data.leads);
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching leads:', error);
        if (!cancelled) {
          toast({ title: 'Failed to load consignment leads', variant: 'destructive' });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    
    fetchLeads();
    return () => { cancelled = true; };
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch function for manual refreshes
  const refetchLeads = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        params.set('status', activeTab);
      }

      const response = await fetch(`/api/partner/consignment/leads?${params}`);
      if (!response.ok) throw new Error('Failed to fetch leads');

      const data = await response.json();
      setLeads(data.leads);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({ title: 'Failed to load consignment leads', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/partner/consignment/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data }),
      });

      if (!response.ok) throw new Error('Failed to update lead');

      toast({ title: 'Lead updated successfully' });
      refetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({ title: 'Failed to update lead', variant: 'destructive' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(price); // Price stored as full AED, not fils
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-AE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consignment Leads</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track potential consignment opportunities
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/staff-dashboard/consignment/preferences">
            <Filter className="h-4 w-4 mr-2" />
            Preferences
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Viewed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.viewed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Contacted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contacted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Negotiating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inNegotiation}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accepted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leads List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="viewed">Viewed</TabsTrigger>
          <TabsTrigger value="contacted">Contacted</TabsTrigger>
          <TabsTrigger value="in_negotiation">Negotiating</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {leads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Car className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No consignment leads found</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/staff-dashboard/consignment/preferences">
                    Configure your preferences
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            leads.map((lead) => (
              <Card key={lead.lead.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Car Image */}
                    <div className="relative w-48 h-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                      {lead.listing.thumbnail ? (
                        <Image
                          src={lead.listing.thumbnail}
                          alt={`${lead.listing.make} ${lead.listing.model}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Car className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {lead.lead.isPriority && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-500">
                            <Star className="h-3 w-3 mr-1" />
                            Priority
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Lead Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {lead.listing.year} {lead.listing.make} {lead.listing.model}
                          </h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{lead.listing.emirate}</Badge>
                            {lead.listing.bodyType && (
                              <Badge variant="outline" className="capitalize">
                                {lead.listing.bodyType}
                              </Badge>
                            )}
                            {lead.listing.fuelType && (
                              <Badge variant="outline" className="capitalize">
                                {lead.listing.fuelType}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge
                          className={STATUS_CONFIG[lead.lead.status as keyof typeof STATUS_CONFIG]?.color}
                        >
                          {STATUS_CONFIG[lead.lead.status as keyof typeof STATUS_CONFIG]?.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Price:</span>
                          <p className="font-semibold">{formatPrice(lead.listing.price)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mileage:</span>
                          <p className="font-semibold">{lead.listing.mileage.toLocaleString()} km</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Seller:</span>
                          <p className="font-semibold">{lead.user.name}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(lead.lead.createdAt)}
                        </div>
                        {lead.lead.viewCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {lead.lead.viewCount} views
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateLeadStatus(lead.lead.id, 'priority')}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          {lead.lead.isPriority ? 'Unprioritize' : 'Prioritize'}
                        </Button>

                        {lead.lead.status === 'new' || lead.lead.status === 'viewed' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateLeadStatus(lead.lead.id, 'interested')}
                            >
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Interested
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateLeadStatus(lead.lead.id, 'reject', { rejectionReason: 'Not interested' })}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Not Interested
                            </Button>
                          </>
                        ) : lead.lead.status === 'interested' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateLeadStatus(lead.lead.id, 'contact', { contactMethod: 'message' })}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Contact Seller
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateLeadStatus(lead.lead.id, 'reject', { rejectionReason: 'Changed mind' })}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Pass
                            </Button>
                          </>
                        ) : lead.lead.status === 'contacted' ? (
                          <Button
                            size="sm"
                            onClick={() => updateLeadStatus(lead.lead.id, 'negotiate')}
                          >
                            Start Negotiation
                          </Button>
                        ) : lead.lead.status === 'in_negotiation' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateLeadStatus(lead.lead.id, 'accept')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept Deal
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateLeadStatus(lead.lead.id, 'reject', { rejectionReason: 'Could not agree on terms' })}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        ) : null}

                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/staff-dashboard/consignment/leads/${lead.lead.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
