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
        </div>
    );
};

export default Home;
