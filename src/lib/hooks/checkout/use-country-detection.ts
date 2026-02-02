import { useState, useEffect } from 'react';

interface UseCountryDetectionOptions {
  countryCodeKey?: string;
  countryNameKey?: string;
  fallbackCountryCode?: string;
  fallbackCountryName?: string;
}

interface UseCountryDetectionResult {
  countryCode: string | undefined;
  countryName: string | undefined;
  isLoading: boolean;
}

/**
 * Hook to detect and manage user's country from localStorage
 * Falls back to a default country if not found
 */
export function useCountryDetection(
  options: UseCountryDetectionOptions = {}
): UseCountryDetectionResult {
  const {
    countryCodeKey = 'user_country_code',
    countryNameKey = 'user_country_name',
    fallbackCountryCode = 'CI',
    fallbackCountryName = 'Côte d\'Ivoire',
  } = options;

  const [countryCode, setCountryCode] = useState<string | undefined>(
    fallbackCountryCode
  );
  const [countryName, setCountryName] = useState<string | undefined>(
    fallbackCountryName
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      // Try to get country code and name from localStorage
      const storedCountryCode = localStorage.getItem(countryCodeKey);
      const storedCountryName = localStorage.getItem(countryNameKey);

      if (storedCountryCode) {
        setCountryCode(storedCountryCode);
      } else {
        setCountryCode(fallbackCountryCode);
      }

      if (storedCountryName) {
        setCountryName(storedCountryName);
      } else {
        setCountryName(fallbackCountryName);
      }
    } catch (error) {
      // If localStorage is not available, use fallback
      console.warn('Failed to access localStorage:', error);
      setCountryCode(fallbackCountryCode);
      setCountryName(fallbackCountryName);
    } finally {
      setIsLoading(false);
    }
  }, [countryCodeKey, countryNameKey, fallbackCountryCode, fallbackCountryName]);

  return {
    countryCode,
    countryName,
    isLoading,
  };
}
