import React from "react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area } from "recharts";

const UserGrowthChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
        User Registration Growth
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{fontSize: 11}} tickMargin={10} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 11}} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
            <Legend iconType="circle" />
            <Area type="monotone" name="New Residents" dataKey="newResidents" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRes)" />
            <Area type="monotone" name="New Workers" dataKey="newProviders" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorProv)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserGrowthChart;
