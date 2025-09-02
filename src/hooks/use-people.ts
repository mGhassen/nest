import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi, type EmployeeWithAccount } from "@/lib/api";
import type { EmployeeDetail } from "@/types/employee";

// Import the form data type from the employee form
type EmployeeFormData = {
  first_name: string;
  last_name: string;
  email: string;
  hire_date: string;
  employment_type: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";
  position_title: string;
  location_id?: string;
  cost_center_id?: string;
  work_schedule_id?: string;
  manager_id?: string;
  base_salary: number;
  salary_period: "HOURLY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
  status: "ACTIVE" | "INACTIVE" | "TERMINATED" | "ON_LEAVE";
};

// Hook for fetching people list
export function usePeopleList() {
  return useQuery<EmployeeWithAccount[]>({
    queryKey: ['employees'],
    queryFn: employeeApi.getEmployees,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

// Hook for creating a new person
export function usePeopleCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.createEmployee,
    onSuccess: () => {
      // Invalidate and refetch people list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// Hook for updating a person
export function usePeopleUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeFormData> }) => 
      employeeApi.updateEmployee(id, data),
    onSuccess: (_, variables) => {
      // Invalidate people list and specific person data
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    },
  });
}

// Hook for deleting a person
export function usePeopleDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeApi.deleteEmployee,
    onSuccess: () => {
      // Invalidate people list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// Hook for fetching a specific person
export function usePerson(id: string) {
  return useQuery<EmployeeWithAccount>({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.getEmployee(id),
    enabled: !!id,
  });
}


