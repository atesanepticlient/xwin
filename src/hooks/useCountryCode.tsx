"use client";

import { useEffect, useState } from "react";

type CountryData = {
  countryCode: string | null;
  loading: boolean;
  error: string | null;
};

export default function useCountryCode(): CountryData {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const res = await fetch("/api/country-code");

        if (!res.ok) {
          throw new Error("Failed to fetch country");
        }

        const data = await res.json();
        setCountryCode(data.countryCode);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, []);

  return {
    countryCode,
    loading,
    error,
  };
}
