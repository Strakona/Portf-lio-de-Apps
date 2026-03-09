import React, { useState, useEffect } from 'react';
import AppCard from '../../components/AppCard/AppCard';
import { supabase } from '../../services/supabase';
import { Search } from 'lucide-react';
import './Home.css';

const Home = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [categories, setCategories] = useState(['Todas']);

    // Ideias form state
    const [ideaContent, setIdeaContent] = useState('');
    const [ideaLoading, setIdeaLoading] = useState(false);
    const [ideaSuccess, setIdeaSuccess] = useState(false);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            const { data, error } = await supabase
                .from('apps')
                .select('*')
                .order('featured', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            const fetchedApps = data || [];
            setApps(fetchedApps);

            // Extrair categorias exclusivas
            const uniqueCategories = ['Todas', ...new Set(fetchedApps.map(app => app.category).filter(Boolean))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Erro ao buscar apps:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.description && app.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'Todas' || app.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleIdeaSubmit = async (e) => {
        e.preventDefault();
        if (!ideaContent.trim()) return;

        setIdeaLoading(true);
        try {
            const { error } = await supabase
                .from('ideas')
                .insert([{ content: ideaContent }]);

            if (error) throw error;

            setIdeaSuccess(true);
            setIdeaContent('');
            setTimeout(() => setIdeaSuccess(false), 5000); // Hide success after 5s
        } catch (error) {
            console.error('Erro ao enviar ideia:', error.message);
            alert('Não foi possível enviar sua ideia no momento. Tente novamente mais tarde.');
        } finally {
            setIdeaLoading(false);
        }
    };

    return (
        <div className="container home-container">
            <header className="home-header">
                <h1>Meu Portfólio de Apps</h1>
                <p className="subtitle">
                    Explore os aplicativos desenvolvidos com Inteligência Artificial
                </p>
            </header>

            <section className="filters-section">
                <div className="search-bar glass-panel">
                    <Search size={20} color="var(--text-secondary)" />
                    <input
                        type="text"
                        placeholder="Buscar aplicativos por nome ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {categories.length > 1 && (
                    <div className="category-filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <div className="apps-grid">
                {loading ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Carregando aplicativos...</p>
                ) : filteredApps.length > 0 ? (
                    filteredApps.map(app => (
                        <AppCard key={app.id} app={app} />
                    ))
                ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>Nenhum aplicativo encontrado.</p>
                )}
            </div>

            {/* Seção Deixe sua Ideia */}
            <section className="ideas-section glass-panel">
                <div className="ideas-content">
                    <h2>Tem uma ideia incrível para o próximo App?</h2>
                    <p className="ideas-subtitle">Compartilhe comigo e ela pode se transformar no próximo projeto de IA do portfólio!</p>

                    {ideaSuccess ? (
                        <div className="idea-success-message">
                            Sua ideia foi enviada com sucesso! Muito obrigado pela contribuição. 🚀
                        </div>
                    ) : (
                        <form onSubmit={handleIdeaSubmit} className="idea-form">
                            <textarea
                                value={ideaContent}
                                onChange={(e) => setIdeaContent(e.target.value)}
                                placeholder="Descreva sua ideia de aplicativo aqui..."
                                className="idea-textarea"
                                required
                                rows={4}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary btn-submit-idea"
                                disabled={ideaLoading || !ideaContent.trim()}
                            >
                                {ideaLoading ? 'Enviando...' : 'Enviar Ideia'}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
