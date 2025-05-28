// hooks/useAutoLogout.ts
import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useAutoLogout = (timeoutMinutes: number = 2) => {
  const { signOut, isSignedIn } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timeout (30 seconds before logout)
    const warningTime = Math.max(0, (timeoutMinutes * 60 - 30) * 1000);
    warningTimeoutRef.current = setTimeout(() => {
      toast.warning('Session will expire in 30 seconds due to inactivity', {
        duration: 5000,
      });
    }, warningTime);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      console.log('🚪 Auto-logout triggered - signing out user');
      toast.error('Session expired due to inactivity');
      if (isSignedIn) {
        signOut();
      }
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    // Only activate auto-logout if user is signed in
    if (!isSignedIn) {
      return;
    }

    console.log(`🛡️ Auto-logout activated with ${timeoutMinutes} minutes timeout`);

    const events = [
      // Desktop events
      'mousedown', 'mousemove', 'keypress', 'click', 'wheel',
      
      // Mobile/Touch events  
      'touchstart', 'touchmove', 'touchend', 'touchcancel',
      
      // Universal events
      'scroll', 'resize',
      
      // Input/Form events
      'input', 'change', 'focus', 'blur',
      
      // Keyboard events
      'keydown', 'keyup',
      
      // Additional interaction events
      'contextmenu', 'dblclick', 'drag', 'drop'
    ];

    const resetTimeoutHandler = () => {
      resetTimeout();
    };

    // Set initial timeout
    resetTimeout();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimeoutHandler, true);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimeoutHandler, true);
      });
    };
  }, [timeoutMinutes, isSignedIn, signOut]);
};

{/* 
  
   * DYNAMIC TIMEOUT BEHAVIOR BY ROUTE:
 * 
 * Route Pattern    | Timeout Duration | Warning Toast Appears | User Gets Logged Out
 * -----------------|------------------|----------------------|--------------------
 * /admin/*         | 15 minutes       | After 14:30 min     | After 15:00 min
 * /doctor/*        | 10 minutes       | After 9:30 min      | After 10:00 min  
 * /patient/*       | 12 minutes       | After 11:30 min     | After 12:00 min
 * /staff/*         | 8 minutes        | After 7:30 min      | After 8:00 min
 * /record/*        | 10-15 minutes    | 30 sec before       | At timeout
 * Default routes   | 8 minutes        | After 7:30 min      | After 8:00 min
 * 
 * Note: Warning toast always appears 30 seconds before actual logout
 * User activity (tap, scroll, type, etc.) resets the timer back to 0
  
  */}