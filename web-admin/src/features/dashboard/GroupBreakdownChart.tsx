import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { GroupStatEntry, Group } from '@/types';

type FilterMode = 'profit' | 'income' | 'expense' | 'memberCount';

// Custom Tooltip Component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: { name: string; value: number; color: string };
  }>;
  filterMode: FilterMode;
}

const CustomTooltip = ({ active, payload, filterMode }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const groupName = data.payload?.name || data.name || '';
    const value = data.value || 0;
    const formattedValue = filterMode === 'memberCount'
      ? value.toString()
      : `${value.toLocaleString()} RSD`;

    return (
      <div
        style={{
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          padding: '8px 12px',
          color: 'hsl(var(--foreground))',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
          {groupName}: {formattedValue}
        </p>
      </div>
    );
  }
  return null;
};

const COACH_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444',
  '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
];

interface GroupBreakdownChartProps {
  data: GroupStatEntry[];
  filterMode: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
  groups?: Group[];
}

const getValueForMode = (entry: GroupStatEntry, mode: FilterMode): number => {
  switch (mode) {
    case 'profit':
      return entry.profit;
    case 'income':
      return entry.totalIncome;
    case 'expense':
      return entry.totalExpense;
    case 'memberCount':
      return entry.memberCount;
  }
};

export const GroupBreakdownChart = ({ data, filterMode, onFilterChange, groups }: GroupBreakdownChartProps) => {
  const { t } = useTranslation();
  const [breakdownMode, setBreakdownMode] = useState<'group' | 'coach'>('group');

  const filterOptions: Array<{ value: FilterMode; label: string }> = [
    { value: 'profit', label: t('dashboard.filterByProfit') },
    { value: 'income', label: t('dashboard.filterByIncome') },
    { value: 'expense', label: t('dashboard.filterByExpense') },
    { value: 'memberCount', label: t('dashboard.filterByMembers') },
  ];

  // Aggregate stats by coach when in coach mode
  const coachStats = useMemo(() => {
    if (!groups || groups.length === 0) return [];
    const coachMap = new Map<string, { name: string; totalIncome: number; totalExpense: number; profit: number; memberCount: number; colorIndex: number }>();
    let colorIdx = 0;
    groups.forEach((group) => {
      const stat = data.find((s) => s.groupId === group._id);
      if (!stat) return;
      (group.coaches || []).forEach((coach) => {
        const key = coach._id;
        if (!coachMap.has(key)) {
          coachMap.set(key, { name: coach.fullName, totalIncome: 0, totalExpense: 0, profit: 0, memberCount: 0, colorIndex: colorIdx++ });
        }
        const entry = coachMap.get(key)!;
        entry.totalIncome += stat.totalIncome;
        entry.totalExpense += stat.totalExpense;
        entry.profit += stat.profit;
        entry.memberCount += stat.memberCount;
      });
    });
    return Array.from(coachMap.values()).map((c) => ({
      name: c.name,
      value: Math.abs(filterMode === 'profit' ? c.profit : filterMode === 'income' ? c.totalIncome : filterMode === 'expense' ? c.totalExpense : c.memberCount),
      color: COACH_COLORS[c.colorIndex % COACH_COLORS.length],
    }));
  }, [groups, data, filterMode]);

  const chartData = useMemo(() => {
    if (breakdownMode === 'coach' && coachStats.length > 0) return coachStats;
    return data.map((entry) => ({
      name: entry.groupName,
      value: Math.abs(getValueForMode(entry, filterMode)),
      color: entry.groupColor || '#3b82f6',
    }));
  }, [data, filterMode, breakdownMode, coachStats]);

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-semibold">
            {breakdownMode === 'coach' ? t('dashboard.coachBreakdown') : t('dashboard.groupBreakdown')}
          </CardTitle>
          {groups && groups.length > 0 && (
            <div className="flex gap-1">
              <Button
                variant={breakdownMode === 'group' ? 'default' : 'outline'}
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => setBreakdownMode('group')}
              >
                {t('dashboard.byGroup')}
              </Button>
              <Button
                variant={breakdownMode === 'coach' ? 'default' : 'outline'}
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => setBreakdownMode('coach')}
              >
                {t('dashboard.byCoach')}
              </Button>
            </div>
          )}
        </div>
        <Select
          value={filterMode}
          onValueChange={(val) => onFilterChange(val as FilterMode)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || total === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>{t('charts.noData')}</p>
          </div>
        ) : (
          <>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip filterMode={filterMode} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {chartData.map((item) => {
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground truncate max-w-[140px]">{item.name}</span>
                    </div>
                    <span className="text-muted-foreground font-medium">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
