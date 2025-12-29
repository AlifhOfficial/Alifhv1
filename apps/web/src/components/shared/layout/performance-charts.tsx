"use client";

import { 
  RadialBarChart, 
  RadialBar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface RevenueBreakdownChartProps {
  data: Array<{ name: string; value: number; fill: string }>;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  }).format(cents / 100);
};

export function RevenueBreakdownChart({ data }: RevenueBreakdownChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px'
          }}
          formatter={(value: number) => formatCurrency(value * 100)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface RatingRadialChartProps {
  data: Array<{ name: string; value: number; fill: string }>;
}

export function RatingRadialChart({ data }: RatingRadialChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <RadialBarChart 
        cx="50%" 
        cy="50%" 
        innerRadius="60%" 
        outerRadius="100%" 
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar
          dataKey="value"
          cornerRadius={10}
          fill="#f59e0b"
          background={{ fill: 'hsl(var(--muted))' }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

interface EngagementBarChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
};

export function EngagementBarChart({ data }: EngagementBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px'
          }}
          formatter={(value: number) => formatNumber(value)}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface QualityMetricsBarChartProps {
  data: Array<{ name: string; value: number; max: number; fill: string }>;
}

export function QualityMetricsBarChart({ data }: QualityMetricsBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" domain={[0, 5]} hide />
        <YAxis type="category" dataKey="name" hide />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px'
          }}
          formatter={(value: number) => `${value.toFixed(1)}/5`}
        />
        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface OperationalRadialChartProps {
  data: Array<{ name: string; value: number; fill: string }>;
}

export function OperationalRadialChart({ data }: OperationalRadialChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadialBarChart 
        cx="50%" 
        cy="50%" 
        innerRadius="20%" 
        outerRadius="90%" 
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar
          dataKey="value"
          cornerRadius={10}
          background={{ fill: 'hsl(var(--muted))' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px'
          }}
          formatter={(value: number) => `${value.toFixed(1)}%`}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
