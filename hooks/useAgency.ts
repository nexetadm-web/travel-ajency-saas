'use client';

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
  role: 'agency' | 'super_admin';
  created_at?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch agency info');
  }
  return res.json();
};

export function useAgency() {
  const { data, error, isLoading, mutate } = useSWR<{ agency: Agency }>(
    '/api/agency/me',
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  return {
    agency: data?.agency,
    isLoading,
    isError: error,
    mutate,
  };
}
