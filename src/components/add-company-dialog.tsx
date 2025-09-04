"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useCreateCompany } from "@/hooks/use-companies";
import { CreateCompanyData } from "@/lib/api/companies";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";

const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(255, "Company name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  address: z.string().max(255, "Address is too long").optional(),
  city: z.string().max(100, "City name is too long").optional(),
  state: z.string().max(100, "State name is too long").optional(),
  country: z.string().max(100, "Country name is too long").optional(),
  postal_code: z.string().max(20, "Postal code is too long").optional(),
  timezone: z.string().max(50, "Timezone is too long").optional(),
});

type CreateCompanyFormData = z.infer<typeof createCompanySchema>;

interface AddCompanyDialogProps {
  children?: React.ReactNode;
}

export function AddCompanyDialog({ children }: AddCompanyDialogProps) {
  const [open, setOpen] = React.useState(false);
  const createCompany = useCreateCompany();

  const form = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
      timezone: "",
    },
  });

  const onSubmit = async (data: CreateCompanyFormData) => {
    try {
      // Clean up empty strings
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ])
      ) as unknown as CreateCompanyData;

      await createCompany.mutateAsync(cleanedData);
      
      toast({
        title: "Company created",
        description: `${data.name} has been created successfully.`,
      });
      
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create company",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Plus className="size-4" />
            Add Company
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
          <DialogDescription>
            Create a new company. You will be automatically assigned as a superuser.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter company description" 
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., UTC, America/New_York" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createCompany.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCompany.isPending}
              >
                {createCompany.isPending ? "Creating..." : "Create Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
