import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { DocumentModal } from './components/DocumentModal';
import { AddDocumentModal } from './components/AddDocumentModal';
import { StatsModal } from './components/StatsModal';
import { Filters } from './components/Filters';
import { supabase } from './lib/supabase';
import type { Database } from './lib/database.types';
import { Sparkles, FileText } from 'lucide-react';

type Document = Database['public']['Tables']['documents']['Row'];

function App() {
  const { user, loading: authLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredDocuments(documents);
    } else {
      setFilteredDocuments(documents.filter(doc => doc.category === selectedCategory));
    }
  }, [selectedCategory, documents]);

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading documents:', error);
      return;
    }

    setDocuments(data || []);
    setFilteredDocuments(data || []);

    const uniqueCategories = Array.from(new Set(data?.map(doc => doc.category) || []));
    setCategories(uniqueCategories);
  };

  const handleSearch = async (query: string) => {
    if (!user) return;

    setSearching(true);
    setSearchQuery(query);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('is_archived', false)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const results = data || [];
      setFilteredDocuments(results);

      await supabase.from('search_history').insert({
        user_id: user.id,
        query,
        results_count: results.length,
      });
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleResultClick = async (documentId: string) => {
    if (!user) return;

    const doc = filteredDocuments.find(d => d.id === documentId);
    if (doc) {
      setSelectedDocument(doc);

      await supabase.from('document_views').insert({
        document_id: documentId,
        user_id: user.id,
      });
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setHasSearched(false);
    setSearchQuery('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return <Auth onBackToLanding={() => setShowAuth(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header
        onAddDocument={() => setShowAddModal(true)}
        onViewStats={() => setShowStatsModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Search Your Company Knowledge
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Instantly find information across your wikis, documentation, support tickets, and more
          </p>
        </div>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} loading={searching} />
        </div>

        {!hasSearched && documents.length > 0 && (
          <div className="mb-6">
            <Filters
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              categories={categories}
            />
          </div>
        )}

        {hasSearched && searchQuery && (
          <div className="mb-4 text-center">
            <p className="text-slate-600">
              Showing results for <span className="font-semibold text-slate-900">"{searchQuery}"</span>
            </p>
          </div>
        )}

        {hasSearched || selectedCategory !== 'all' ? (
          <SearchResults results={filteredDocuments} onResultClick={handleResultClick} />
        ) : documents.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">No documents yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Start building your knowledge base by adding your first document
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add Your First Document
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Ready to search
            </h3>
            <p className="text-slate-600">
              Enter your query above to search through {documents.length} documents
            </p>
          </div>
        )}
      </main>

      {selectedDocument && (
        <DocumentModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {showAddModal && (
        <AddDocumentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={loadDocuments}
        />
      )}

      {showStatsModal && (
        <StatsModal onClose={() => setShowStatsModal(false)} />
      )}
    </div>
  );
}

export default App;
