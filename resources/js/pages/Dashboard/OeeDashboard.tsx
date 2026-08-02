import { Head } from '@inertiajs/react';
import OeeDashboard from '@/Features/dashboard/OeeDashboard';

export default function DashboardOeePage() {
  return (
    <>
      <Head title="Dashboard OEE" />
      <div
        className="min-h-screen bg-slate-50 p-4 text-gray-800"
        style={{ colorScheme: 'light' }}
      >
        <OeeDashboard />
      </div>
    </>
  );
}
