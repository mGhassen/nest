"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, X, Phone, Mail, Globe } from "lucide-react";

const contactSchema = z.object({
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  fax: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface CompanyContactFormProps {
  companyId: string;
  initialData?: any;
  onSave?: (data: ContactFormData) => void;
  onCancel?: () => void;
}

export default function CompanyContactForm({ 
  companyId, 
  initialData, 
  onSave, 
  onCancel 
}: CompanyContactFormProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      website: initialData?.website || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      fax: initialData?.fax || "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Call API to update company contact
      console.log('Updating company contact:', data);
      
      toast({
        title: "Contact updated",
        description: "Company contact information has been updated successfully.",
      });
      
      onSave?.(data);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update company contact information",
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
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Manage company contact details and communication channels
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Edit Contact
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
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                {...form.register("website")}
                disabled={!isEditing}
                placeholder="https://www.example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                disabled={!isEditing}
                placeholder="contact@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                {...form.register("phone")}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                type="tel"
                {...form.register("fax")}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4568"
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
