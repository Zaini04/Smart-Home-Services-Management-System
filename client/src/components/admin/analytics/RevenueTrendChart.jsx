import React from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";

const RevenueTrendChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
        Revenue & Bookings Trend
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              tick={{fontSize: 11, fontWeight: 600}} 
              tickMargin={10} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              yAxisId="left" 
              tick={{fontSize: 11}} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{fontSize: 11}} 
              axisLine={false} 
              tickLine={false} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
            />
            <Legend iconType="circle" />
            <Line 
              yAxisId="left" 
              type="monotone" 
              name="Revenue (Rs)" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={4} 
              dot={false} 
              activeDot={{ r: 8, strokeWidth: 0 }} 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              name="Bookings" 
              dataKey="bookings" 
              stroke="#3b82f6" 
              strokeWidth={4} 
              dot={false} 
              activeDot={{ r: 8, strokeWidth: 0 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueTrendChart;
