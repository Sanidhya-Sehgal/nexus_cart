'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchShopifyProducts, syncProduct } from '@/lib/api';
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
import { Loader2, RefreshCw, ExternalLink, ShoppingBag, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

import { toast } from 'sonner';

export default function InventoryTable() {
  const queryClient = useQueryClient();

  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ['shopifyProducts'],
    queryFn: fetchShopifyProducts,
  });

  const syncMutation = useMutation({
    mutationFn: syncProduct,
    onMutate: (product) => {
      toast.loading(`Drafting AI content for ${product.title}...`, { id: 'sync' });
    },
    onSuccess: (data) => {
      toast.success('Successfully published to WordPress!', { 
        id: 'sync',
        description: 'Sync history updated.'
      });
      queryClient.invalidateQueries({ queryKey: ['syncHistory'] });
    },
    onError: (error: any) => {
      toast.error('Sync failed', { 
        id: 'sync',
        description: error.message || 'Check backend logs.'
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading Shopify products. Please check your API keys.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Inventory</h2>
          <p className="text-sm text-slate-400">Manage and sync your Shopify products to WordPress.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-slate-900/80 border-b border-slate-800/60">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-slate-400 font-semibold h-12">Product</TableHead>
              <TableHead className="text-slate-400 font-semibold h-12">SKU</TableHead>
              <TableHead className="text-slate-400 font-semibold h-12">Price</TableHead>
              <TableHead className="text-slate-400 font-semibold h-12">Status</TableHead>
              <TableHead className="text-right text-slate-400 font-semibold h-12">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product: any) => (
              <TableRow key={product.id} className="border-b border-slate-800/40 hover:bg-slate-800/40 transition-all duration-200">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-4 py-1">
                    {product.image ? (
                      <img
                        src={product.image.src}
                        alt={product.title}
                        className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-800 shadow-md"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center ring-1 ring-slate-700 shadow-md">
                        <ShoppingBag className="h-4 w-4 text-slate-500" />
                      </div>
                    )}
                    <span className="text-slate-200 font-semibold">{product.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-400 font-mono text-sm">{product.variants[0].sku || 'N/A'}</TableCell>
                <TableCell className="text-slate-300 font-medium">${product.variants[0].price}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20 border-0 transition-all duration-300 transform hover:-translate-y-0.5"
                    disabled={syncMutation.isPending}
                    onClick={() => syncMutation.mutate(product)}
                  >
                    {syncMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Drafting...</>
                    ) : (
                      <><Zap className="h-4 w-4 mr-2" /> Sync via AI</>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
