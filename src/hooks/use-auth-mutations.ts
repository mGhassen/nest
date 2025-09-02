import { useMutation } from "@tanstack/react-query";
import { authApi, type LoginCredentials, type RegisterData } from "@/lib/api";

// Hook for user registration
export function useAuthRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

// Hook for resending confirmation email
export function useAuthResendConfirmation() {
  return useMutation({
    mutationFn: authApi.resendConfirmation,
  });
}

// Hook for password reset
export function useAuthResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
}

// Hook for checking account status
export function useAuthCheckStatus() {
  return useMutation({
    mutationFn: authApi.checkStatus,
  });
}
