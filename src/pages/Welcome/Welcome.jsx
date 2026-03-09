import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import './Welcome.css';

const Welcome = () => {
    return (
        <div className="welcome-container">
            {/* Decorative Background Elements */}
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>

            <main className="welcome-content glass-panel">
                <div className="welcome-icon-wrapper">
                    <Sparkles className="welcome-icon" size={48} />
                </div>

                <h1 className="welcome-title">
                    Transformando Ideias em <span className="highlight">Apps com IA</span>
                </h1>

                <p className="welcome-subtitle">
                    Explore um portfólio completo de soluções modernas, interativas e inteligentes geradas e aprimoradas com o poder da Inteligência Artificial.
                </p>

                <div className="welcome-actions">
                    <Link to="/home" className="btn btn-primary btn-large">
                        Explorar Portfólio <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="welcome-features">
                    <div className="feature-item">
                        <strong>Inovação</strong>
                        <span>Design Moderno</span>
                    </div>
                    <div className="feature-item">
                        <strong>Velocidade</strong>
                        <span>Desenvolvimento Ágil</span>
                    </div>
                    <div className="feature-item">
                        <strong>Inteligência</strong>
                        <span>Soluções com IA</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Welcome;
