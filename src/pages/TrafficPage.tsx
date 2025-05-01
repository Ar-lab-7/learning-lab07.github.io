
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart, Calendar, Globe, Laptop, Smartphone, Tablet } from 'lucide-react';
import { TrafficService } from '@/services/TrafficService';
import { TrafficStats } from '@/services/traffic/TrafficTypes';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const TrafficPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const { isDeveloper } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not a developer
    if (!isDeveloper) {
      navigate('/');
      return;
    }
    
    // Record pageview on component mount
    TrafficService.recordPageview();
    
    // Load traffic data
    const loadTrafficData = async () => {
      setIsLoading(true);
      try {
        const trafficStats = await TrafficService.getTrafficStats();
        setStats(trafficStats);
      } catch (error) {
        console.error('Error loading traffic data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTrafficData();
  }, [isDeveloper, navigate, period]);
  
  // Convert object data to array format for charts
  const prepareChartData = (data: Record<string, number> = {}) => {
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };
  
  // Colors for pie charts - more vibrant for better visibility in light mode
  const COLORS = ['#8884d8', '#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#82ca9d'];
  
  // Format date labels to be more readable
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <Button 
            variant="outline" 
            className="mb-4 text-foreground" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Home
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Traffic Analytics</h1>
          <p className="text-muted-foreground">Monitor website performance and visitor behavior</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <select 
            className="border rounded-md p-2 bg-background text-foreground"
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
          >
            <option value="all">All Time</option>
            <option value="month">Past Month</option>
            <option value="week">Past Week</option>
            <option value="today">Today</option>
          </select>
          
          <Button 
            onClick={() => window.location.reload()} 
            variant="secondary" 
            className="text-foreground"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid place-items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading traffic data...</p>
          </div>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-eduAccent/20 shadow-md">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium text-muted-foreground">Total Pageviews</CardDescription>
                <CardTitle className="text-3xl text-foreground">{stats.totalViews.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-muted-foreground">
                  <Globe className="mr-2" size={16} />
                  <span>All traffic</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-eduAccent/20 shadow-md">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium text-muted-foreground">Unique Visitors</CardDescription>
                <CardTitle className="text-3xl text-foreground">{stats.uniqueVisitors.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-muted-foreground">
                  <Laptop className="mr-2" size={16} />
                  <span>Unique IPs</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-eduAccent/20 shadow-md">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium text-muted-foreground">Pages / Visitor</CardDescription>
                <CardTitle className="text-3xl text-foreground">
                  {stats.uniqueVisitors > 0 ? (stats.totalViews / stats.uniqueVisitors).toFixed(1) : '0'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-muted-foreground">
                  <BarChart className="mr-2" size={16} />
                  <span>Engagement</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-eduAccent/20 shadow-md">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium text-muted-foreground">Top Device</CardDescription>
                <CardTitle className="text-3xl text-foreground">
                  {Object.entries(stats.byDevice).length > 0 
                    ? Object.entries(stats.byDevice).sort((a, b) => b[1] - a[1])[0]?.[0] 
                    : 'N/A'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-muted-foreground">
                  {Object.entries(stats.byDevice).length > 0 ? (
                    <>
                      {Object.entries(stats.byDevice).sort((a, b) => b[1] - a[1])[0]?.[0] === 'Mobile' ? (
                        <Smartphone className="mr-2" size={16} />
                      ) : Object.entries(stats.byDevice).sort((a, b) => b[1] - a[1])[0]?.[0] === 'Tablet' ? (
                        <Tablet className="mr-2" size={16} />
                      ) : (
                        <Laptop className="mr-2" size={16} />
                      )}
                      <span>
                        {Object.entries(stats.byDevice).sort((a, b) => b[1] - a[1])[0]?.[1].toLocaleString() || 0} visits
                      </span>
                    </>
                  ) : (
                    <span>No data</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview" className="w-full mb-8">
            <TabsList className="mb-4 bg-muted text-foreground">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
              <TabsTrigger value="pages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pages</TabsTrigger>
              <TabsTrigger value="devices" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Devices & Browsers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card className="border-eduAccent/20 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Calendar className="mr-2" size={18} />
                    Daily Visits
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={prepareChartData(stats.byDate).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80} 
                          tickFormatter={formatDate} 
                          tick={{ fill: '#666' }}
                          stroke="#666"
                        />
                        <YAxis tick={{ fill: '#666' }} stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          labelStyle={{ color: 'var(--foreground)' }}
                        />
                        <Bar dataKey="value" name="Visits" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pages">
              <Card className="border-eduAccent/20 shadow-md">
                <CardHeader>
                  <CardTitle className="text-foreground">Popular Pages</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={prepareChartData(stats.byPage).sort((a, b) => b.value - a.value).slice(0, 10)}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                        <XAxis type="number" tick={{ fill: '#666' }} stroke="#666" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={140} 
                          tick={{ fontSize: 12, fill: '#666' }} 
                          stroke="#666"
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          labelStyle={{ color: 'var(--foreground)' }}
                        />
                        <Bar dataKey="value" name="Visits" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="devices">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-eduAccent/20 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-foreground">Device Types</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareChartData(stats.byDevice)}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepareChartData(stats.byDevice).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                            labelStyle={{ color: 'var(--foreground)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-eduAccent/20 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-foreground">Browsers</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareChartData(stats.byBrowser)}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepareChartData(stats.byBrowser).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                            labelStyle={{ color: 'var(--foreground)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-foreground mb-2">No traffic data found</h3>
          <p className="text-muted-foreground mb-4">There is no traffic data available yet.</p>
          <Button onClick={() => TrafficService.recordPageview()}>Record Current Visit</Button>
        </div>
      )}
    </div>
  );
};

export default TrafficPage;
