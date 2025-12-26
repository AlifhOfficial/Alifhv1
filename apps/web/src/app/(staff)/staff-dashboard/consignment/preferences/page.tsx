'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/forms/button';
import { Switch } from '@/components/ui/forms/switch';
import { Label } from '@/components/ui/forms/label';
import { Input } from '@/components/ui/forms/input';
import { Badge } from '@/components/ui/data-display/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';

interface ConsignmentPreferences {
  id: string;
  isEnabled: boolean;
  makes: string[];
  models: string[];
  bodyTypes: string[];
  fuelTypes: string[];
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  maxMileage?: number;
  emirates: string[];
  preferredSpecs: string[];
  excludeAccidents: boolean;
  onlyVerifiedSellers: boolean;
  priorityScore: number;
  notifyOnNewLead: boolean;
  maxLeadsPerDay?: number;
}

const BODY_TYPES = ['sedan', 'suv', 'coupe', 'convertible', 'hatchback', 'wagon', 'pickup', 'van', 'sports', 'luxury'];
const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid'];
const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
const SPECS = ['gcc', 'american', 'european', 'japanese', 'canadian'];

export default function ConsignmentPreferencesPage() {
  const [preferences, setPreferences] = useState<ConsignmentPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/partner/consignment/preferences');
      if (!response.ok) throw new Error('Failed to fetch preferences');
      const data = await response.json();
      setPreferences(data.preferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({ title: 'Failed to load consignment preferences', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/partner/consignment/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      toast({ title: 'Consignment preferences saved successfully' });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({ title: 'Failed to save preferences', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleArrayItem = (key: keyof ConsignmentPreferences, value: string) => {
    if (!preferences) return;
    const array = (preferences[key] as string[]) || [];
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
    setPreferences({ ...preferences, [key]: newArray });
  };

  const addMake = () => {
    if (!preferences || !newMake.trim()) return;
    if (preferences.makes.includes(newMake.trim())) {
      toast({ title: 'This make is already added', variant: 'destructive' });
      return;
    }
    setPreferences({
      ...preferences,
      makes: [...preferences.makes, newMake.trim()],
    });
    setNewMake('');
  };

  const addModel = () => {
    if (!preferences || !newModel.trim()) return;
    if (preferences.models.includes(newModel.trim())) {
      toast({ title: 'This model is already added', variant: 'destructive' });
      return;
    }
    setPreferences({
      ...preferences,
      models: [...preferences.models, newModel.trim()],
    });
    setNewModel('');
  };

  const removeMake = (make: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      makes: preferences.makes.filter(m => m !== make),
    });
  };

  const removeModel = (model: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      models: preferences.models.filter(m => m !== model),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Failed to load preferences</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Consignment Preferences</h1>
        <p className="text-muted-foreground mt-2">
          Configure your criteria for receiving consignment leads
        </p>
      </div>

      {/* Enable/Disable */}
      <Card>
        <CardHeader>
          <CardTitle>Consignment Leads</CardTitle>
          <CardDescription>
            Receive leads from users who are open to consigning their cars
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enable Consignment Leads</Label>
            <Switch
              id="enabled"
              checked={preferences.isEnabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, isEnabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {preferences.isEnabled && (
        <>
          {/* Vehicle Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Filters</CardTitle>
              <CardDescription>Specify what types of vehicles you're interested in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Makes */}
              <div className="space-y-2">
                <Label>Preferred Makes</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Mercedes-Benz, BMW"
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addMake()}
                  />
                  <Button onClick={addMake} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {preferences.makes.map((make) => (
                    <Badge key={make} variant="secondary" className="gap-1">
                      {make}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeMake(make)}
                      />
                    </Badge>
                  ))}
                </div>
                {preferences.makes.length === 0 && (
                  <p className="text-sm text-muted-foreground">All makes accepted</p>
                )}
              </div>

              {/* Models */}
              <div className="space-y-2">
                <Label>Preferred Models</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., C-Class, X5"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addModel()}
                  />
                  <Button onClick={addModel} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {preferences.models.map((model) => (
                    <Badge key={model} variant="secondary" className="gap-1">
                      {model}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeModel(model)}
                      />
                    </Badge>
                  ))}
                </div>
                {preferences.models.length === 0 && (
                  <p className="text-sm text-muted-foreground">All models accepted</p>
                )}
              </div>

              {/* Body Types */}
              <div className="space-y-2">
                <Label>Body Types</Label>
                <div className="flex flex-wrap gap-2">
                  {BODY_TYPES.map((type) => (
                    <Badge
                      key={type}
                      variant={preferences.bodyTypes.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleArrayItem('bodyTypes', type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Fuel Types */}
              <div className="space-y-2">
                <Label>Fuel Types</Label>
                <div className="flex flex-wrap gap-2">
                  {FUEL_TYPES.map((type) => (
                    <Badge
                      key={type}
                      variant={preferences.fuelTypes.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleArrayItem('fuelTypes', type)}
                    >
                      {type.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price & Year Range */}
          <Card>
            <CardHeader>
              <CardTitle>Price & Year Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Year</Label>
                  <Input
                    type="number"
                    placeholder="2020"
                    value={preferences.minYear || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        minYear: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Year</Label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={preferences.maxYear || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        maxYear: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Price (AED)</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={preferences.minPrice || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        minPrice: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Price (AED)</Label>
                  <Input
                    type="number"
                    placeholder="500000"
                    value={preferences.maxPrice || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        maxPrice: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Mileage (km)</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={preferences.maxMileage || ''}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      maxMileage: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Specs */}
          <Card>
            <CardHeader>
              <CardTitle>Location & Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Emirates</Label>
                <div className="flex flex-wrap gap-2">
                  {EMIRATES.map((emirate) => (
                    <Badge
                      key={emirate}
                      variant={preferences.emirates.includes(emirate) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem('emirates', emirate)}
                    >
                      {emirate}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Specs</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECS.map((spec) => (
                    <Badge
                      key={spec}
                      variant={preferences.preferredSpecs.includes(spec) ? 'default' : 'outline'}
                      className="cursor-pointer uppercase"
                      onClick={() => toggleArrayItem('preferredSpecs', spec)}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Only Accident-Free Vehicles</Label>
                <Switch
                  checked={preferences.excludeAccidents}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, excludeAccidents: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Only Verified Sellers</Label>
                <Switch
                  checked={preferences.onlyVerifiedSellers}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, onlyVerifiedSellers: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Notify on New Lead</Label>
                <Switch
                  checked={preferences.notifyOnNewLead}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, notifyOnNewLead: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Max Leads Per Day</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={preferences.maxLeadsPerDay || ''}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      maxLeadsPerDay: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={fetchPreferences} disabled={isSaving}>
          Reset
        </Button>
        <Button onClick={savePreferences} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
