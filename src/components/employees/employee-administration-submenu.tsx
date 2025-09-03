import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  User, 
  Mail, 
  Users, 
  Settings, 
  Shield, 
  Key, 
  Lock, 
  Unlock, 
  Archive, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity, 
  MoreVertical,
  UserCheck,
  UserX,
  RefreshCw,
  Edit,
  Ban,
  AlertCircle,
  MapPin,
  FileText,
  Briefcase,
  Heart,
  StickyNote,
  ChevronDown
} from "lucide-react";

interface EmployeeAdministrationSubmenuProps {
  employeeId: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    status: "ACTIVE" | "INACTIVE" | "TERMINATED" | "ON_LEAVE";
    employment_type: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";
    position_title: string;
    hire_date: string;
    // Normalized administrative data
    profile?: {
      date_of_birth?: string;
      gender?: string;
      nationality?: string;
      marital_status?: string;
      personal_phone?: string;
      blood_type?: string;
    };
    addresses?: Array<{
      address_type: string;
      address?: string;
      city?: string;
      country?: string;
      postal_code?: string;
      is_primary: boolean;
    }>;
    contacts?: Array<{
      contact_type: string;
      name: string;
      phone?: string;
      email?: string;
      relationship?: string;
      is_primary: boolean;
    }>;
    documents?: Array<{
      document_type: string;
      document_number?: string;
      issuing_authority?: string;
      issue_date?: string;
      expiry_date?: string;
      document_url?: string;
      is_verified: boolean;
    }>;
    financial_info?: Array<{
      info_type: string;
      bank_name?: string;
      account_number?: string;
      routing_number?: string;
      swift_code?: string;
      tax_id?: string;
      social_security_number?: string;
      tax_exemptions?: number;
      is_primary: boolean;
    }>;
    medical_info?: {
      insurance_provider?: string;
      insurance_number?: string;
      policy_number?: string;
      coverage_start_date?: string;
      coverage_end_date?: string;
      medical_notes?: string;
    };
    employment_details?: {
      employee_number?: string;
      department?: string;
      job_level?: string;
      reporting_manager?: string;
      employment_contract_type?: string;
      probation_period_months?: number;
      notice_period_days?: number;
    };
    document_status?: Array<{
      status_type: string;
      is_complete: boolean;
      completed_at?: string;
      next_review_date?: string;
      notes?: string;
    }>;
    administrative_notes?: Array<{
      note_type: string;
      title?: string;
      content: string;
      created_at: string;
    }>;
    account?: {
      id: string;
      role: "ADMIN" | "EMPLOYEE";
      is_active: boolean;
      last_login?: string | null;
      created_at?: string;
    } | null;
  };
  onPasswordReset?: () => void;
  onSetPassword?: () => void;
  onResendInvitation?: () => void;
  onChangeRole?: () => void;
  onToggleAccountStatus?: () => void;
  onSuspendAccount?: () => void;
  onArchiveEmployee?: () => void;
  onDeleteAccount?: () => void;
  onEditEmployeeDetails?: () => void;
  onViewActivityLog?: () => void;
  onManagePermissions?: () => void;
  onTransferEmployee?: () => void;
  onGenerateReport?: () => void;
}

export default function EmployeeAdministrationSubmenu({ 
  employeeId,
  employee,
  onPasswordReset,
  onSetPassword,
  onResendInvitation,
  onChangeRole,
  onToggleAccountStatus,
  onSuspendAccount,
  onArchiveEmployee,
  onDeleteAccount,
  onEditEmployeeDetails,
  onViewActivityLog,
  onManagePermissions,
  onTransferEmployee,
  onGenerateReport
}: EmployeeAdministrationSubmenuProps) {
  
  const [activeSubmenu, setActiveSubmenu] = useState<string>('personal');
  
  // Utility functions
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'TERMINATED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PART_TIME': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'CONTRACTOR': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'INTERN': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const submenuItems = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: User,
      description: 'Profile, addresses, contacts',
      count: (employee?.profile ? 1 : 0) + (employee?.addresses?.length || 0) + (employee?.contacts?.length || 0)
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      description: 'Identity documents, status',
      count: (employee?.documents?.length || 0) + (employee?.document_status?.length || 0)
    },
    {
      id: 'employment',
      label: 'Employment',
      icon: Briefcase,
      description: 'Job details, financial info',
      count: (employee?.employment_details ? 1 : 0) + (employee?.financial_info?.length || 0)
    },
    {
      id: 'medical',
      label: 'Medical',
      icon: Heart,
      description: 'Insurance, medical info',
      count: employee?.medical_info ? 1 : 0
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: StickyNote,
      description: 'Administrative notes',
      count: employee?.administrative_notes?.length || 0
    }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Personal Profile */}
      {employee?.profile ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                <p className="text-sm">{formatDate(employee.profile.date_of_birth)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                <p className="text-sm">{employee.profile.gender || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                <p className="text-sm">{employee.profile.nationality || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                <p className="text-sm">{employee.profile.marital_status || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Personal Phone</label>
                <p className="text-sm">{employee.profile.personal_phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Blood Type</label>
                <p className="text-sm">{employee.profile.blood_type || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No personal profile available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Addresses */}
      {employee?.addresses && employee.addresses.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Addresses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employee.addresses.map((address, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{address.address_type}</span>
                    {address.is_primary && (
                      <Badge variant="secondary" className="text-xs">Primary</Badge>
                    )}
                  </div>
                  <p className="text-sm">
                    {address.address ? 
                      `${address.address}, ${address.city}, ${address.country}` : 
                      'Not provided'
                    }
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No address information available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      {employee?.contacts && employee.contacts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Emergency Contacts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employee.contacts.map((contact, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{contact.contact_type}</span>
                    {contact.is_primary && (
                      <Badge variant="secondary" className="text-xs">Primary</Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No emergency contacts available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      {/* Document Status Overview */}
      {employee?.document_status && employee.document_status.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Document Status Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {employee.document_status.map((status) => (
                <div key={status.status_type} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className={`h-5 w-5 ${status.is_complete ? 'text-green-600' : 'text-amber-600'}`} />
                    <span className="font-medium">{status.status_type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {status.is_complete ? 'Complete' : 'Pending'}
                  </p>
                  {status.next_review_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Next review: {formatDate(status.next_review_date)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No document status information available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Identity Documents */}
      {employee?.documents && employee.documents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Identity Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employee.documents.map((doc, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{doc.document_type.replace('_', ' ')}</span>
                    <div className="flex items-center space-x-2">
                      {doc.is_verified ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {doc.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm">{doc.document_number || 'Not provided'}</p>
                  {doc.expiry_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {formatDate(doc.expiry_date)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No identity documents available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderEmployment = () => (
    <div className="space-y-6">
      {/* Employment Details */}
      {employee?.employment_details ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Employment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Employee Number</label>
                <p className="text-sm">{employee.employment_details.employee_number || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Department</label>
                <p className="text-sm">{employee.employment_details.department || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Job Level</label>
                <p className="text-sm">{employee.employment_details.job_level || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contract Type</label>
                <p className="text-sm">{employee.employment_details.employment_contract_type || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reporting Manager</label>
                <p className="text-sm">{employee.employment_details.reporting_manager || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No employment details available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Information */}
      {employee?.financial_info && employee.financial_info.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Financial Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employee.financial_info.map((info, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{info.info_type.replace('_', ' ')}</span>
                    {info.is_primary && (
                      <Badge variant="secondary" className="text-xs">Primary</Badge>
                    )}
                  </div>
                  {info.bank_name && (
                    <p className="text-sm">Bank: {info.bank_name}</p>
                  )}
                  {info.account_number && (
                    <p className="text-sm">Account: ****{info.account_number.slice(-4)}</p>
                  )}
                  {info.tax_id && (
                    <p className="text-sm">Tax ID: {info.tax_id}</p>
                  )}
                  {info.social_security_number && (
                    <p className="text-sm">SSN: {info.social_security_number}</p>
                  )}
                  {info.tax_exemptions !== undefined && (
                    <p className="text-sm">Exemptions: {info.tax_exemptions}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No financial information available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderMedical = () => (
    <div className="space-y-6">
      {employee?.medical_info ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Medical Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Insurance Provider</label>
                <p className="text-sm">{employee.medical_info.insurance_provider || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Insurance Number</label>
                <p className="text-sm">{employee.medical_info.insurance_number || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Policy Number</label>
                <p className="text-sm">{employee.medical_info.policy_number || 'Not provided'}</p>
              </div>
            </div>
            {employee.medical_info.medical_notes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">Medical Notes</label>
                <p className="text-sm">{employee.medical_info.medical_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No medical information available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-6">
      {employee?.administrative_notes && employee.administrative_notes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <StickyNote className="h-5 w-5" />
              <span>Administrative Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employee.administrative_notes.map((note, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{note.title || note.note_type}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(note.created_at)}</span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <StickyNote className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No administrative notes available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSubmenu) {
      case 'personal':
        return renderPersonalInfo();
      case 'documents':
        return renderDocuments();
      case 'employment':
        return renderEmployment();
      case 'medical':
        return renderMedical();
      case 'notes':
        return renderNotes();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="space-y-6">
      {/* Employee Overview Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Administrative Overview</CardTitle>
                <CardDescription>
                  {employee ? `${employee.first_name} ${employee.last_name}` : 'Employee'} - Administrative Information
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Account Management */}
                <DropdownMenuItem onClick={onPasswordReset}>
                  <Key className="h-4 w-4 mr-2" />
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSetPassword}>
                  <Lock className="h-4 w-4 mr-2" />
                  Set New Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onResendInvitation}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Invitation
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Employee Management */}
                <DropdownMenuItem onClick={onEditEmployeeDetails}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Employee Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onChangeRole}>
                  <Shield className="h-4 w-4 mr-2" />
                  Change Role
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleAccountStatus}>
                  {employee?.account?.is_active ? (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Deactivate Account
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Activate Account
                    </>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Administrative Actions */}
                <DropdownMenuItem onClick={onViewActivityLog}>
                  <Activity className="h-4 w-4 mr-2" />
                  View Activity Log
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onManagePermissions}>
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Permissions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onTransferEmployee}>
                  <Users className="h-4 w-4 mr-2" />
                  Transfer Employee
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onGenerateReport}>
                  <Activity className="h-4 w-4 mr-2" />
                  Generate Report
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Status Management */}
                <DropdownMenuItem onClick={onSuspendAccount}>
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onArchiveEmployee}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Employee
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Dangerous Actions */}
                <DropdownMenuItem onClick={onDeleteAccount} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {employee ? (
            <div className="space-y-6">
              {/* Submenu Navigation */}
              <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg">
                {submenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSubmenu(item.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeSubmenu === item.id
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.count > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {item.count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Content Area */}
              {renderContent()}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-muted/50 rounded-full">
                  <Settings className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No Administrative Data Available</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Administrative information for this employee has not been set up yet. 
                    Once the database is properly configured with the normalized tables, 
                    comprehensive HR data will appear here.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                  Check console logs for debugging information
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
