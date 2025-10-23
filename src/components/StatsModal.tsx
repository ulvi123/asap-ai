import { X, TrendingUp, FileText, Search, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface StatsModalProps {
  onClose: () => void;
}

interface Stats {
  totalDocuments: number;
  totalSearches: number;
  recentSearches: Array<{ query: string; created_at: string; results_count: number }>;
  popularDocuments: Array<{ title: string; view_count: number }>;
}

export function StatsModal({ onClose }: StatsModalProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalDocuments: 0,
    totalSearches: 0,
    recentSearches: [],
    popularDocuments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const [docsResult, searchesResult, recentSearchesResult, popularDocsResult] = await Promise.all([
        supabase.from('documents').select('id', { count: 'exact', head: true }),
        supabase.from('search_history').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase
          .from('search_history')
          .select('query, created_at, results_count')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.rpc('get_popular_documents', {}, { count: 'exact' }).limit(5),
      ]);

      const popularDocs = popularDocsResult.data || [];

      setStats({
        totalDocuments: docsResult.count || 0,
        totalSearches: searchesResult.count || 0,
        recentSearches: recentSearchesResult.data || [],
        popularDocuments: popularDocs,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Search Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading statistics...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Total Documents</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalDocuments}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Search className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Your Searches</span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">{stats.totalSearches}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Recent Searches
                </h3>
                {stats.recentSearches.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recentSearches.map((search, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{search.query}</p>
                          <p className="text-sm text-slate-600">
                            {search.results_count} results
                          </p>
                        </div>
                        <p className="text-sm text-slate-500">
                          {new Date(search.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-8">No searches yet</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Popular Documents
                </h3>
                {stats.popularDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {stats.popularDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <p className="font-medium text-slate-900">{doc.title}</p>
                        <span className="text-sm text-slate-600">{doc.view_count} views</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-8">No document views yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
