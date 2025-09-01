import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";

const newLeaveRequestSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  policyId: z.string().min(1, "Leave policy is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.enum(["DAYS", "HOURS"], { required_error: "Unit is required" }),
  status: z.string().default("SUBMITTED"),
  reason: z.string().optional(),
});

type NewLeaveRequestForm = z.infer<typeof newLeaveRequestSchema>;

interface NewLeaveRequestFormProps {
  employeeId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NewLeaveRequestForm({ employeeId, onSuccess, onCancel }: NewLeaveRequestFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NewLeaveRequestForm>({
    resolver: zodResolver(newLeaveRequestSchema),
    defaultValues: {
      employeeId,
      policyId: "",
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      quantity: "1",
      unit: "DAYS",
      status: "SUBMITTED",
      reason: "",
    },
  });

  // Fetch available leave policies
  const { data: leavePolicies = [] } = useQuery<any[]>({
    queryKey: ['/api/leave-policies'],
    queryFn: async () => {
      const response = await fetch('/api/leave-policies');
      if (!response.ok) {
        throw new Error('Failed to fetch leave policies');
      }
      return response.json();
    },
    retry: false,
  });

  const createLeaveRequestMutation = useMutation({
    mutationFn: async (data: NewLeaveRequestForm) => {
      return await apiRequest('POST', '/api/leave-requests', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees', employeeId, 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employees', employeeId, 'leave-balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leave-requests'] });
      toast({
        title: "Success",
        description: "Leave request created successfully",
      });
      form.reset();
      onSuccess();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create leave request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewLeaveRequestForm) => {
    // Keep quantity as string - database expects decimal as string
    const submitData = {
      ...data,
      quantity: data.quantity,
    };
    console.log("Submitting leave request:", submitData);
    createLeaveRequestMutation.mutate(submitData);
  };

  const watchedStartDate = form.watch("startDate");
  const watchedEndDate = form.watch("endDate");

  // Auto-calculate quantity when dates change
  React.useEffect(() => {
    if (watchedStartDate && watchedEndDate) {
      const start = new Date(watchedStartDate);
      const end = new Date(watchedEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      form.setValue("quantity", diffDays.toString());
    }
  }, [watchedStartDate, watchedEndDate, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="policyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leave Policy</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-policy">
                      <SelectValue placeholder="Select leave policy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.isArray(leavePolicies) && leavePolicies.map((policy: any) => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.name} ({policy.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the type of leave for this request
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DAYS">Days</SelectItem>
                    <SelectItem value="HOURS">Hours</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Whether to track in days or hours
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    data-testid="input-start-date"
                  />
                </FormControl>
                <FormDescription>
                  First day of leave
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    data-testid="input-end-date"
                  />
                </FormControl>
                <FormDescription>
                  Last day of leave
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g., 5"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    value={field.value}
                    data-testid="input-quantity"
                  />
                </FormControl>
                <FormDescription>
                  Amount of leave requested
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Reason for leave request..."
                  className="min-h-[80px]"
                  {...field}
                  data-testid="textarea-reason"
                />
              </FormControl>
              <FormDescription>
                Optional description or reason for the leave
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Request Summary</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <div><span className="font-medium">Policy:</span> {
              Array.isArray(leavePolicies) ? 
                leavePolicies.find((p: any) => p.id === form.watch("policyId"))?.name || "Not selected" :
                "Not selected"
            }</div>
            <div><span className="font-medium">Dates:</span> {form.watch("startDate")} to {form.watch("endDate")}</div>
            <div><span className="font-medium">Duration:</span> {form.watch("quantity")} {form.watch("unit")?.toLowerCase()}</div>
            <div><span className="font-medium">Reason:</span> {form.watch("reason") || "No reason provided"}</div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createLeaveRequestMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createLeaveRequestMutation.isPending}
            data-testid="button-submit-leave-request"
          >
            {createLeaveRequestMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Leave Request
          </Button>
        </div>
      </form>
    </Form>
  );
}