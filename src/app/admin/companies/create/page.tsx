"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { 
  Building2, 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  Palette,
  Share2,
  CheckCircle,
  ArrowLeft,
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCompany } from "@/hooks/use-companies";
import { toast } from "@/hooks/use-toast";

// Comprehensive validation schema
const createCompanySchema = z.object({
  // Basic Information
  name: z.string().min(1, "Company name is required").max(255, "Company name is too long"),
  legal_name: z.string().max(255, "Legal name is too long").optional(),
  description: z.string().max(1000, "Description is too long").optional(),
  industry: z.string().min(1, "Industry is required"),
  company_size: z.string().min(1, "Company size is required"),
  founded_year: z.number().min(1800).max(new Date().getFullYear()).optional(),
  
  // Contact Information
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(50, "Phone number is too long").optional(),
  fax: z.string().max(50, "Fax number is too long").optional(),
  
  // Address Information
  address: z.string().max(255, "Address is too long").optional(),
  address_line_2: z.string().max(255, "Address line 2 is too long").optional(),
  city: z.string().max(100, "City name is too long").optional(),
  state: z.string().max(100, "State name is too long").optional(),
  country: z.string().min(1, "Country is required"),
  postal_code: z.string().max(20, "Postal code is too long").optional(),
  timezone: z.string().max(50, "Timezone is too long").optional(),
  
  // Business Information
  tax_id: z.string().max(100, "Tax ID is too long").optional(),
  registration_number: z.string().max(100, "Registration number is too long").optional(),
  vat_number: z.string().max(100, "VAT number is too long").optional(),
  business_type: z.string().max(50, "Business type is too long").optional(),
  legal_structure: z.string().max(50, "Legal structure is too long").optional(),
  
  // Financial Information
  currency: z.string().length(3, "Currency must be 3 characters").default("USD"),
  fiscal_year_start: z.string().optional(),
  fiscal_year_end: z.string().optional(),
  
  // Branding
  brand_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  
  // Social Media
  linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  twitter_url: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
  facebook_url: z.string().url("Invalid Facebook URL").optional().or(z.literal("")),
  instagram_url: z.string().url("Invalid Instagram URL").optional().or(z.literal("")),
});

type CreateCompanyFormData = z.infer<typeof createCompanySchema>;

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Consulting",
  "Media & Entertainment",
  "Transportation",
  "Energy",
  "Government",
  "Non-Profit",
  "Other"
];

const companySizes = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10000+"
];

const businessTypes = [
  "Technology Services",
  "Software Development",
  "Consulting",
  "Manufacturing",
  "Retail",
  "Healthcare",
  "Education",
  "Finance",
  "Real Estate",
  "Other"
];

const legalStructures = [
  "Corporation",
  "LLC",
  "Partnership",
  "Sole Proprietorship",
  "S-Corp",
  "C-Corp",
  "B-Corp",
  "Non-Profit",
  "SARL",
  "SAS",
  "Other"
];

const currencies = [
  "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "TND", "MAD", "EGP"
];

const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "Italy", "Spain",
  "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark",
  "Finland", "Poland", "Czech Republic", "Hungary", "Portugal", "Ireland", "Luxembourg",
  "Tunisia", "Morocco", "Algeria", "Egypt", "South Africa", "Nigeria", "Kenya",
  "Australia", "New Zealand", "Japan", "South Korea", "Singapore", "Hong Kong",
  "India", "China", "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru"
];

export default function CreateCompanyPage() {
  const router = useRouter();
  const createCompany = useCreateCompany();
  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 5;

  const form = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      currency: "USD",
      country: "United States",
      brand_color: "#D97706",
      secondary_color: "#B45309",
    },
  });

  const onSubmit = async (data: CreateCompanyFormData) => {
    try {
      // Clean up empty strings and convert dates
      const cleanedData = {
        ...data,
        website: data.website || undefined,
        email: data.email || undefined,
        linkedin_url: data.linkedin_url || undefined,
        twitter_url: data.twitter_url || undefined,
        facebook_url: data.facebook_url || undefined,
        instagram_url: data.instagram_url || undefined,
        fiscal_year_start: data.fiscal_year_start ? new Date(data.fiscal_year_start).toISOString() : undefined,
        fiscal_year_end: data.fiscal_year_end ? new Date(data.fiscal_year_end).toISOString() : undefined,
      };

      await createCompany.mutateAsync(cleanedData);
      
      toast({
        title: "Company created successfully! 🎉",
        description: `${data.name} has been created and you've been assigned as a superuser.`,
      });
      
      router.push("/admin/companies");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create company",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepTitles = [
    "Basic Information",
    "Contact & Location",
    "Business Details",
    "Branding & Social",
    "Review & Create"
  ];

  const stepIcons = [
    <Building2 className="h-5 w-5" />,
    <MapPin className="h-5 w-5" />,
    <FileText className="h-5 w-5" />,
    <Palette className="h-5 w-5" />,
    <CheckCircle className="h-5 w-5" />
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Create New Company
              </h1>
              <p className="text-muted-foreground mt-1">
                Set up a new company with comprehensive information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {stepTitles.map((title, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        currentStep > index + 1
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : currentStep === index + 1
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {currentStep > index + 1 ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          stepIcons[index]
                        )}
                        <span className="text-sm font-medium">{title}</span>
                      </div>
                      {index < totalSteps - 1 && (
                        <div className={`w-8 h-0.5 mx-2 ${
                          currentStep > index + 1 ? "bg-green-300 dark:bg-green-600" : "bg-border"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Form */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {stepIcons[currentStep - 1]}
                  {stepTitles[currentStep - 1]}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && "Provide basic information about your company"}
                  {currentStep === 2 && "Add contact details and location information"}
                  {currentStep === 3 && "Enter business and legal information"}
                  {currentStep === 4 && "Customize branding and social media presence"}
                  {currentStep === 5 && "Review all information before creating the company"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Company Name *</Label>
                          <Input
                            id="name"
                            placeholder="Enter company name"
                            {...form.register("name")}
                          />
                          {form.formState.errors.name && (
                            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="legal_name">Legal Name</Label>
                          <Input
                            id="legal_name"
                            placeholder="Enter legal name"
                            {...form.register("legal_name")}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your company's mission and services"
                          rows={4}
                          {...form.register("description")}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry *</Label>
                          <Select onValueChange={(value) => form.setValue("industry", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {industries.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_size">Company Size *</Label>
                          <Select onValueChange={(value) => form.setValue("company_size", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {companySizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size} employees
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="founded_year">Founded Year</Label>
                          <Input
                            id="founded_year"
                            type="number"
                            placeholder="2020"
                            {...form.register("founded_year", { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Contact & Location */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="website"
                              placeholder="https://example.com"
                              className="pl-10"
                              {...form.register("website")}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="contact@company.com"
                              className="pl-10"
                              {...form.register("email")}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="phone"
                              placeholder="+1 (555) 123-4567"
                              className="pl-10"
                              {...form.register("phone")}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fax">Fax</Label>
                          <Input
                            id="fax"
                            placeholder="+1 (555) 123-4568"
                            {...form.register("fax")}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Address Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              placeholder="123 Main Street"
                              {...form.register("address")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address_line_2">Address Line 2</Label>
                            <Input
                              id="address_line_2"
                              placeholder="Suite 100"
                              {...form.register("address_line_2")}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              placeholder="San Francisco"
                              {...form.register("city")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                              id="state"
                              placeholder="California"
                              {...form.register("state")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country *</Label>
                            <Select onValueChange={(value) => form.setValue("country", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postal_code">Postal Code</Label>
                            <Input
                              id="postal_code"
                              placeholder="94105"
                              {...form.register("postal_code")}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <Input
                            id="timezone"
                            placeholder="America/Los_Angeles"
                            {...form.register("timezone")}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Business Details */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="business_type">Business Type</Label>
                          <Select onValueChange={(value) => form.setValue("business_type", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                            <SelectContent>
                              {businessTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="legal_structure">Legal Structure</Label>
                          <Select onValueChange={(value) => form.setValue("legal_structure", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select legal structure" />
                            </SelectTrigger>
                            <SelectContent>
                              {legalStructures.map((structure) => (
                                <SelectItem key={structure} value={structure}>
                                  {structure}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="tax_id">Tax ID</Label>
                          <Input
                            id="tax_id"
                            placeholder="12-3456789"
                            {...form.register("tax_id")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="registration_number">Registration Number</Label>
                          <Input
                            id="registration_number"
                            placeholder="REG123456"
                            {...form.register("registration_number")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vat_number">VAT Number</Label>
                          <Input
                            id="vat_number"
                            placeholder="VAT123456789"
                            {...form.register("vat_number")}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Financial Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select onValueChange={(value) => form.setValue("currency", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem key={currency} value={currency}>
                                    {currency}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fiscal_year_start">Fiscal Year Start</Label>
                            <Input
                              id="fiscal_year_start"
                              type="date"
                              {...form.register("fiscal_year_start")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fiscal_year_end">Fiscal Year End</Label>
                            <Input
                              id="fiscal_year_end"
                              type="date"
                              {...form.register("fiscal_year_end")}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Branding & Social */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Brand Colors
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="brand_color">Primary Brand Color</Label>
                            <div className="flex gap-2">
                              <Input
                                id="brand_color"
                                type="color"
                                className="w-16 h-10 p-1"
                                {...form.register("brand_color")}
                              />
                              <Input
                                placeholder="#D97706"
                                {...form.register("brand_color")}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondary_color">Secondary Brand Color</Label>
                            <div className="flex gap-2">
                              <Input
                                id="secondary_color"
                                type="color"
                                className="w-16 h-10 p-1"
                                {...form.register("secondary_color")}
                              />
                              <Input
                                placeholder="#B45309"
                                {...form.register("secondary_color")}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Share2 className="h-5 w-5" />
                          Social Media
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                            <Input
                              id="linkedin_url"
                              placeholder="https://linkedin.com/company/your-company"
                              {...form.register("linkedin_url")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="twitter_url">Twitter URL</Label>
                            <Input
                              id="twitter_url"
                              placeholder="https://twitter.com/your-company"
                              {...form.register("twitter_url")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="facebook_url">Facebook URL</Label>
                            <Input
                              id="facebook_url"
                              placeholder="https://facebook.com/your-company"
                              {...form.register("facebook_url")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="instagram_url">Instagram URL</Label>
                            <Input
                              id="instagram_url"
                              placeholder="https://instagram.com/your-company"
                              {...form.register("instagram_url")}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Review */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          className="w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <Sparkles className="h-10 w-10 text-white" />
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-2">Ready to Create Your Company?</h3>
                        <p className="text-muted-foreground">
                          Review all the information below and click "Create Company" to proceed.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div><strong>Name:</strong> {form.watch("name")}</div>
                            <div><strong>Legal Name:</strong> {form.watch("legal_name") || "Not specified"}</div>
                            <div><strong>Industry:</strong> {form.watch("industry")}</div>
                            <div><strong>Size:</strong> {form.watch("company_size")} employees</div>
                            <div><strong>Founded:</strong> {form.watch("founded_year") || "Not specified"}</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Contact & Location</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div><strong>Website:</strong> {form.watch("website") || "Not specified"}</div>
                            <div><strong>Email:</strong> {form.watch("email") || "Not specified"}</div>
                            <div><strong>Phone:</strong> {form.watch("phone") || "Not specified"}</div>
                            <div><strong>Country:</strong> {form.watch("country")}</div>
                            <div><strong>City:</strong> {form.watch("city") || "Not specified"}</div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      Previous
                    </Button>
                    
                    {currentStep < totalSteps ? (
                      <Button type="button" onClick={nextStep}>
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={createCompany.isPending}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        {createCompany.isPending ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="mr-2"
                            >
                              <Sparkles className="h-4 w-4" />
                            </motion.div>
                            Creating Company...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Create Company
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
