import React from 'react';
import { ExternalLink } from 'lucide-react';
import { supabase } from '../../services/supabase';
import './AppCard.css';

const AppCard = ({ app }) => {
    const handleClick = () => {
        // Incrementa de forma silenciosa/assíncrona e deixa o link abrir normalmente
        supabase.rpc('increment_click', { app_id: app.id }).catch(console.error);
    };

    return (
        <a href={app.link} target="_blank" rel="noopener noreferrer" className="app-card glass-panel" onClick={handleClick}>
            <div className="app-card-image">
                {app.image_url ? (
                    <img src={app.image_url} alt={app.name} />
                ) : (
                    <div className="image-placeholder">IMG</div>
                )}
                <div className="app-card-overlay">
                    <ExternalLink size={32} color="white" />
                </div>
            </div>
            <div className="app-card-content">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {app.name}
                    {app.featured && <span title="App em Destaque">🌟</span>}
                </h3>
                {app.description && <p className="app-card-desc">{app.description}</p>}
                <p className="app-card-cta">Acessar aplicativo</p>
            </div>
        </a>
    );
};

export default AppCard;
