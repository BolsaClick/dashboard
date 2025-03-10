import { useEffect, useState } from "react";
import Layout from "../layout";
import { getStudent, Student } from "@/api/get-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { format, subDays, subHours, isAfter } from "date-fns";
import CardDisplay from "./CardDisplay";
import StudentChart from "./StudentChart";

type ChartData = {
  date: string;
  value: number;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [analyticsData, setAnalyticsData] = useState<ChartData[]>([]);
  const [filterTime, setFilterTime] = useState<'last_24h' | 'last_7_days' | 'last_30_days'>('last_7_days');
  const [percentage, setPercentage] = useState<number>(0);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await getStudent(1, 9999);
      setStudents(response.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAnalytics = () => {
    let startDate: Date;
    let groupByDay = true;
    const now = new Date();

    if (filterTime === 'last_24h') {
      startDate = subHours(now, 24);
      groupByDay = false;
    } else if (filterTime === 'last_7_days') {
      startDate = subDays(now, 7);
    } else {
      startDate = subDays(now, 30);
    }

    const filtered = students.filter(s => isAfter(new Date(s.createdAt), startDate));

    const groupMap: Record<string, number> = {};
    filtered.forEach(student => {
      const date = new Date(student.createdAt);
      const key = groupByDay ? format(date, 'dd/MM') : format(date, 'HH:00');
      groupMap[key] = (groupMap[key] || 0) + 1;
    });

    const sortedKeys = Object.keys(groupMap).sort((a, b) => {
      const aDate = groupByDay ? parseDate(a) : parseHour(a);
      const bDate = groupByDay ? parseDate(b) : parseHour(b);
      return aDate.getTime() - bDate.getTime();
    });

    const chart: ChartData[] = sortedKeys.map(key => ({
      date: key,
      value: groupMap[key],
    }));

    setAnalyticsData(chart);

    const last = chart[chart.length - 1]?.value || 0;
    const previous = chart[chart.length - 2]?.value || 0;
    const diff = last - previous;
    const percent = previous > 0 ? (diff / previous) * 100 : 0;
    setPercentage(percent);
  };

  const parseDate = (dateStr: string) => {
    const [day, month] = dateStr.split('/');
    return new Date(Number(new Date().getFullYear()), Number(month) - 1, Number(day));
  };

  const parseHour = (hourStr: string) => {
    return new Date(new Date().setHours(Number(hourStr.split(':')[0]), 0, 0, 0));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      calculateAnalytics();
    }
  }, [students, filterTime]);

  return (
    <Layout title="home">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard - Alunos</h1>
          <div className="flex gap-2">
            <Button variant={filterTime === 'last_24h' ? 'default' : 'outline'} onClick={() => setFilterTime('last_24h')}>24h</Button>
            <Button variant={filterTime === 'last_7_days' ? 'default' : 'outline'} onClick={() => setFilterTime('last_7_days')}>7 dias</Button>
            <Button variant={filterTime === 'last_30_days' ? 'default' : 'outline'} onClick={() => setFilterTime('last_30_days')}>30 dias</Button>
          </div>
        </div>
        <CardDisplay />
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">Alunos cadastrados</CardTitle>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              Crescimento:&nbsp;
              <span className={percentage >= 0 ? "text-green-600 font-medium flex items-center" : "text-red-600 font-medium flex items-center"}>
                {percentage >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                {percentage.toFixed(2)}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <StudentChart data={analyticsData} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
