import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Employee } from "@/types/schema";

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

// Types for API responses
interface PeopleListResponse {
  people: Employee[];
}



interface CreatePeopleResponse {
  success: boolean;
  employee: Employee;
}

// Hook for fetching people list
export function usePeopleList() {
  return useQuery<Employee[]>({
    queryKey: ['/api/people'],
    queryFn: async () => {
      const data = await apiFetch<PeopleListResponse>('/api/people');
      return data.people || [];
    },
  });
}

// Hook for creating a new person
export function usePeopleCreate() {
  const queryClient = useQueryClient();

  return useMutation<CreatePeopleResponse, Error, EmployeeFormData>({
    mutationFn: async (data: EmployeeFormData) => {
      return await apiFetch<CreatePeopleResponse>('/api/people', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch people list
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
    },
  });
}

// Hook for updating a person
export function usePeopleUpdate() {
  const queryClient = useQueryClient();

  return useMutation<CreatePeopleResponse, Error, { id: string; data: Partial<EmployeeFormData> }>({
    mutationFn: async ({ id, data }) => {
      return await apiFetch<CreatePeopleResponse>(`/api/people/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate people list and specific person data
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
      queryClient.invalidateQueries({ queryKey: ['/api/people', variables.id] });
    },
  });
}

// Hook for deleting a person
export function usePeopleDelete() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/people/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // Invalidate people list
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
    },
  });
}

// Hook for fetching a specific person
export function usePerson(id: string) {
  return useQuery<Employee>({
    queryKey: ['/api/people', id],
    queryFn: async () => {
      return await apiFetch<Employee>(`/api/people/${id}`);
    },
    enabled: !!id,
  });
}

// Hook for password management
export function usePeoplePasswordManagement() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; action: 'set' | 'reset'; password?: string }>({
    mutationFn: async ({ id, action, password }) => {
      const endpoint = action === 'set' 
        ? `/api/people/${id}/password`
        : `/api/people/${id}/password/reset`;
      
      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate specific person data
      queryClient.invalidateQueries({ queryKey: ['/api/people', variables.id] });
    },
  });
}
