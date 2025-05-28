// components/AutoLogoutWrapper.tsx
'use client';
import { useAutoLogout } from "@/hooks/useAutoLogout";
import { usePathname } from 'next/navigation';

interface AutoLogoutWrapperProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
}

export function AutoLogoutWrapper({
  children,
  timeoutMinutes
}: AutoLogoutWrapperProps) {
  const pathname = usePathname();

  const getTimeoutMinutes = () => {
    // If specific timeout is provided, use it (overrides route-based logic)
    if (timeoutMinutes !== undefined) {
      return timeoutMinutes;
    }

    // Route-based timeout logic based on your routes
    if (pathname?.startsWith('/admin')) {
      return 15; // Admin areas - longer timeout for administrative tasks
    }
    
    if (pathname?.startsWith('/doctor')) {
      return 10; // Doctor areas - moderate timeout for patient reviews
    }
    
    if (pathname?.startsWith('/patient')) {
      return 12; // Patient areas - longer timeout for form filling/registration
    }
    
    if (pathname?.startsWith('/staff')) {
      return 8; // Staff areas - moderate timeout for daily tasks
    }
    
    if (pathname?.startsWith('/record')) {
      if (pathname.includes('/patients')) {
        return 10; // Patient records - moderate timeout for data review
      }
      if (pathname.includes('/doctors') || pathname.includes('/staffs') || pathname.includes('/users')) {
        return 15; // Admin record management - longer timeout
      }
      return 12; // Default for other record routes
    }
    
    // Default timeout for other routes (including root, login, etc.)
    return 8;
  };

  useAutoLogout(getTimeoutMinutes());
  
  return <>{children}</>;
}
