"use client";

import { Scissors, CheckCircle, Clock, Award } from "lucide-react";

interface TailorPerformanceItem {
  id: string;
  name: string;
  completedCount: number;
  activeCount: number;
  totalGarments: number;
  qcPassRate: number;
}

interface TailorPerformanceTableProps {
  tailors: TailorPerformanceItem[];
}

export function TailorPerformanceTable({ tailors }: TailorPerformanceTableProps) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border/60 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border/60 bg-muted/20 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
            <Scissors className="w-4 h-4 text-primary" />
            Master Tailor Productivity & QC Leaderboard
          </h3>
          <p className="text-xs text-muted-foreground">
            Stitching volume, active queue, and quality check first-pass accuracy
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border/60">
            <tr>
              <th className="px-4 py-3">Tailor Name</th>
              <th className="px-4 py-3 text-center">Active Jobs</th>
              <th className="px-4 py-3 text-center">Completed Jobs</th>
              <th className="px-4 py-3 text-center">Total Garments Stitched</th>
              <th className="px-4 py-3 text-center">QC First-Pass Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {tailors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">
                  No tailor performance data found.
                </td>
              </tr>
            ) : (
              tailors.map((tailor) => (
                <tr key={tailor.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-xs text-foreground flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {tailor.name.charAt(0)}
                    </div>
                    <span>{tailor.name}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-amber-600">
                    {tailor.activeCount}
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-emerald-600">
                    {tailor.completedCount}
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-bold text-foreground">
                    {tailor.totalGarments}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
                        tailor.qcPassRate >= 90
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      <CheckCircle className="w-3 h-3" /> {tailor.qcPassRate}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
