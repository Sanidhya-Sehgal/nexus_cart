'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSyncHistory, clearSyncHistory } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SyncHistory() {
  const queryClient = useQueryClient();

  const { data: logs, isLoading, isError } = useQuery({
    queryKey: ['syncHistory'],
    queryFn: fetchSyncHistory,
    refetchInterval: 5000,
  });

  const clearMutation = useMutation({
    mutationFn: clearSyncHistory,
    onSuccess: () => {
      toast.success('Activity log cleared successfully');
      queryClient.invalidateQueries({ queryKey: ['syncHistory'] });
    },
    onError: () => {
      toast.error('Failed to clear activity log');
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-800 rounded"></div>
              <div className="h-4 bg-slate-800 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Activity Log</h2>
          <p className="text-sm text-slate-400">Recent synchronization events and AI generations.</p>
        </div>
        {logs && logs.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              if (confirm('Are you sure you want to clear all sync history?')) {
                clearMutation.mutate();
              }
            }}
            disabled={clearMutation.isPending}
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 gap-2 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-slate-900/80 border-b border-slate-800/60">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-slate-400 font-semibold h-12">Product Name</TableHead>
              <TableHead className="text-slate-400 font-semibold h-12">Platform</TableHead>
              <TableHead className="text-slate-400 font-semibold h-12">Status</TableHead>
              <TableHead className="text-slate-400 font-semibold h-12">Date</TableHead>
              <TableHead className="text-right text-slate-400 font-semibold h-12">Live Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                  No sync logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs?.map((log: any) => (
                <TableRow key={log.id} className="border-b border-slate-800/40 hover:bg-slate-800/40 transition-all duration-200">
                  <TableCell className="font-semibold text-slate-200">{log.product_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-800/80 text-slate-300 border-slate-700/80 px-2 py-0.5 rounded-md font-medium">
                      {log.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.status === 'Synced'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20 px-2.5 py-0.5 rounded-full font-medium'
                      }
                    >
                      {log.status === 'Synced' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2" />}
                      {log.status !== 'Synced' && <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-2" />}
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm font-mono">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      {format(new Date(log.synced_at), 'MMM d, HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {log.live_link ? (
                      <a
                        href={log.live_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20"
                      >
                        View Post
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-slate-600 font-medium">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
