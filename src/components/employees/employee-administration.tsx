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
  AlertCircle
} from "lucide-react";

interface EmployeeAdministrationProps {
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
    // Administrative fields
    date_of_birth?: string;
    gender?: string;
    nationality?: string;
    marital_status?: string;
    national_id?: string;
    passport_number?: string;
    passport_expiry_date?: string;
    personal_address?: string;
    personal_city?: string;
    personal_state?: string;
    personal_country?: string;
    personal_postal_code?: string;
    personal_phone?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    work_permit_number?: string;
    work_permit_expiry_date?: string;
    visa_type?: string;
    visa_number?: string;
    visa_expiry_date?: string;
    social_security_number?: string;
    tax_id?: string;
    tax_exemptions?: number;
    bank_name?: string;
    bank_account_number?: string;
    bank_routing_number?: string;
    blood_type?: string;
    medical_insurance_number?: string;
    medical_insurance_provider?: string;
    employee_number?: string;
    department?: string;
    job_level?: string;
    reporting_manager?: string;
    employment_contract_type?: string;
    probation_period_months?: number;
    notice_period_days?: number;
    documents_complete?: boolean;
    background_check_complete?: boolean;
    medical_check_complete?: boolean;
    administrative_notes?: string;
    last_document_review?: string;
    next_document_review?: string;
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

export default function EmployeeAdministration({ 
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
}: EmployeeAdministrationProps) {
  
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
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
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
              {/* Document Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className={`h-5 w-5 ${employee.documents_complete ? 'text-green-600' : 'text-amber-600'}`} />
                    <span className="font-medium">Documents</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {employee.documents_complete ? 'Complete' : 'Pending'}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className={`h-5 w-5 ${employee.background_check_complete ? 'text-green-600' : 'text-amber-600'}`} />
                    <span className="font-medium">Background Check</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {employee.background_check_complete ? 'Complete' : 'Pending'}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className={`h-5 w-5 ${employee.medical_check_complete ? 'text-green-600' : 'text-amber-600'}`} />
                    <span className="font-medium">Medical Check</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {employee.medical_check_complete ? 'Complete' : 'Pending'}
                  </p>
                </div>
              </div>

              {/* Administrative Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <p className="text-sm">{formatDate(employee.date_of_birth)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Gender</label>
                        <p className="text-sm">{employee.gender || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                        <p className="text-sm">{employee.nationality || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                        <p className="text-sm">{employee.marital_status || 'Not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Personal Address</label>
                      <p className="text-sm">
                        {employee.personal_address ? 
                          `${employee.personal_address}, ${employee.personal_city}, ${employee.personal_country}` : 
                          'Not provided'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Personal Phone</label>
                      <p className="text-sm">{employee.personal_phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Identity Documents */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Identity Documents</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">National ID</label>
                        <p className="text-sm">{employee.national_id || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Passport Number</label>
                        <p className="text-sm">{employee.passport_number || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Passport Expiry</label>
                      <p className="text-sm">{formatDate(employee.passport_expiry_date)}</p>
                    </div>
                  </div>
                </div>

                {/* Work Authorization (for foreigners) */}
                {employee.nationality && employee.nationality !== 'Tunisian' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span>Work Authorization</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Work Permit</label>
                          <p className="text-sm">{employee.work_permit_number || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Work Permit Expiry</label>
                          <p className="text-sm">{formatDate(employee.work_permit_expiry_date)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Visa Type</label>
                          <p className="text-sm">{employee.visa_type || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Visa Number</label>
                          <p className="text-sm">{employee.visa_number || 'Not provided'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Visa Expiry</label>
                        <p className="text-sm">{formatDate(employee.visa_expiry_date)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financial Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Financial Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Social Security</label>
                        <p className="text-sm">{employee.social_security_number || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tax ID</label>
                        <p className="text-sm">{employee.tax_id || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tax Exemptions</label>
                      <p className="text-sm">{employee.tax_exemptions || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                      <p className="text-sm">{employee.bank_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                      <p className="text-sm">{employee.bank_account_number ? '****' + employee.bank_account_number.slice(-4) : 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Emergency Contact</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Contact Name</label>
                      <p className="text-sm">{employee.emergency_contact_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                      <p className="text-sm">{employee.emergency_contact_phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                      <p className="text-sm">{employee.emergency_contact_relationship || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Medical Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Blood Type</label>
                        <p className="text-sm">{employee.blood_type || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Insurance Number</label>
                        <p className="text-sm">{employee.medical_insurance_number || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Insurance Provider</label>
                      <p className="text-sm">{employee.medical_insurance_provider || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Employment Details</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Employee Number</label>
                        <p className="text-sm">{employee.employee_number || 'Not assigned'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Department</label>
                        <p className="text-sm">{employee.department || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Job Level</label>
                        <p className="text-sm">{employee.job_level || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Contract Type</label>
                        <p className="text-sm">{employee.employment_contract_type || 'Not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Reporting Manager</label>
                      <p className="text-sm">{employee.reporting_manager || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrative Notes */}
              {employee.administrative_notes && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Edit className="h-5 w-5" />
                    <span>Administrative Notes</span>
                  </h3>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">{employee.administrative_notes}</p>
                  </div>
                </div>
              )}

              {/* Document Review Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground">Last Document Review</label>
                  <p className="text-sm">{formatDate(employee.last_document_review)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground">Next Document Review</label>
                  <p className="text-sm">{formatDate(employee.next_document_review)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No employee data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
