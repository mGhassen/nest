"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Building2, 
  Plus, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Users,
  Globe,
  Shield,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

export default function SuperuserOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multi-Company Management",
      description: "Manage multiple companies from a single dashboard"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Superuser Privileges",
      description: "Full access to all company features and settings"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Access",
      description: "Switch between companies seamlessly"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Advanced Features",
      description: "Access to company creation and management tools"
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Choose Your Path",
      description: "Link to existing companies or create new ones"
    },
    {
      number: 2,
      title: "Get Access",
      description: "Receive superuser privileges for your companies"
    },
    {
      number: 3,
      title: "Start Managing",
      description: "Begin managing your multi-company operations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Welcome, {user?.firstName || 'Superuser'}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                You have superuser privileges but no companies yet
              </p>
            </div>
            <Badge variant="secondary" className="gap-2">
              <Shield className="h-4 w-4" />
              Superuser
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Building2 className="h-12 w-12 text-white" />
            </motion.div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              As a superuser, you can either link to existing companies or create new ones. 
              Choose the path that works best for you.
            </p>

            {/* Steps */}
            <div className="flex justify-center items-center gap-8 mb-12">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      {step.number}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{step.title}</div>
                      <div className="text-sm text-gray-600">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Create Company Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <Card className="border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Plus className="h-10 w-10 text-white" />
                </motion.div>
                <CardTitle className="text-3xl">Create Your First Company</CardTitle>
                <CardDescription className="text-lg">
                  Start fresh with a new company and set up everything from scratch
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Complete company setup wizard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Custom branding and settings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Full control from day one</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Automatic superuser access</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => router.push('/admin/companies/create')}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  size="lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Company
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  Superuser Benefits
                </CardTitle>
                <CardDescription>
                  What you can do with superuser privileges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="text-center p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="text-center mt-12"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="py-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Need Help Getting Started?
                </h3>
                <p className="text-gray-600 mb-4">
                  Our support team is here to help you set up your companies and get the most out of your superuser privileges.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                  <Button variant="outline" size="sm">
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
