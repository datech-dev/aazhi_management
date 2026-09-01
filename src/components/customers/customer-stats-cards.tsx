import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Users, Sparkles, Repeat, IndianRupee } from "lucide-react";

interface CustomerStatsProps {
  stats: {
    totalClients: number;
    bridalClients: number;
    repeatClients: number;
    repeatRate: number;
    totalRevenue: number;
  };
}

export function CustomerStatsCards({ stats }: CustomerStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-border/70 shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Clients
          </CardTitle>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Users className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-heading text-foreground">
            {stats.totalClients}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Registered boutique profiles
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Bridal / Premium
          </CardTitle>
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <Sparkles className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-heading text-purple-700">
            {stats.bridalClients}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Bridal & high-touch wear
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Repeat Rate
          </CardTitle>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Repeat className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-heading text-emerald-700">
            {stats.repeatRate}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.repeatClients} repeat client(s)
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Lifetime Value
          </CardTitle>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <IndianRupee className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-heading text-foreground">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Cumulative client purchases
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
