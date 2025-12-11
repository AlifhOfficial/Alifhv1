/**
 * Comprehensive Design System Showcase
 * 
 * All components following Alifh Design Philosophy
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Input, Label, Textarea } from "@/components/ui";
import { Badge, Avatar, ThemeToggle } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Checkbox } from "@/components/ui";
import { RadioGroup, RadioGroupItem } from "@/components/ui";
import { Switch } from "@/components/ui";
import { Slider } from "@/components/ui";
import { Separator } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { Progress } from "@/components/ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui";
import { 
  Mail, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Info,
  Car,
  DollarSign,
  Calendar,
  MapPin,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ShowcasePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState(33);
  const [sliderValue, setSliderValue] = useState([50]);
  const { toast } = useToast();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-medium text-foreground">Design System</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Alifh Design Philosophy - Less is More
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Alerts */}
        <section className="space-y-4">
          <h2 className="text-2xl font-medium">Alerts</h2>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This is an informational message to guide the user.
              </AlertDescription>
            </Alert>

            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your vehicle listing has been successfully published.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Unable to process payment. Please check your card details.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        <Separator />

        {/* Form Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-medium">Form Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Select */}
            <div className="space-y-2">
              <Label>Vehicle Make</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toyota">Toyota</SelectItem>
                  <SelectItem value="honda">Honda</SelectItem>
                  <SelectItem value="ford">Ford</SelectItem>
                  <SelectItem value="bmw">BMW</SelectItem>
                  <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <Label>Mileage</Label>
              <Input type="number" placeholder="Enter mileage" />
            </div>

            {/* Textarea */}
            <div className="space-y-2 md:col-span-2">
              <Label>Vehicle Description</Label>
              <Textarea placeholder="Describe the vehicle condition, features, and history..." />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <Label>Features</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="leather" />
                <label htmlFor="leather" className="text-sm cursor-pointer">
                  Leather Seats
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="sunroof" />
                <label htmlFor="sunroof" className="text-sm cursor-pointer">
                  Sunroof
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="navigation" />
                <label htmlFor="navigation" className="text-sm cursor-pointer">
                  Navigation System
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="backup" />
                <label htmlFor="backup" className="text-sm cursor-pointer">
                  Backup Camera
                </label>
              </div>
            </div>
          </div>

          {/* Radio Group */}
          <div className="space-y-3">
            <Label>Condition</Label>
            <RadioGroup defaultValue="excellent">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="excellent" />
                <Label htmlFor="excellent" className="font-normal cursor-pointer">
                  Excellent
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="good" />
                <Label htmlFor="good" className="font-normal cursor-pointer">
                  Good
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="fair" />
                <Label htmlFor="fair" className="font-normal cursor-pointer">
                  Fair
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Featured Listing</Label>
              <p className="text-xs text-muted-foreground">
                Boost visibility with a featured badge
              </p>
            </div>
            <Switch />
          </div>

          {/* Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Price Range</Label>
              <span className="text-sm text-muted-foreground">
                ${sliderValue[0]}k
              </span>
            </div>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={200}
              step={5}
            />
          </div>
        </section>

        <Separator />

        {/* Tabs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-medium">Tabs</h2>
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Details</CardTitle>
                  <CardDescription>
                    Key information about this vehicle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Year</p>
                      <p className="text-sm font-medium">2022</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Make</p>
                      <p className="text-sm font-medium">Toyota</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Model</p>
                      <p className="text-sm font-medium">Camry</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Mileage</p>
                      <p className="text-sm font-medium">25,000 mi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Engine, transmission, fuel economy, and more.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Previous owners, accidents, and service records.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <Separator />

        {/* Accordion */}
        <section className="space-y-4">
          <h2 className="text-2xl font-medium">Accordion</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
              <AccordionContent>
                We accept all major credit cards, debit cards, bank transfers, and financing options through our partner lenders.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Do you offer warranties?</AccordionTrigger>
              <AccordionContent>
                Yes, all vehicles come with a comprehensive warranty. Extended warranty options are also available for purchase.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I schedule a test drive?</AccordionTrigger>
              <AccordionContent>
                Absolutely! You can schedule a test drive online or contact our sales team directly. Test drives are available 7 days a week.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <Separator />

        {/* Progress & Skeleton */}
        <section className="space-y-6">
          <h2 className="text-2xl font-medium">Loading States</h2>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Upload Progress</Label>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setProgress(Math.max(0, progress - 10))}
              >
                Decrease
              </Button>
              <Button
                size="sm"
                onClick={() => setProgress(Math.min(100, progress + 10))}
              >
                Increase
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Loading Skeleton</Label>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </section>

        <Separator />

        {/* Buttons & Badges */}
        <section className="space-y-6">
          <h2 className="text-2xl font-medium">Buttons & Badges</h2>
          
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>New</Badge>
            <Badge variant="secondary">Featured</Badge>
            <Badge variant="outline">Certified</Badge>
            <Badge variant="destructive">Sold</Badge>
          </div>
        </section>

        <Separator />

        {/* Vehicle Card Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-medium">Vehicle Card</h2>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>2022 Toyota Camry XLE</CardTitle>
                  <CardDescription>Sedan • Automatic • 25,000 mi</CardDescription>
                </div>
                <Badge>Featured</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xl font-medium">$28,500</span>
                </div>
                <Badge variant="secondary">Excellent</Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">2022</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sedan</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Los Angeles, CA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Automatic</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">View Details</Button>
                <Button variant="outline" size="icon">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Toast Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-medium">Toast Notifications</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  title: "Listing Published",
                  description: "Your vehicle is now live on the marketplace.",
                });
              }}
            >
              Show Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Something went wrong. Please try again.",
                });
              }}
            >
              Show Error
            </Button>
          </div>
        </section>

        {/* Dialog Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-medium">Modal Dialog</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Schedule Test Drive</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Test Drive</DialogTitle>
                <DialogDescription>
                  Choose your preferred date and time for a test drive.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input type="tel" placeholder="(555) 123-4567" />
                </div>
                <Button className="w-full">Confirm Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </div>
  );
}
