"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/auth-guard"
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  FileText, 
  FileSignature, 
  Upload, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building,
  Clock,
  DollarSign,
  Award,
  Download,
  Eye
} from "lucide-react"
import Link from "next/link"

export default function EmployeeDetailPage({ params: { id } }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    } else if (!user.isAdmin) {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);

  // Mock employee data - replace with actual API call
  useEffect(() => {
    // Simulate fetching employee data
    setEmployee({
      id: id,
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@company.com",
      phone: "+1 (555) 123-4567",
      position: "Senior Developer",
      department: "Engineering",
      manager: "Sarah Chen",
      hireDate: "2022-03-15",
      salary: 95000,
      status: "active",
      avatar: null,
      address: "123 Main St, San Francisco, CA 94105",
      emergencyContact: "Jane Smith (Spouse) - +1 (555) 987-6543",
      documents: [
        { id: 1, name: "Employment Contract", type: "contract", uploadDate: "2022-03-15", status: "signed" },
        { id: 2, name: "NDA Agreement", type: "legal", uploadDate: "2022-03-15", status: "signed" },
        { id: 3, name: "Benefits Enrollment", type: "benefits", uploadDate: "2022-03-20", status: "completed" },
        { id: 4, name: "Performance Review Q4 2024", type: "review", uploadDate: "2024-12-01", status: "pending" }
      ],
      contracts: [
        { id: 1, type: "Employment", status: "active", startDate: "2022-03-15", endDate: null, signedDate: "2022-03-15" },
        { id: 2, type: "NDA", status: "active", startDate: "2022-03-15", endDate: null, signedDate: "2022-03-15" }
      ]
    });
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-lg text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  if (!employee) {
    return (
      <AdminLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-center">
            <span className="text-lg text-muted-foreground">Loading employee data...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Inactive</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Signed</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pending</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Employee Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback className="text-lg">
                {employee.firstName[0]}{employee.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-muted-foreground">{employee.position} • {employee.department}</p>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(employee.status)}
                <span className="text-sm text-muted-foreground">
                  Employee ID: {employee.id}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Link href="/admin/people/list">
              <Button variant="outline">
                Back to List
              </Button>
            </Link>
          </div>
        </div>

        {/* Employee Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="administration" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>Administration</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center space-x-2">
              <FileSignature className="h-4 w-4" />
              <span>Contracts</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{employee.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{employee.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Emergency Contact</p>
                      <p className="text-sm text-muted-foreground">{employee.emergencyContact}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-muted-foreground">{employee.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Manager</p>
                      <p className="text-sm text-muted-foreground">{employee.manager}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Hire Date</p>
                      <p className="text-sm text-muted-foreground">{employee.hireDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Salary</p>
                      <p className="text-sm text-muted-foreground">${employee.salary.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="administration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Administration</CardTitle>
                <CardDescription>
                  Administrative tasks and employee management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Edit className="mr-2 h-4 w-4" />
                        Update Employee Information
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Adjust Salary
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Building className="mr-2 h-4 w-4" />
                        Change Department
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Update Manager
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Status Management</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Clock className="mr-2 h-4 w-4" />
                        Change Employment Status
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="mr-2 h-4 w-4" />
                        Update Hire Date
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Award className="mr-2 h-4 w-4" />
                        Add Performance Note
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contracts</CardTitle>
                    <CardDescription>
                      Employment contracts and legal agreements
                    </CardDescription>
                  </div>
                  <Button>
                    <FileSignature className="mr-2 h-4 w-4" />
                    New Contract
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employee.contracts.map((contract: any) => (
                    <div key={contract.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{contract.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            Start: {contract.startDate} • 
                            {contract.endDate ? ` End: ${contract.endDate}` : ' Ongoing'} • 
                            Signed: {contract.signedDate}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(contract.status)}
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>
                      Employee documents and file management
                    </CardDescription>
                  </div>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employee.documents.map((doc: any) => (
                    <div key={doc.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{doc.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Type: {doc.type} • Uploaded: {doc.uploadDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getDocumentStatusBadge(doc.status)}
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

