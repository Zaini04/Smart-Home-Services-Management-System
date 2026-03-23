import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { 
  FaChartLine, FaSpinner, FaLightbulb, FaMoneyBillWave, 
  FaClipboardList, FaUsers, FaStar, FaExclamationTriangle, FaTrophy
} from "react-icons/fa";
import { getComprehensiveAnalytics } from "../../api/adminEndPoints"; // Adjust path

export default function AdminAnalytics() {

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: async () => {
      const res = await getComprehensiveAnalytics();
      return res.data.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Crunching your platform data...</p>
      </div>
    );
  }

  const { summary, charts, providers, insights } = analytics;

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      
      {/* 1. Page Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaChartLine className="text-blue-600" /> Platform Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Deep dive into revenue, growth, and user behavior.</p>
        </div>
      </div>

      {/* 2. Top Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <FaMoneyBillWave className="w-5 h-5" />
            <h3 className="font-semibold text-gray-600">30-Day Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">Rs. {summary.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <FaClipboardList className="w-5 h-5" />
            <h3 className="font-semibold text-gray-600">Total Bookings</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.totalBookings.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-purple-600 mb-2">
            <FaUsers className="w-5 h-5" />
            <h3 className="font-semibold text-gray-600">Repeat Customers</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.repeatCustomers}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-orange-600 mb-2">
            <FaStar className="w-5 h-5" />
            <h3 className="font-semibold text-gray-600">Retention Rate</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.retentionRate}</p>
        </div>
      </div>

      {/* 3. Main Charts: Revenue & User Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue & Bookings Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue & Bookings Trend (30 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.timeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Line yAxisId="left" type="monotone" name="Revenue (Rs)" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" name="Bookings Count" dataKey="bookings" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Area Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">User Growth (New Registrations)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.timeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Area type="monotone" name="New Residents" dataKey="newResidents" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRes)" />
                <Area type="monotone" name="New Workers" dataKey="newProviders" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorProv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. AI Insights & Pie Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2 mb-4">
            <FaLightbulb className="text-yellow-500" /> Platform Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-white/70 p-4 rounded-xl border border-white text-sm text-gray-700 font-medium shadow-sm">
                {insight}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Booking Success</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.bookingStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                  {charts.bookingStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Legend iconType="circle" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Top Providers Detailed Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <FaTrophy className="text-yellow-600 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Top Performing Workers (All Time)</h2>
            <p className="text-xs text-gray-500">Based on total completed jobs, actual earnings, and commissions generated.</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Rank</th>
                <th className="px-6 py-4 font-semibold">Provider</th>
                <th className="px-6 py-4 font-semibold text-center">Completed Jobs</th>
                <th className="px-6 py-4 font-semibold text-right">Provider Earnings</th>
                <th className="px-6 py-4 font-semibold text-right">Platform Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {providers.top.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No jobs completed yet.</td>
                </tr>
              ) : (
                providers.top.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          index === 1 ? 'bg-gray-200 text-gray-700' : 
                          index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}`}
                      >
                        #{index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image || "https://via.placeholder.com/40"} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-100"
                        />
                        <div>
                          <p className="font-bold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            {item.phone} • <FaStar className="text-yellow-500" /> {item.rating}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-700">
                      {item.jobs}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      Rs. {item.totalEarning.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">
                      Rs. {item.totalCommission.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}