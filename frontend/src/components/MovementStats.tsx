import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { MovementResponse } from '../services/api';

interface MovementStatsProps {
  movements: MovementResponse[];
}

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444']; // Emerald, Amber, Blue, Red

const MovementStats: React.FC<MovementStatsProps> = ({ movements }) => {

  // 1. Data for Pie Chart (Distribution by Type)
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    movements.forEach(m => {
      counts[m.type] = (counts[m.type] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [movements]);

  // 2. Data for Bar Chart (Movements by Day - Last 7 days or all visible)
  const dailyData = useMemo(() => {
    // Sort by date ascending
    const sorted = [...movements].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Group by date
    const byDate: Record<string, any> = {};
    
    sorted.forEach(m => {
      const dateKey = new Date(m.timestamp).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit' });
      if (!byDate[dateKey]) {
        byDate[dateKey] = { name: dateKey, Ingreso: 0, Egreso: 0, Ajuste: 0 };
      }
      // Assuming types are exactly 'Ingreso', 'Egreso', 'Ajuste'
      if (byDate[dateKey][m.type] !== undefined) {
         byDate[dateKey][m.type]++;
      }
    });

    // Take last 10 entries to make chart readable, or all if few
    return Object.values(byDate).slice(-14); 
  }, [movements]);

  // 3. User Activity (Top Movers)
  const topUsersData = useMemo(() => {
    const counts: Record<string, number> = {};
    movements.forEach(m => {
       const respName = m.responsibleId && typeof m.responsibleId === 'object' ? m.responsibleId.name : 'Desc.';
       counts[respName] = (counts[respName] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }, [movements]);


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fadeIn">
      
      {/* Chart 1: Distribution */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[350px]">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Distribución por Tipo</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Daily Activity */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[350px]">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Actividad Diaria (Últimos días)</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailyData}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="Ingreso" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Egreso" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Ajuste" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Top Users Activity (Full Width) */}
      <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[300px]">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Top 5 Usuarios Activos</h3>
        <div className="flex-1 w-full min-h-0">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topUsersData}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={150} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MovementStats;
