'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

import { Skeleton } from "@/components/ui/skeleton";

export function StudentChart({
  data,
  isLoading,
}: {
  data: { date: string; value: number }[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="w-full h-[300px] rounded-xl" />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
        <XAxis dataKey="date" stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 10,
            border: '1px solid #ccc',
            boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
          }}
        />
        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
