import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { hasPermission } from "@/lib/rbac";
import { PAYROLL_STATUSES, PAY_ITEM_TYPES } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPayrollCycleSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, DollarSign, TrendingUp, Calculator, Download, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = insertPayrollCycleSchema.extend({
  periodStart: z.date(),
  periodEnd: z.date(),
});

type FormData = z.infer<typeof formSchema>;

export default function PayrollIndex() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get the first company membership
  const membership = user.memberships?.[0];
  const companyId = membership?.companyId;

  if (!companyId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Access</h2>
          <p className="text-gray-600">You don't have access to any company. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  // Check permissions
  const canViewPayroll = hasPermission(membership, "payroll:read");
  const canProcessPayroll = hasPermission(membership, "payroll:process");
  const canManageItems = hasPermission(membership, "admin:update");

  if (!canViewPayroll) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view payroll information.</p>
        </div>
      </div>
    );
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId,
      periodStart: new Date(),
      periodEnd: new Date(),
      status: "DRAFT",
    },
  });

  const createPayrollCycleMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", `/api/companies/${companyId}/payroll-cycles`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'payroll-cycles'] });
      toast({
        title: "Payroll cycle created",
        description: "New payroll cycle has been created successfully.",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating payroll cycle",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createPayrollCycleMutation.mutate(data);
  };

  return (
    <div className="p-6" data-testid="payroll-index">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
            <p className="text-gray-600">Manage payroll cycles and employee compensation</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" data-testid="button-export-payroll">
              <Download className="w-4 h-4 mr-2" />
              Export Reports
            </Button>
            {canProcessPayroll && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-cycle">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Cycle
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create Payroll Cycle</DialogTitle>
                    <DialogDescription>
                      Set up a new payroll processing cycle.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="periodStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Period Start *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                      data-testid="button-period-start"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="periodEnd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Period End *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                      data-testid="button-period-end"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      data-testid="button-cancel-cycle"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={createPayrollCycleMutation.isPending}
                      data-testid="button-create-payroll-cycle"
                    >
                      {createPayrollCycleMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Cycle"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <PayrollStats companyId={companyId} />

        {/* Tabs */}
        <Tabs defaultValue="cycles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cycles">Payroll Cycles</TabsTrigger>
            <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
            {canManageItems && <TabsTrigger value="items">Pay Items</TabsTrigger>}
          </TabsList>

          {/* Payroll Cycles */}
          <TabsContent value="cycles">
            <PayrollCycles companyId={companyId} />
          </TabsContent>

          {/* Payroll Runs */}
          <TabsContent value="runs">
            <PayrollRuns companyId={companyId} />
          </TabsContent>

          {/* Pay Items */}
          {canManageItems && (
            <TabsContent value="items">
              <PayItems companyId={companyId} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function PayrollStats({ companyId }: { companyId: string }) {
  const { data: cycles } = useQuery({
    queryKey: ['/api/companies', companyId, 'payroll-cycles'],
    enabled: !!companyId,
  });

  const currentCycle = cycles?.find((c: any) => c.status === 'DRAFT');
  const stats = {
    currentCycle: currentCycle ? 'In Progress' : 'Ready',
    pendingRuns: 0, // Would need to calculate based on runs
    totalAmount: 0, // Would need to calculate from runs
    nextPayDate: 'Feb 1, 2024', // Would calculate based on schedule
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Cycle</p>
              <p className="text-2xl font-bold text-gray-900">{stats.currentCycle}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Runs</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingRuns}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">€{stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Pay Date</p>
              <p className="text-lg font-bold text-gray-900">{stats.nextPayDate}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PayrollCycles({ companyId }: { companyId: string }) {
  const { data: cycles, isLoading } = useQuery({
    queryKey: ['/api/companies', companyId, 'payroll-cycles'],
    enabled: !!companyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = PAYROLL_STATUSES.find(s => s.value === status);
    if (!statusConfig) return <Badge variant="secondary">{status}</Badge>;

    const colorClass = {
      gray: "bg-gray-100 text-gray-800",
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      purple: "bg-purple-100 text-purple-800",
    }[statusConfig.color];

    return (
      <Badge className={colorClass}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Cycles</CardTitle>
        <CardDescription>Manage payroll processing cycles</CardDescription>
      </CardHeader>
      <CardContent>
        {!cycles || cycles.length === 0 ? (
          <div className="text-center py-8">
            <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payroll Cycles</h3>
            <p className="text-gray-600">Create your first payroll cycle to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cycles.map((cycle: any) => (
              <div key={cycle.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`cycle-${cycle.id}`}>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">
                      Cycle #{cycle.id.slice(-8)}
                    </h4>
                    {getStatusBadge(cycle.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Period: {format(new Date(cycle.periodStart), "MMM dd, yyyy")} - {format(new Date(cycle.periodEnd), "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created {format(new Date(cycle.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {cycle.status === 'DRAFT' && (
                    <Button size="sm" data-testid={`button-calculate-${cycle.id}`}>
                      <Calculator className="w-4 h-4 mr-1" />
                      Calculate
                    </Button>
                  )}
                  <Button size="sm" variant="outline" data-testid={`button-view-cycle-${cycle.id}`}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PayrollRuns({ companyId }: { companyId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Runs</CardTitle>
        <CardDescription>Individual employee payroll calculations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payroll Runs</h3>
          <p className="text-gray-600">Payroll runs will appear here after processing cycles.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PayItems({ companyId }: { companyId: string }) {
  const { data: payItems, isLoading } = useQuery({
    queryKey: ['/api/companies', companyId, 'pay-items'],
    enabled: !!companyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = PAY_ITEM_TYPES.find(t => t.value === type);
    if (!typeConfig) return <Badge variant="secondary">{type}</Badge>;

    const colorClass = {
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      blue: "bg-blue-100 text-blue-800",
    }[typeConfig.color];

    return (
      <Badge className={colorClass}>
        {typeConfig.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pay Items</CardTitle>
            <CardDescription>Configure earnings, deductions, and contributions</CardDescription>
          </div>
          <Button size="sm" data-testid="button-create-pay-item">
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!payItems || payItems.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pay Items</h3>
            <p className="text-gray-600">Create pay items to define salary components.</p>
            <Button className="mt-4" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Pay Item
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {payItems.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`pay-item-${item.id}`}>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    {getTypeBadge(item.type)}
                  </div>
                  <p className="text-sm text-gray-600">Code: {item.code}</p>
                  {item.formula && (
                    <p className="text-xs text-gray-500">Formula: {item.formula}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {item.taxable && (
                    <Badge variant="outline" className="text-xs">Taxable</Badge>
                  )}
                  {item.recurring && (
                    <Badge variant="outline" className="text-xs">Recurring</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
