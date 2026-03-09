import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, LogOut } from 'lucide-react';
import { supabase } from '../../services/supabase';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [apps, setApps] = useState([]);
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('apps'); // 'apps' ou 'ideas'

    // Form States para App
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', link: '', category: 'Geral', featured: false });
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleEdit = (app) => {
        setEditingId(app.id);
        setFormData({ name: app.name, description: app.description || '', link: app.link, category: app.category || 'Geral', featured: app.featured || false });
        setImageFile(null);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', description: '', link: '', category: 'Geral', featured: false });
        setImageFile(null);
    };

    useEffect(() => {
        // Verificar sessão atual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
            setAuthLoading(false);
            if (session?.user) {
                fetchApps();
                fetchIdeas();
            }
        });

        // Escutar mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            if (session?.user) {
                fetchApps();
                fetchIdeas();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchApps = async () => {
        try {
            const { data, error } = await supabase
                .from('apps')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApps(data || []);
        } catch (error) {
            console.error('Erro ao listar apps:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchIdeas = async () => {
        try {
            const { data, error } = await supabase
                .from('ideas')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setIdeas(data || []);
        } catch (error) {
            console.error('Erro ao buscar ideias:', error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.link) return;

        setUploading(true);
        let publicImageUrl = null;

        try {
            // 1. Fazer upload da imagem caso tenha sido selecionada
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('app-images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('app-images')
                    .getPublicUrl(fileName);

                publicImageUrl = publicUrl;
            } else if (editingId) {
                // Se estiver editando e não escolheu nova imagem, mantém a atual
                const currentApp = apps.find(a => a.id === editingId);
                publicImageUrl = currentApp?.image_url;
            }

            // 2. Salvar aplicativo no banco
            if (editingId) {
                const { data, error } = await supabase
                    .from('apps')
                    .update({
                        name: formData.name,
                        description: formData.description,
                        image_url: publicImageUrl,
                        link: formData.link,
                        category: formData.category,
                        featured: formData.featured
                    })
                    .eq('id', editingId)
                    .select();

                if (error) throw error;
                if (data) {
                    setApps(apps.map(app => app.id === editingId ? data[0] : app));
                }
            } else {
                const { data, error } = await supabase
                    .from('apps')
                    .insert([{
                        name: formData.name,
                        description: formData.description,
                        image_url: publicImageUrl,
                        link: formData.link,
                        category: formData.category,
                        featured: formData.featured
                    }])
                    .select();

                if (error) throw error;
                if (data) {
                    setApps([data[0], ...apps]);
                }
            }
            handleCancelForm();
        } catch (error) {
            console.error('Erro ao adicionar app:', error.message);
            alert('Erro ao adicionar o aplicativo: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir?')) return;

        try {
            const { error } = await supabase
                .from('apps')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setApps(apps.filter(app => app.id !== id));
        } catch (error) {
            console.error('Erro ao excluir app:', error.message);
            alert('Erro ao excluir o aplicativo.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        } catch (error) {
            alert('Erro ao fazer login: ' + error.message);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            alert('Conta criada! Verifique seu e-mail ou faça login agora.');
        } catch (error) {
            alert('Erro ao criar conta: ' + error.message);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (authLoading) {
        return <div className="container dashboard-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>Carregando...</div>;
    }

    if (!user) {
        return (
            <div className="container dashboard-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <section className="glass-panel form-panel" style={{ width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Acesso Restrito</h2>
                    <form onSubmit={handleLogin} className="app-form">
                        <div className="form-group">
                            <label className="form-label">E-mail</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                placeholder="Seu e-mail"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                placeholder="Sua senha"
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Entrar</button>
                            <button type="button" onClick={handleSignUp} className="btn btn-outline" style={{ flex: 1 }}>Criar Conta</button>
                        </div>
                    </form>
                </section>
            </div>
        );
    }

    return (
        <div className="container dashboard-container">
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Dashboard Administrativo</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="dashboard-tabs">
                        <button
                            className={`btn ${activeTab === 'apps' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('apps')}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Aplicativos
                        </button>
                        <button
                            className={`btn ${activeTab === 'ideas' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('ideas')}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Ideias de Usuários
                        </button>
                    </div>
                    {activeTab === 'apps' && (
                        <button className="btn btn-primary" onClick={() => showForm ? handleCancelForm() : setShowForm(true)}>
                            <Plus size={20} /> {showForm ? 'Cancelar' : 'Adicionar App'}
                        </button>
                    )}
                    <button className="btn btn-outline" onClick={handleLogout} title="Sair do painel" style={{ padding: '0.5rem' }}>
                        <LogOut size={20} color="var(--accent-color)" />
                    </button>
                </div>
            </header>

            {showForm && (
                <section className="glass-panel form-panel">
                    <h3>{editingId ? 'Editar Aplicativo' : 'Adicionar Novo Aplicativo'}</h3>
                    <form onSubmit={handleSubmit} className="app-form">
                        <div className="form-group">
                            <label className="form-label">Nome do App *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Ex. Gerador de Receitas"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Descrição</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Breve descrição do seu app..."
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Upload da Imagem / Capa do App</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files[0])}
                                className="form-input"
                                style={{ padding: '0.5rem 1rem' }}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                A imagem será enviada para a nuvem e salva automaticamente.
                            </span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Link do App (Gemini / Canva) *</label>
                            <input
                                type="url"
                                name="link"
                                value={formData.link}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="https://gemini.google.com/..."
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Categoria</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Geral, Educação, Produtividade..."
                            />
                        </div>

                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="featured"
                                id="featured"
                                checked={formData.featured}
                                onChange={handleInputChange}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="featured" style={{ margin: 0, cursor: 'pointer' }} className="form-label">
                                🌟 Destacar App (Mostrar primeiro na Home)
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary mt-4" disabled={uploading}>
                            {uploading ? 'Salvando...' : 'Salvar Aplicativo'}
                        </button>
                    </form>
                </section>
            )}

            <section className="glass-panel dashboard-content">
                <h3>Seus Aplicativos Cadastrados</h3>

                <div className="apps-list mt-4">
                    {apps.map(app => (
                        <div key={app.id} className="app-list-item">
                            <div className="app-list-info">
                                {app.image_url ? (
                                    <img src={app.image_url} alt={app.name} className="app-list-img" />
                                ) : (
                                    <div className="app-list-img-placeholder">IMG</div>
                                )}
                                <div>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {app.name}
                                        {app.featured && <span title="Destaque">🌟</span>}
                                    </h4>
                                    <p style={{ margin: '4px 0 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        {app.category} • {app.clicks || 0} acessos
                                    </p>
                                    <a href={app.link} target="_blank" rel="noopener noreferrer" className="app-link">Testar Link</a>
                                </div>
                            </div>

                            <div className="app-list-actions">
                                <button className="btn btn-outline" title="Editar" onClick={() => handleEdit(app)}><Edit size={18} /></button>
                                <button className="btn btn-danger" title="Excluir" onClick={() => handleDelete(app.id)}><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}

                    {apps.length === 0 && (
                        <p className="text-secondary mt-4">Nenhum aplicativo foi cadastrado ainda.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
