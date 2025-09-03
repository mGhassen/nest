"use client";

import * as React from "react";
import { ChevronsUpDown, Building2, Check } from "lucide-react";
import { useUserCompanies, useCurrentCompany, useSwitchCompany } from "@/hooks/use-companies";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function CompanySwitcher() {
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();
  const { data: companies = [], isLoading: companiesLoading } = useUserCompanies();
  const { data: currentCompany, isLoading: currentLoading } = useCurrentCompany();
  const switchCompany = useSwitchCompany();

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const handleSelect = (companyId: string) => {
    if (companyId === currentCompany?.company_id) {
      setOpen(false);
      return;
    }

    switchCompany.mutate(companyId, {
      onSuccess: (newCompany) => {
        setOpen(false);
        // Refresh the page to update the UI with new company context
        window.location.reload();
      },
      onError: (error) => {
        console.error('Failed to switch company:', error);
      },
    });
  };

  if (companiesLoading || currentLoading) {
    return (
      <div className="flex items-center space-x-2 px-2 py-1.5">
        <Building2 className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-2 py-1.5">
        <Building2 className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">No companies</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between px-2 py-1.5 h-auto"
        >
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {currentCompany?.company_name || "Select company"}
              </span>
              {currentCompany && (
                <span className="text-xs text-muted-foreground">
                  {currentCompany.role === 'ADMIN' ? 'Administrator' : 'Employee'}
                </span>
              )}
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search companies..." />
          <CommandList>
            <CommandEmpty>No companies found.</CommandEmpty>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem
                  key={company.company_id}
                  value={company.company_name}
                  onSelect={() => handleSelect(company.company_id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {company.company_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {company.role === 'ADMIN' ? 'Administrator' : 'Employee'}
                      </span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentCompany?.company_id === company.company_id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
