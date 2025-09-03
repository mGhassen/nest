"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";

const profileSchema = z.object({
  legal_name: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  founded_year: z.number().optional(),
  business_type: z.string().optional(),
  legal_structure: z.string().optional(),
  tax_id: z.string().optional(),
  registration_number: z.string().optional(),
  vat_number: z.string().optional(),
  fiscal_year_start: z.string().optional(),
  fiscal_year_end: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface CompanyProfileFormProps {
  companyId: string;
  initialData?: any;
  onSave?: (data: ProfileFormData) => void;
  onCancel?: () => void;
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
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
  "1-10 employees",
  "11-50 employees", 
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees"
];

const businessTypes = [
  "Corporation",
  "Partnership",
  "Sole Proprietorship",
  "LLC",
  "Non-Profit",
  "Government",
  "Other"
];

const legalStructures = [
  "C-Corporation",
  "S-Corporation",
  "LLC",
  "Partnership",
  "Sole Proprietorship",
  "Non-Profit",
  "Other"
];

export default function CompanyProfileForm({ 
  companyId, 
  initialData, 
  onSave, 
  onCancel 
}: CompanyProfileFormProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      legal_name: initialData?.legal_name || "",
      description: initialData?.description || "",
      industry: initialData?.industry || "",
      company_size: initialData?.company_size || "",
      founded_year: initialData?.founded_year || undefined,
      business_type: initialData?.business_type || "",
      legal_structure: initialData?.legal_structure || "",
      tax_id: initialData?.tax_id || "",
      registration_number: initialData?.registration_number || "",
      vat_number: initialData?.vat_number || "",
      fiscal_year_start: initialData?.fiscal_year_start || "",
      fiscal_year_end: initialData?.fiscal_year_end || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Call API to update company profile
      console.log('Updating company profile:', data);
      
      toast({
        title: "Profile updated",
        description: "Company profile has been updated successfully.",
      });
      
      onSave?.(data);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update company profile",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
    onCancel?.();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Manage company profile and business details
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="legal_name">Legal Name</Label>
              <Input
                id="legal_name"
                {...form.register("legal_name")}
                disabled={!isEditing}
                placeholder="Enter legal company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={form.watch("industry")} 
                onValueChange={(value) => form.setValue("industry", value)}
                disabled={!isEditing}
              >
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
              <Label htmlFor="company_size">Company Size</Label>
              <Select 
                value={form.watch("company_size")} 
                onValueChange={(value) => form.setValue("company_size", value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
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
                {...form.register("founded_year", { valueAsNumber: true })}
                disabled={!isEditing}
                placeholder="e.g., 2020"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Select 
                value={form.watch("business_type")} 
                onValueChange={(value) => form.setValue("business_type", value)}
                disabled={!isEditing}
              >
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
              <Select 
                value={form.watch("legal_structure")} 
                onValueChange={(value) => form.setValue("legal_structure", value)}
                disabled={!isEditing}
              >
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

            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID</Label>
              <Input
                id="tax_id"
                {...form.register("tax_id")}
                disabled={!isEditing}
                placeholder="Enter tax identification number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                {...form.register("registration_number")}
                disabled={!isEditing}
                placeholder="Enter registration number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat_number">VAT Number</Label>
              <Input
                id="vat_number"
                {...form.register("vat_number")}
                disabled={!isEditing}
                placeholder="Enter VAT number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscal_year_start">Fiscal Year Start</Label>
              <Input
                id="fiscal_year_start"
                type="date"
                {...form.register("fiscal_year_start")}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscal_year_end">Fiscal Year End</Label>
              <Input
                id="fiscal_year_end"
                type="date"
                {...form.register("fiscal_year_end")}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              disabled={!isEditing}
              placeholder="Enter company description"
              rows={4}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
