import { X, Calendar, User, Tag, FileText } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Document = Database['public']['Tables']['documents']['Row'];

interface DocumentModalProps {
  document: Document | null;
  onClose: () => void;
}

export function DocumentModal({ document, onClose }: DocumentModalProps) {
  if (!document) return null;

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(document.category)}`}>
              {document.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {document.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Created {new Date(document.created_at).toLocaleDateString()}</span>
            </div>
            {document.updated_at !== document.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Updated {new Date(document.updated_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {document.tags && document.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-slate-600" />
                <span className="font-medium text-slate-900">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {document.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
