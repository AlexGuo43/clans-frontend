'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getDashboard } from '@/lib/auth';

export default function DashboardPage() {
  const [message, setMessage] = useState('');
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    getDashboard(token)
      .then(setMessage)
      .catch((error) => {
        console.error('Dashboard error:', error);
        router.push('/login');
      });
  }, [token, isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p>{message}</p>
    </div>
  );
}