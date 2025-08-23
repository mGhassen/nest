import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
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
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

const newPolicySchema = z.object({
  code: z.string().min(1, "Policy code is required").max(10, "Code must be 10 characters or less"),
  name: z.string().min(1, "Policy name is required").max(100, "Name must be 100 characters or less"),
  unit: z.enum(["DAYS", "HOURS"], { required_error: "Unit is required" }),
  accrualRule: z.string().min(1, "Accrual rule is required"),
  carryOverMax: z.string().optional(),
});

type NewPolicyForm = z.infer<typeof newPolicySchema>;

interface NewPolicyDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function NewPolicyDialog({ trigger, onSuccess }: NewPolicyDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NewPolicyForm>({
    resolver: zodResolver(newPolicySchema),
    defaultValues: {
      code: "",
      name: "",
      unit: "DAYS",
      accrualRule: "",
      carryOverMax: "",
    },
  });

  const createPolicyMutation = useMutation({
    mutationFn: async (data: NewPolicyForm) => {
      const payload = {
        ...data,
        carryOverMax: data.carryOverMax ? parseFloat(data.carryOverMax) : null,
      };
      return await apiRequest('POST', '/api/leave-policies', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leave-policies'] });
      toast({
        title: "Success",
        description: "Leave policy created successfully",
      });
      form.reset();
      setOpen(false);
      onSuccess?.();
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
        description: "Failed to create leave policy",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewPolicyForm) => {
    createPolicyMutation.mutate(data);
  };

  const accrualRuleExamples = [
    { value: "25 days per year", label: "25 days per year" },
    { value: "2.08 days per month", label: "2.08 days per month (25 annual)" },
    { value: "0.48 days per week", label: "0.48 days per week (25 annual)" },
    { value: "40 hours per year", label: "40 hours per year" },
    { value: "3.33 hours per month", label: "3.33 hours per month (40 annual)" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid="button-new-policy">
            <Plus className="mr-2 h-4 w-4" />
            New Policy
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl" data-testid="dialog-new-policy">
        <DialogHeader>
          <DialogTitle>Create New Leave Policy</DialogTitle>
          <DialogDescription>
            Define a new leave policy with accrual rules and carry-over limits.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., ANNUAL"
                        {...field}
                        data-testid="input-policy-code"
                        className="uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Short code to identify the policy (e.g., ANNUAL, SICK, PERSONAL)
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
                        <SelectTrigger data-testid="select-policy-unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DAYS">Days</SelectItem>
                        <SelectItem value="HOURS">Hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Whether this policy tracks days or hours
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Annual Leave"
                      {...field}
                      data-testid="input-policy-name"
                    />
                  </FormControl>
                  <FormDescription>
                    Descriptive name for the leave policy
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accrualRule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accrual Rule</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="e.g., 25 days per year"
                        {...field}
                        data-testid="input-accrual-rule"
                      />
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Or choose from examples" />
                        </SelectTrigger>
                        <SelectContent>
                          {accrualRuleExamples.map((example) => (
                            <SelectItem key={example.value} value={example.value}>
                              {example.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormDescription>
                    How leave accrues for this policy (e.g., "25 days per year", "2.08 days per month")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carryOverMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Carry Over (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 5"
                      {...field}
                      data-testid="input-carry-over-max"
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum {form.watch("unit")?.toLowerCase() || "days"} that can be carried over to next period. Leave empty for no limit.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Policy Preview</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div><span className="font-medium">Code:</span> {form.watch("code") || "N/A"}</div>
                <div><span className="font-medium">Name:</span> {form.watch("name") || "N/A"}</div>
                <div><span className="font-medium">Accrual:</span> {form.watch("accrualRule") || "N/A"}</div>
                <div><span className="font-medium">Unit:</span> {form.watch("unit") || "N/A"}</div>
                <div><span className="font-medium">Carry Over:</span> {form.watch("carryOverMax") ? `${form.watch("carryOverMax")} ${form.watch("unit")?.toLowerCase()}` : "No limit"}</div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createPolicyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPolicyMutation.isPending}
                data-testid="button-create-policy"
              >
                {createPolicyMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Policy
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}