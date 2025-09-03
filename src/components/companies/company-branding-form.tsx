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
import { Save, X, Palette, Image, 
  Building2, Users, Lightbulb, Briefcase, 
  Heart, Star, Zap, Shield, Globe, 
  Target, Rocket, Coffee, Home, 
  Car, Plane, Ship, Truck } from "lucide-react";

const brandingSchema = z.object({
  brand_color: z.string().optional(),
  secondary_color: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
  icon_name: z.string().optional(),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

interface CompanyBrandingFormProps {
  companyId: string;
  initialData?: any;
  onSave?: (data: BrandingFormData) => void;
  onCancel?: () => void;
}

const iconOptions = [
  { name: 'Building2', component: Building2, label: 'Building' },
  { name: 'Users', component: Users, label: 'Users' },
  { name: 'Lightbulb', component: Lightbulb, label: 'Lightbulb' },
  { name: 'Briefcase', component: Briefcase, label: 'Briefcase' },
  { name: 'Heart', component: Heart, label: 'Heart' },
  { name: 'Star', component: Star, label: 'Star' },
  { name: 'Zap', component: Zap, label: 'Zap' },
  { name: 'Shield', component: Shield, label: 'Shield' },
  { name: 'Globe', component: Globe, label: 'Globe' },
  { name: 'Target', component: Target, label: 'Target' },
  { name: 'Rocket', component: Rocket, label: 'Rocket' },
  { name: 'Coffee', component: Coffee, label: 'Coffee' },
  { name: 'Home', component: Home, label: 'Home' },
  { name: 'Car', component: Car, label: 'Car' },
  { name: 'Plane', component: Plane, label: 'Plane' },
  { name: 'Ship', component: Ship, label: 'Ship' },
  { name: 'Truck', component: Truck, label: 'Truck' },
];

export default function CompanyBrandingForm({ 
  companyId, 
  initialData, 
  onSave, 
  onCancel 
}: CompanyBrandingFormProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      brand_color: initialData?.brand_color || "",
      secondary_color: initialData?.secondary_color || "",
      logo_url: initialData?.logo_url || "",
      icon_name: initialData?.icon_name || "",
    },
  });

  const onSubmit = async (data: BrandingFormData) => {
    try {
      // Call API to update company branding
      console.log('Updating company branding:', data);
      
      toast({
        title: "Branding updated",
        description: "Company branding has been updated successfully.",
      });
      
      onSave?.(data);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update company branding",
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
              <Palette className="h-5 w-5" />
              Branding & Visual Identity
            </CardTitle>
            <CardDescription>
              Manage company colors, logo, and visual branding
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Edit Branding
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
              <Label htmlFor="brand_color" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Primary Brand Color
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="brand_color"
                  type="color"
                  {...form.register("brand_color")}
                  disabled={!isEditing}
                  className="w-16 h-10 p-1"
                />
                <Input
                  {...form.register("brand_color")}
                  disabled={!isEditing}
                  placeholder="#FF6B35"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Secondary Color
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  {...form.register("secondary_color")}
                  disabled={!isEditing}
                  className="w-16 h-10 p-1"
                />
                <Input
                  {...form.register("secondary_color")}
                  disabled={!isEditing}
                  placeholder="#4A90E2"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Logo URL
            </Label>
            <Input
              id="logo_url"
              type="url"
              {...form.register("logo_url")}
              disabled={!isEditing}
              placeholder="https://example.com/logo.png"
            />
            {form.watch("logo_url") && (
              <div className="mt-2">
                <img 
                  src={form.watch("logo_url")} 
                  alt="Company logo" 
                  className="h-16 w-16 object-contain border rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Company Icon
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((icon) => {
                const IconComponent = icon.component;
                const isSelected = form.watch("icon_name") === icon.name;
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => form.setValue("icon_name", icon.name)}
                    disabled={!isEditing}
                    className={`p-3 border rounded-lg flex flex-col items-center gap-1 transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="text-xs text-center">{icon.label}</span>
                  </button>
                );
              })}
            </div>
            {form.watch("icon_name") && (
              <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Selected icon:</span>
                  {(() => {
                    const selectedIcon = iconOptions.find(icon => icon.name === form.watch("icon_name"));
                    const IconComponent = selectedIcon?.component;
                    return IconComponent ? (
                      <>
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">{selectedIcon.label}</span>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Color Preview */}
          {(form.watch("brand_color") || form.watch("secondary_color")) && (
            <div className="space-y-2">
              <Label>Color Preview</Label>
              <div className="flex items-center gap-4">
                {form.watch("brand_color") && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: form.watch("brand_color") }}
                    />
                    <span className="text-sm text-muted-foreground">Primary</span>
                  </div>
                )}
                {form.watch("secondary_color") && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: form.watch("secondary_color") }}
                    />
                    <span className="text-sm text-muted-foreground">Secondary</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
