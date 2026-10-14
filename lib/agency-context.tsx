'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

export interface Agency {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  logo_url?: string | null;
  address?: string | null;
  license_no?: string | null;
  city?: string | null;
  status?: string | null;
  plan?: string | null;
  monthly_fee?: number | null;
  role: 'agency' | 'super_admin';
  created_at?: string;
}

interface AgencyContextType {
  agency: Agency | null;
  agencyId: string | null;
  agencyName: string | null;
  isLoading: boolean;
  error: any;
  refetch: () => Promise<any>;
}

const AgencyContext = createContext<AgencyContextType>({
  agency: null,
  agencyId: null,
  agencyName: null,
  isLoading: true,
  error: null,
  refetch: async () => {},
});

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch agency info');
  }
  return res.json();
};

export function AgencyProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR<{ agency: Agency }>(
    '/api/agency/me',
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const agency = data?.agency || null;
  const [cachedId, setCachedId] = useState<string | null>(null);
  const [cachedName, setCachedName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('agency_id');
      const storedName = localStorage.getItem('agency_name');
      if (storedId) setCachedId(storedId);
      if (storedName) setCachedName(storedName);
    }
  }, []);

  useEffect(() => {
    if (agency && typeof window !== 'undefined') {
      localStorage.setItem('agency_id', agency.id);
      localStorage.setItem('agency_name', agency.name);
      localStorage.setItem('agency_email', agency.email);
      setCachedId(agency.id);
      setCachedName(agency.name);
    }
  }, [agency]);

  return (
    <AgencyContext.Provider
      value={{
        agency,
        agencyId: agency?.id || cachedId,
        agencyName: agency?.name || cachedName,
        isLoading,
        error,
        refetch: mutate,
      }}
    >
      {children}
    </AgencyContext.Provider>
  );
}

export function useAgencyContext() {
  return useContext(AgencyContext);
}
