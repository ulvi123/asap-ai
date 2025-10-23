import { FileText, Calendar, Tag, ExternalLink } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Document = Database['public']['Tables']['documents']['Row'];

interface SearchResultsProps {
  results: Document[];
  onResultClick: (documentId: string) => void;
}

export function SearchResults({ results, onResultClick }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
        <p className="text-slate-600">Try a different search query or add more documents</p>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      wiki: 'bg-blue-100 text-blue-700',
      support: 'bg-green-100 text-green-700',
      docs: 'bg-amber-100 text-amber-700',
      general: 'bg-slate-100 text-slate-700',
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {results.length} {results.length === 1 ? 'Result' : 'Results'}
        </h2>
      </div>

      {results.map((result) => (
        <div
          key={result.id}
          onClick={() => onResultClick(result.id)}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                {result.title}
              </h3>
              <p className="text-slate-600 line-clamp-3">
                {result.content.substring(0, 300)}
                {result.content.length > 300 ? '...' : ''}
              </p>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`px-3 py-1 rounded-full font-medium ${getCategoryColor(result.category)}`}>
              {result.category}
            </span>

            {result.tags && result.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                <div className="flex gap-2">
                  {result.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-slate-600">
                      {tag}
                    </span>
                  ))}
                  {result.tags.length > 3 && (
                    <span className="text-slate-400">+{result.tags.length - 3} more</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-slate-500 ml-auto">
              <Calendar className="w-4 h-4" />
              {new Date(result.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
