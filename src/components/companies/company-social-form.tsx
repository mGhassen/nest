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
import { Save, X, Share2, ExternalLink } from "lucide-react";

const socialSchema = z.object({
  linkedin_url: z.string().url().optional().or(z.literal("")),
  twitter_url: z.string().url().optional().or(z.literal("")),
  facebook_url: z.string().url().optional().or(z.literal("")),
  instagram_url: z.string().url().optional().or(z.literal("")),
});

type SocialFormData = z.infer<typeof socialSchema>;

interface CompanySocialFormProps {
  companyId: string;
  initialData?: any;
  onSave?: (data: SocialFormData) => void;
  onCancel?: () => void;
}

export default function CompanySocialForm({ 
  companyId, 
  initialData, 
  onSave, 
  onCancel 
}: CompanySocialFormProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<SocialFormData>({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      linkedin_url: initialData?.linkedin_url || "",
      twitter_url: initialData?.twitter_url || "",
      facebook_url: initialData?.facebook_url || "",
      instagram_url: initialData?.instagram_url || "",
    },
  });

  const onSubmit = async (data: SocialFormData) => {
    try {
      // Call API to update company social
      console.log('Updating company social:', data);
      
      toast({
        title: "Social media updated",
        description: "Company social media links have been updated successfully.",
      });
      
      onSave?.(data);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update company social media links",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
    onCancel?.();
  };

  const socialPlatforms = [
    {
      key: 'linkedin_url',
      label: 'LinkedIn',
      placeholder: 'https://linkedin.com/company/your-company',
      icon: '💼'
    },
    {
      key: 'twitter_url',
      label: 'Twitter',
      placeholder: 'https://twitter.com/your-company',
      icon: '🐦'
    },
    {
      key: 'facebook_url',
      label: 'Facebook',
      placeholder: 'https://facebook.com/your-company',
      icon: '📘'
    },
    {
      key: 'instagram_url',
      label: 'Instagram',
      placeholder: 'https://instagram.com/your-company',
      icon: '📷'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Social Media
            </CardTitle>
            <CardDescription>
              Manage company social media profiles and links
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Edit Social Media
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
            {socialPlatforms.map((platform) => (
              <div key={platform.key} className="space-y-2">
                <Label htmlFor={platform.key} className="flex items-center gap-2">
                  <span className="text-lg">{platform.icon}</span>
                  {platform.label}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={platform.key}
                    type="url"
                    {...form.register(platform.key as keyof SocialFormData)}
                    disabled={!isEditing}
                    placeholder={platform.placeholder}
                    className="flex-1"
                  />
                  {form.watch(platform.key as keyof SocialFormData) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(form.watch(platform.key as keyof SocialFormData), '_blank')}
                      disabled={!isEditing}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Social Media Preview */}
          <div className="space-y-2">
            <Label>Social Media Preview</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {socialPlatforms.map((platform) => {
                const url = form.watch(platform.key as keyof SocialFormData);
                return (
                  <div key={platform.key} className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">{platform.icon}</span>
                    </div>
                    <div className="text-sm font-medium">{platform.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {url ? 'Connected' : 'Not set'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
