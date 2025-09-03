"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Building2, 
  ArrowLeft,
  Edit,
  Users,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  Shield
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserCompanies, useCompanyDetails } from "@/hooks/use-companies";
import { useAuth } from "@/hooks/use-auth";
import AdminLayout from "@/components/layout/admin-layout";
import CompanyProfileForm from "@/components/companies/company-profile-form";
import CompanyAddressForm from "@/components/companies/company-address-form";
import CompanyContactForm from "@/components/companies/company-contact-form";
import CompanyBrandingForm from "@/components/companies/company-branding-form";
import CompanySocialForm from "@/components/companies/company-social-form";

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { data: companies, isLoading: companiesLoading } = useUserCompanies();
  
  const companyId = params.id as string;
  const { data: companyDetails, isLoading: detailsLoading, error: detailsError } = useCompanyDetails(companyId);
  const company = companies?.find(c => c.company_id === companyId);

  if (companiesLoading || detailsLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!company || detailsError) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-destructive mb-2">Company Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  The company you're looking for doesn't exist or you don't have access to it.
                </p>
                <Button onClick={() => router.push('/admin/companies')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Companies
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/admin/companies')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{company.company_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={company.role === 'ADMIN' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {company.role}
                </Badge>
                <span className="text-muted-foreground text-sm">Company Management</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Settings</span>
                <span className="text-muted-foreground">›</span>
                <button 
                  onClick={() => router.push('/admin/companies')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Companies
                </button>
                <span className="text-muted-foreground">›</span>
                <span className="text-sm font-medium text-foreground">{company.company_name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Company
            </Button>
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Company Overview */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{company.company_name}</CardTitle>
                    <CardDescription className="text-base">
                      Company management and administration
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Team Members</p>
                      <p className="text-2xl font-bold text-primary">12</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Active Projects</p>
                      <p className="text-2xl font-bold text-primary">8</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Security Level</p>
                      <p className="text-2xl font-bold text-primary">High</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <CompanyProfileForm
                  companyId={companyId}
                  initialData={companyDetails?.profile}
                  onSave={(data) => {
                    console.log('Profile saved:', data);
                    // Refresh company details
                  }}
                />
              </TabsContent>

              <TabsContent value="address" className="space-y-6">
                <CompanyAddressForm
                  companyId={companyId}
                  initialData={companyDetails?.address}
                  onSave={(data) => {
                    console.log('Address saved:', data);
                    // Refresh company details
                  }}
                />
              </TabsContent>

              <TabsContent value="contact" className="space-y-6">
                <CompanyContactForm
                  companyId={companyId}
                  initialData={companyDetails?.contact}
                  onSave={(data) => {
                    console.log('Contact saved:', data);
                    // Refresh company details
                  }}
                />
              </TabsContent>

              <TabsContent value="branding" className="space-y-6">
                <CompanyBrandingForm
                  companyId={companyId}
                  initialData={companyDetails?.branding}
                  onSave={(data) => {
                    console.log('Branding saved:', data);
                    // Refresh company details
                  }}
                />
              </TabsContent>

              <TabsContent value="social" className="space-y-6">
                <CompanySocialForm
                  companyId={companyId}
                  initialData={companyDetails?.social}
                  onSave={(data) => {
                    console.log('Social saved:', data);
                    // Refresh company details
                  }}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
      </div>
    </AdminLayout>
  );
}
