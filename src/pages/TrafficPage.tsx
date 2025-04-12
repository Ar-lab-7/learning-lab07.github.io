
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart, Calendar, Globe, Laptop, Smartphone, Tablet } from 'lucide-react';
import { TrafficService, TrafficStats } from '@/services/TrafficService';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const TrafficPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const { isDeveloper } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not a developer
    if (!isDeveloper) {
      navigate('/');
      return;
    }
    
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
  }, [isDeveloper, navigate]);
  
  // Convert object data to array format for charts
  const prepareChartData = (data: Record<string, number> = {}) => {
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };
  
  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Format date labels to be more readable
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Home
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Traffic Analytics</h1>
          <p className="text-muted-foreground">Monitor website performance and visitor behavior</p>
        </div>
        
        <Button 
          onClick={() => window.location.reload()} 
          variant="secondary" 
          className="mt-4 md:mt-0"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh Data'}
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Pageviews</CardDescription>
                <CardTitle className="text-3xl">{stats.totalViews}</CardTitle>
              </CardHeader>
              <CardContent>
                <Globe className="text-muted-foreground" size={16} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Unique Visitors</CardDescription>
                <CardTitle className="text-3xl">{stats.uniqueVisitors}</CardTitle>
              </CardHeader>
              <CardContent>
                <Laptop className="text-muted-foreground" size={16} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pages / Visitor</CardDescription>
                <CardTitle className="text-3xl">
                  {stats.uniqueVisitors ? (stats.totalViews / stats.uniqueVisitors).toFixed(1) : '0'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart className="text-muted-foreground" size={16} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Top Device</CardDescription>
                <CardTitle className="text-3xl">
                  {Object.entries(stats.byDevice).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {Object.entries(stats.byDevice).sort((a, b) => b[1] - a[1])[0]?.[0] === 'Mobile' ? (
                    <Smartphone className="text-muted-foreground" size={16} />
                  ) : Object.entries(stats.byDevice).sort((a, b) => b[1] - a[1])[0]?.[0] === 'Tablet' ? (
                    <Tablet className="text-muted-foreground" size={16} />
                  ) : (
                    <Laptop className="text-muted-foreground" size={16} />
                  )}
                  <span className="ml-2 text-muted-foreground">
                    {Object.entries(stats.byDevice).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} visits
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview" className="w-full mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="devices">Devices & Browsers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2" size={18} />
                    Daily Visits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={prepareChartData(stats.byDate).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80} 
                          tickFormatter={formatDate} 
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Visits" fill="#8884d8" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pages">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={prepareChartData(stats.byPage).sort((a, b) => b.value - a.value).slice(0, 10)}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={140} 
                          tick={{ fontSize: 12 }} 
                        />
                        <Tooltip />
                        <Bar dataKey="value" name="Visits" fill="#82ca9d" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="devices">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Types</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Browsers</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                          <Tooltip />
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
          <h3 className="text-xl font-medium text-muted-foreground mb-2">No traffic data found</h3>
          <p className="text-muted-foreground mb-4">There is no traffic data available yet.</p>
        </div>
      )}
    </div>
  );
};

export default TrafficPage;
