import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import {
    ArrowUpRight,
    Check,
    X,
    Search,
    Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/api/supabaseClient";
import { format, startOfMonth, parseISO, startOfWeek } from 'date-fns';
import TransactionTable from "../components/history/TransactionTable";
import DateRangeNavigator from "@/components/common/DateRangeNavigator";

export default function Insights() {
    const [chartType, setChartType] = useState('line');
    const [insights, setInsights] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalSavings, setTotalSavings] = useState(0);
    const [monthSpend, setMonthSpend] = useState(0);
    const [monthCashback, setMonthCashback] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState(undefined);
    const [dateMode, setDateMode] = useState('custom');
    const [grouping, setGrouping] = useState('daily');

    const [users, setUsers] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (transactions.length > 0) {
            let filtered = transactions;

            // Search Filter
            if (searchQuery) {
                filtered = filtered.filter(t =>
                    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.to_company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.from_company_name?.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Date Range Filter
            if (dateRange?.from) {
                const fromDate = new Date(dateRange.from);
                fromDate.setHours(0, 0, 0, 0);

                const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
                toDate.setHours(23, 59, 59, 999);

                filtered = filtered.filter(transaction => {
                    const transactionDate = new Date(transaction.created_date);
                    return transactionDate >= fromDate && transactionDate <= toDate;
                });
            }

            setFilteredTransactions(filtered);
            processTransactionData(filtered);
        }
    }, [searchQuery, dateRange, grouping, transactions]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch Insights
            const { data: insightsData, error: insightsError } = await supabase
                .from('insights')
                .select('*')
                .eq('status', 'active')
                .order('created_date', { ascending: false });

            if (insightsError) throw insightsError;
            setInsights(insightsData || []);

            // Calculate Total Savings
            const savings = (insightsData || []).reduce((acc, curr) => {
                if (curr.metric_label === 'Potential Savings' && curr.metric_value) {
                    // Remove non-numeric chars except dot
                    const val = parseFloat(curr.metric_value.replace(/[^0-9.]/g, ''));
                    return acc + (isNaN(val) ? 0 : val);
                }
                return acc;
            }, 0);
            setTotalSavings(savings);

            // Fetch Transactions with company details
            const { data: transactionsData, error: transactionsError } = await supabase
                .from('transactions')
                .select('*, to_company:to_company_id(industry, business_address)')
                .eq('status', 'completed')
                .order('created_date', { ascending: true });

            if (transactionsError) throw transactionsError;
            setTransactions(transactionsData || []);
            setFilteredTransactions(transactionsData || []); // Initialize filtered with all data

            // Fetch Users for "People" tab
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('email, full_name');

            if (!usersError && usersData) {
                const userMap = usersData.reduce((acc, user) => {
                    acc[user.email] = user.full_name;
                    return acc;
                }, {});
                setUsers(userMap);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processTransactionData = (data) => {
        // Calculate totals
        const spend = data.reduce((acc, t) => acc + Number(t.amount), 0);
        setMonthSpend(spend);
        // Mock cashback logic: 1.5% of spend
        setMonthCashback(spend * 0.015);

        // Prepare Chart Data
        const grouped = data.reduce((acc, t) => {
            const date = parseISO(t.created_date);
            let key;

            if (grouping === 'daily') {
                key = format(date, 'MMM d');
            } else if (grouping === 'weekly') {
                key = format(startOfWeek(date), 'MMM d');
            } else if (grouping === 'monthly') {
                key = format(date, 'MMM yyyy');
            }

            if (!acc[key]) acc[key] = 0;
            acc[key] += Number(t.amount);
            return acc;
        }, {});

        const chart = Object.keys(grouped).map(key => ({
            name: key,
            value: grouped[key]
        }));

        if (chart.length === 0) {
            setChartData([
                { name: 'Nov 1', value: 0 },
                { name: 'Nov 30', value: 0 },
            ]);
        } else {
            setChartData(chart);
        }
    };

    const getAggregatedData = (type) => {
        const data = {};
        // Use filteredTransactions directly as it's already filtered by date and search
        const sourceData = filteredTransactions;
        const total = sourceData.reduce((acc, t) => acc + Number(t.amount), 0);

        sourceData.forEach(t => {
            let key = 'Unknown';
            if (type === 'categories') {
                key = t.to_company?.industry || 'Uncategorized';
                // Capitalize
                key = key.charAt(0).toUpperCase() + key.slice(1);
            } else if (type === 'merchants') {
                key = t.to_company_name;
            } else if (type === 'people') {
                key = users[t.created_by] || t.created_by;
            } else if (type === 'locations') {
                // Extract city from address if possible, else use full address
                const address = t.to_company?.business_address || 'Unknown';
                // Simple assumption: "Street, City, State Zip" -> split by comma
                const parts = address.split(',');
                if (parts.length >= 2) {
                    key = parts[1].trim(); // City
                } else {
                    key = address;
                }
            }

            if (!data[key]) data[key] = { amount: 0, count: 0 };
            data[key].amount += Number(t.amount);
            data[key].count += 1;
        });

        // Convert to array and sort
        return Object.keys(data).map(key => ({
            name: key,
            amount: data[key].amount,
            percent: total > 0 ? (data[key].amount / total) * 100 : 0,
            // Mock % change for demo
            change: (Math.random() * 20 - 5).toFixed(1)
        })).sort((a, b) => b.amount - a.amount);
    };

    const handleDismiss = async (id) => {
        // Optimistic update
        setInsights(prev => prev.filter(i => i.id !== id));

        await supabase
            .from('insights')
            .update({ status: 'dismissed' })
            .eq('id', id);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Insights</h1>
            </div>

            {/* Analytics Section */}
            <div className="border-slate-200">

                {/* Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search Transactions"
                            className="pl-10 border-slate-200 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <DateRangeNavigator
                            dateRange={dateRange}
                            dateMode={dateMode}
                            onDateRangeChange={setDateRange}
                            onDateModeChange={setDateMode}
                        />

                        <Select value={grouping} onValueChange={setGrouping}>
                            <SelectTrigger className="w-[120px] bg-white border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                            <Download className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Stats & Chart */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">This Month's Spend</p>
                                <h2 className="text-4xl font-bold text-slate-900">
                                    ${monthSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h2>
                            </div>
                            <div className="relative group cursor-help">
                                <div className="opacity-50 transition-opacity group-hover:opacity-30">
                                    <h2 className="text-2xl font-bold text-emerald-500">
                                        ${monthCashback.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </h2>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded font-medium shadow-lg whitespace-nowrap">
                                        Cashback Coming Soon
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Tabs value={chartType} onValueChange={setChartType} className="w-[120px]">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="line">Line</TabsTrigger>
                                <TabsTrigger value="bar">Bar</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent className="h-[400px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'line' ? (
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e2e8f0" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#e2e8f0" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        padding={{ left: 20, right: 20 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(value) => `$${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                                        formatter={(value) => [`$${value}`, 'Spend']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#94a3b8"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            ) : (
                                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(value) => `$${value / 1000}k`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                        <div className="absolute bottom-16 right-16 bg-white px-3 py-1 rounded shadow-sm border border-slate-200 text-xs text-slate-500 font-medium">
                            Last Month: $800k
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {insights.map((card) => (
                    <Card key={card.id} className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        {card.is_new && (
                            <Badge className="absolute top-4 right-4 bg-lime-300 text-lime-900 hover:bg-lime-400 border-none">
                                New
                            </Badge>
                        )}
                        <CardHeader className="pb-2 pt-6">
                            <CardTitle className="text-lg font-semibold text-slate-800 leading-tight">
                                {card.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 mb-6 min-h-[60px]">
                                {card.description}
                            </p>

                            <div className="space-y-1 mb-6">
                                {(card.metric_value || card.metric_label) && (
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                        {card.metric_label}
                                    </p>
                                )}
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-xl font-bold ${card.type === 'warning' ? 'text-red-500' : 'text-green-500'}`}>
                                        {card.metric_value}
                                    </span>
                                    {/* Frequency is hardcoded for now or could be added to DB */}
                                    {card.metric_label === 'Potential Savings' && (
                                        <span className="text-sm text-slate-400 font-medium">/ Year</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                {card.logo_url ? (
                                    <img src={card.logo_url} alt="" className="w-8 h-8 rounded-full object-contain bg-slate-50 p-1" />
                                ) : (
                                    <div className={`w-8 h-8 rounded-full ${card.logo_color || 'bg-slate-200'} flex items-center justify-center text-white text-xs font-bold`}>
                                        {card.title.substring(0, 2)}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDismiss(card.id)}
                                        className="w-8 h-8 rounded-full border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-slate-200 text-slate-400 hover:text-green-500 hover:border-green-200 hover:bg-green-50">
                                        <Check className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Summary Card */}
                <Card className="border-slate-200 shadow-sm bg-slate-50/50 flex flex-col justify-center">
                    <CardContent className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-500">Total Savings Identified</p>
                            <h3 className="text-3xl font-bold text-slate-900">
                                ${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <Button variant="outline" className="w-full justify-between group bg-white border-slate-200 hover:border-blue-300 hover:text-blue-600">
                            Previous Insights
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Spending Breakdown */}
            <div className="pt-8 border-t border-slate-200">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Spending Breakdown</h2>
                        <p className="text-sm text-slate-500">Analyze your spending across different dimensions</p>
                    </div>

                    <Tabs defaultValue="categories" className="w-full">
                        <TabsList className="bg-slate-100 p-1 mb-6">
                            <TabsTrigger value="categories">Categories</TabsTrigger>
                            <TabsTrigger value="merchants">Merchants</TabsTrigger>
                            <TabsTrigger value="people">People</TabsTrigger>
                            <TabsTrigger value="locations">Locations</TabsTrigger>
                        </TabsList>

                        {['categories', 'merchants', 'people', 'locations'].map((tab) => (
                            <div key={tab}>
                                <TabsContent value={tab} className="mt-0">
                                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Name</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">% Spend</th>
                                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Money Spend</th>
                                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">% Change</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 bg-white">
                                                {getAggregatedData(tab).map((item, i) => (
                                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                                                    {item.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <span className="font-medium text-slate-900">{item.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-slate-900 rounded-full"
                                                                        style={{ width: `${item.percent}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs font-medium text-slate-500 w-12">{item.percent.toFixed(1)}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="font-medium text-slate-900">
                                                                ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${Number(item.change) < 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                                {Number(item.change) > 0 ? '+' : ''}{item.change}%
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {getAggregatedData(tab).length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                            No data available for this period
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>
                            </div>
                        ))}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
