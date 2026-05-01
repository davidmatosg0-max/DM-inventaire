import React from 'react';
import { 
  Package, 
  ClipboardList, 
  Building2, 
  Truck, 
  FileBarChart, 
  Users, 
  ShoppingCart, 
  MessageSquare,
  LayoutDashboard,
  ChefHat,
  UserPlus,
  Gift,
  Mail,
  Sparkles,
  CheckCircle,
  Globe,
  Zap,
  Shield,
  Activity,
  QrCode,
  Scale
} from 'lucide-react';

/**
 * Componente para generar presentación HTML imprimible
 * Este componente se renderiza en una ventana nueva para impresión/PDF
 */
export function PresentacionGuia() {
  return (
    <div className="presentation-container" style={{ 
      fontFamily: 'Montserrat, Roboto, sans-serif',
      background: 'white',
      color: '#1a1a1a'
    }}>
      <style>{`
        @media print {
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          
          @page {
            size: A4 landscape;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
        }
        
        .slide {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          position: relative;
          overflow: hidden;
        }
        
        .slide h1 {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #1a4d7a;
        }
        
        .slide h2 {
          font-size: 36px;
          font-weight: 600;
          margin-bottom: 24px;
          color: #1a4d7a;
        }
        
        .slide h3 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #2d9561;
        }
        
        .slide p {
          font-size: 20px;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        
        .slide ul {
          font-size: 18px;
          line-height: 1.8;
        }
        
        .gradient-primary {
          background: linear-gradient(135deg, #1a4d7a 0%, #2d9561 100%);
          color: white;
        }
        
        .gradient-secondary {
          background: linear-gradient(135deg, #2d9561 0%, #4caf50 100%);
          color: white;
        }
        
        .card-feature {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          padding: 24px;
          margin: 12px 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        .grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        
        .icon-large {
          width: 80px;
          height: 80px;
          color: #2d9561;
          margin-bottom: 16px;
        }
        
        .icon-medium {
          width: 48px;
          height: 48px;
          color: #1a4d7a;
          margin-bottom: 12px;
        }
        
        .badge {
          display: inline-block;
          padding: 8px 16px;
          background: #2d9561;
          color: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin: 4px;
        }
        
        .footer-slide {
          position: absolute;
          bottom: 20px;
          right: 60px;
          font-size: 14px;
          color: #666;
        }
        
        .logo-area {
          position: absolute;
          top: 30px;
          left: 60px;
          font-size: 24px;
          font-weight: 700;
          color: #1a4d7a;
        }
        
        .module-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-left: 5px solid #1a4d7a;
          padding: 20px;
          border-radius: 12px;
          margin: 12px 0;
        }
        
        .stat-number {
          font-size: 48px;
          font-weight: 700;
          color: #2d9561;
          margin: 0;
        }
        
        .stat-label {
          font-size: 18px;
          color: #666;
          margin-top: 8px;
        }
      `}</style>

      {/* SLIDE 1: PORTADA */}
      <div className="slide gradient-primary page-break">
        <div style={{ textAlign: 'center', paddingTop: '15vh' }}>
          <div style={{ marginBottom: '40px' }}>
            <Activity style={{ width: '120px', height: '120px', margin: '0 auto', marginBottom: '30px' }} />
          </div>
          <h1 style={{ fontSize: '64px', marginBottom: '30px', color: 'white' }}>
            Système de Gestion
          </h1>
          <h1 style={{ fontSize: '56px', marginBottom: '40px', color: '#e0f2f1' }}>
            Banque Alimentaire
          </h1>
          <p style={{ fontSize: '28px', color: '#b3e5fc', marginTop: '40px' }}>
            Solution Complète et Intégrée
          </p>
          <p style={{ fontSize: '20px', color: '#b3e5fc', marginTop: '20px' }}>
            Guide de Présentation des Fonctionnalités
          </p>
        </div>
        <div className="footer-slide" style={{ color: 'white', opacity: 0.8 }}>
          Mars 2026
        </div>
      </div>

      {/* SLIDE 2: VUE D'ENSEMBLE */}
      <div className="slide page-break">
        <div className="logo-area">🏦 Banque Alimentaire</div>
        <h2>Vue d'Ensemble du Système</h2>
        <p style={{ fontSize: '22px', color: '#666', marginBottom: '40px' }}>
          Une plateforme moderne et complète pour optimiser la gestion de votre banque alimentaire
        </p>
        
        <div className="grid-3" style={{ marginTop: '40px' }}>
          <div style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', borderRadius: '16px' }}>
            <Package style={{ width: '64px', height: '64px', color: '#1976d2', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1976d2' }}>Inventaire</h3>
            <p style={{ fontSize: '16px', color: '#666' }}>Gestion complète des stocks en temps réel</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)', borderRadius: '16px' }}>
            <ClipboardList style={{ width: '64px', height: '64px', color: '#7b1fa2', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#7b1fa2' }}>Commandes</h3>
            <p style={{ fontSize: '16px', color: '#666' }}>Gestion des demandes et distributions</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', borderRadius: '16px' }}>
            <Building2 style={{ width: '64px', height: '64px', color: '#388e3c', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#388e3c' }}>Organismes</h3>
            <p style={{ fontSize: '16px', color: '#666' }}>Registre des bénéficiaires</p>
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: '24px' }}>
          <div style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)', borderRadius: '16px' }}>
            <Truck style={{ width: '64px', height: '64px', color: '#f57c00', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#f57c00' }}>Transport</h3>
            <p style={{ fontSize: '16px', color: '#666' }}>Logistique et livraisons</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg, #fce4ec, #f8bbd0)', borderRadius: '16px' }}>
            <MessageSquare style={{ width: '64px', height: '64px', color: '#c2185b', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#c2185b' }}>Communication</h3>
            <p style={{ fontSize: '16px', color: '#666' }}>Messagerie interne intégrée</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg, #e0f2f1, #b2dfdb)', borderRadius: '16px' }}>
            <Users style={{ width: '64px', height: '64px', color: '#00796b', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#00796b' }}>Utilisateurs</h3>
            <p style={{ fontSize: '16px', color: '#666' }}>Gestion des rôles et permissions</p>
          </div>
        </div>

        <div className="footer-slide">Slide 2</div>
      </div>

      {/* SLIDE 3: CARACTÉRISTIQUES PRINCIPALES */}
      <div className="slide page-break">
        <div className="logo-area">🏦 Banque Alimentaire</div>
        <h2>Caractéristiques Principales</h2>
        
        <div className="grid-2" style={{ marginTop: '40px' }}>
          <div className="card-feature">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <Globe style={{ width: '48px', height: '48px', color: '#1a4d7a' }} />
              <h3 style={{ margin: 0 }}>Multilingue</h3>
            </div>
            <p>Support complet de 4 langues :</p>
            <ul>
              <li>🇫🇷 Français (par défaut)</li>
              <li>🇬🇧 Anglais</li>
              <li>🇪🇸 Espagnol</li>
              <li>🇸🇦 Arabe (avec support RTL)</li>
            </ul>
          </div>

          <div className="card-feature">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <Sparkles style={{ width: '48px', height: '48px', color: '#2d9561' }} />
              <h3 style={{ margin: 0 }}>Design Moderne</h3>
            </div>
            <p>Interface élégante avec :</p>
            <ul>
              <li>✨ Effets glassmorphism</li>
              <li>🎨 Gradients sophistiqués</li>
              <li>💫 Animations fluides</li>
              <li>📱 Design responsive</li>
            </ul>
          </div>

          <div className="card-feature">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <Zap style={{ width: '48px', height: '48px', color: '#e8a419' }} />
              <h3 style={{ margin: 0 }}>Temps Réel</h3>
            </div>
            <p>Mises à jour instantanées :</p>
            <ul>
              <li>⚡ Synchronisation automatique</li>
              <li>📊 Tableaux de bord dynamiques</li>
              <li>🔔 Notifications en direct</li>
              <li>📈 Statistiques actualisées</li>
            </ul>
          </div>

          <div className="card-feature">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <Shield style={{ width: '48px', height: '48px', color: '#c23934' }} />
              <h3 style={{ margin: 0 }}>Sécurisé</h3>
            </div>
            <p>Protection avancée :</p>
            <ul>
              <li>🔐 Authentification sécurisée</li>
              <li>👥 Gestion des rôles</li>
              <li>🛡️ Permissions granulaires</li>
              <li>📝 Journal d'activités</li>
            </ul>
          </div>
        </div>

        <div className="footer-slide">Slide 3</div>
      </div>

      {/* SLIDE 4: MODULE INVENTAIRE */}
      <div className="slide gradient-secondary page-break">
        <h2 style={{ color: 'white', marginBottom: '40px' }}>
          <Package style={{ width: '56px', height: '56px', marginRight: '20px', display: 'inline-block', verticalAlign: 'middle' }} />
          Module Inventaire
        </h2>
        
        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', marginTop: '40px' }}>
          <div className="grid-2" style={{ gap: '30px' }}>
            <div>
              <h3 style={{ color: '#1a4d7a', marginBottom: '24px' }}>Fonctionnalités Clés</h3>
              <ul style={{ fontSize: '18px', lineHeight: '2' }}>
                <li>✅ Gestion complète des produits</li>
                <li>✅ Catégories et sous-catégories</li>
                <li>✅ Codes-barres et QR codes</li>
                <li>✅ Tracking des lots et dates d'expiration</li>
                <li>✅ Alertes de stock automatiques</li>
                <li>✅ Gestion des unités dynamiques</li>
                <li>✅ Support produits PRS</li>
                <li>✅ Import/Export Excel</li>
              </ul>
            </div>
            
            <div>
              <h3 style={{ color: '#2d9561', marginBottom: '24px' }}>Avantages</h3>
              <div className="module-card">
                <p style={{ fontSize: '18px', marginBottom: '12px' }}><strong>🎯 Précision</strong></p>
                <p style={{ fontSize: '16px', color: '#666' }}>Suivi précis de chaque produit avec traçabilité complète</p>
              </div>
              <div className="module-card">
                <p style={{ fontSize: '18px', marginBottom: '12px' }}><strong>⚡ Rapidité</strong></p>
                <p style={{ fontSize: '16px', color: '#666' }}>Accès instantané aux informations de stock</p>
              </div>
              <div className="module-card">
                <p style={{ fontSize: '18px', marginBottom: '12px' }}><strong>📊 Visibilité</strong></p>
                <p style={{ fontSize: '16px', color: '#666' }}>Tableaux de bord et rapports détaillés</p>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-slide" style={{ color: 'white' }}>Slide 4</div>
      </div>

      {/* SLIDE 5: MODULE COMMANDES */}
      <div className="slide page-break">
        <div className="logo-area">🏦 Banque Alimentaire</div>
        <h2>
          <ClipboardList style={{ width: '48px', height: '48px', marginRight: '16px', display: 'inline-block', verticalAlign: 'middle', color: '#1a4d7a' }} />
          Module Commandes
        </h2>
        
        <div className="grid-2" style={{ marginTop: '40px' }}>
          <div>
            <h3>Création et Gestion</h3>
            <div className="card-feature">
              <p style={{ fontSize: '18px' }}><strong>📝 Création Rapide</strong></p>
              <p>Interface intuitive pour créer des commandes en quelques clics</p>
            </div>
            <div className="card-feature">
              <p style={{ fontSize: '18px' }}><strong>🔄 Suivi des États</strong></p>
              <p>En attente → En préparation → Prête → Livrée</p>
            </div>
            <div className="card-feature">
              <p style={{ fontSize: '18px' }}><strong>📋 Validation</strong></p>
              <p>Processus de validation avec vérification des stocks</p>
            </div>
          </div>

          <div>
            <h3>Fonctionnalités Avancées</h3>
            <div className="card-feature">
              <p style={{ fontSize: '18px' }}><strong>📄 Génération PDF</strong></p>
              <p>Bon de livraison automatique pour chaque commande</p>
            </div>
            <div className="card-feature">
              <p style={{ fontSize: '18px' }}><strong>📧 Notifications</strong></p>
              <p>Emails automatiques aux organismes bénéficiaires</p>
            </div>
            <div className="card-feature">
              <p style={{ fontSize: '18px' }}><strong>📊 Historique</strong></p>
              <p>Consultation complète de toutes les commandes passées</p>
            </div>
          </div>
        </div>

        <div className="footer-slide">Slide 5</div>
      </div>

      {/* SLIDE 6: MODULE ORGANISMES */}
      <div className="slide gradient-primary page-break">
        <h2 style={{ color: 'white', marginBottom: '40px' }}>
          <Building2 style={{ width: '56px', height: '56px', marginRight: '20px', display: 'inline-block', verticalAlign: 'middle' }} />
          Module Organismes
        </h2>
        
        <div style={{ background: 'white', padding: '40px', borderRadius: '24px' }}>
          <div className="grid-3">
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div className="stat-number">250+</div>
              <p className="stat-label">Organismes Enregistrés</p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div className="stat-number">15</div>
              <p className="stat-label">Types d'Organismes</p>
            </div>
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div className="stat-number">100%</div>
              <p className="stat-label">Traçabilité</p>
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ color: '#1a4d7a', marginBottom: '24px' }}>Gestion Complète</h3>
            <div className="grid-2" style={{ gap: '20px' }}>
              <div className="card-feature">
                <CheckCircle style={{ width: '32px', height: '32px', color: '#2d9561', marginBottom: '12px' }} />
                <p><strong>Fiche Détaillée</strong></p>
                <p style={{ fontSize: '16px', color: '#666' }}>Informations complètes : contact, adresse, quartier, capacité</p>
              </div>
              <div className="card-feature">
                <CheckCircle style={{ width: '32px', height: '32px', color: '#2d9561', marginBottom: '12px' }} />
                <p><strong>Accès Sécurisé</strong></p>
                <p style={{ fontSize: '16px', color: '#666' }}>Portail dédié avec identifiant et mot de passe</p>
              </div>
              <div className="card-feature">
                <CheckCircle style={{ width: '32px', height: '32px', color: '#2d9561', marginBottom: '12px' }} />
                <p><strong>Historique Complet</strong></p>
                <p style={{ fontSize: '16px', color: '#666' }}>Toutes les commandes et distributions archivées</p>
              </div>
              <div className="card-feature">
                <CheckCircle style={{ width: '32px', height: '32px', color: '#2d9561', marginBottom: '12px' }} />
                <p><strong>Documents</strong></p>
                <p style={{ fontSize: '16px', color: '#666' }}>Gestion des attestations et documents officiels</p>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-slide" style={{ color: 'white' }}>Slide 6</div>
      </div>

      {/* SLIDE 7: AUTRES MODULES */}
      <div className="slide page-break">
        <div className="logo-area">🏦 Banque Alimentaire</div>
        <h2>Modules Complémentaires</h2>
        
        <div className="grid-2" style={{ gap: '24px', marginTop: '40px' }}>
          <div className="module-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <Truck style={{ width: '40px', height: '40px', color: '#f57c00' }} />
              <h3 style={{ margin: 0, fontSize: '22px' }}>Transport</h3>
            </div>
            <p>• Planification des routes de livraison</p>
            <p>• Gestion des chauffeurs et véhicules</p>
            <p>• Tracking en temps réel</p>
          </div>

          <div className="module-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <FileBarChart style={{ width: '40px', height: '40px', color: '#7b1fa2' }} />
              <h3 style={{ margin: 0, fontSize: '22px' }}>Rapports</h3>
            </div>
            <p>• Statistiques détaillées</p>
            <p>• Exports Excel et PDF</p>
            <p>• Tableaux de bord personnalisables</p>
          </div>

          <div className="module-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <ChefHat style={{ width: '40px', height: '40px', color: '#c2185b' }} />
              <h3 style={{ margin: 0, fontSize: '22px' }}>Cuisine</h3>
            </div>
            <p>• Planification des menus</p>
            <p>• Gestion des recettes</p>
            <p>• Calcul des coûts</p>
          </div>

          <div className="module-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <MessageSquare style={{ width: '40px', height: '40px', color: '#1976d2' }} />
              <h3 style={{ margin: 0, fontSize: '22px' }}>Messagerie</h3>
            </div>
            <p>• Communication interne sécurisée</p>
            <p>• Fils de discussion par sujet</p>
            <p>• Notifications en temps réel</p>
          </div>

          <div className="module-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <ShoppingCart style={{ width: '40px', height: '40px', color: '#388e3c' }} />
              <h3 style={{ margin: 0, fontSize: '22px' }}>Comptoir</h3>
            </div>
            <p>• Point de distribution direct</p>
            <p>• Interface caisse simplifiée</p>
            <p>• Support codes QR</p>
          </div>

          <div className="module-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <UserPlus style={{ width: '40px', height: '40px', color: '#00796b' }} />
              <h3 style={{ margin: 0, fontSize: '22px' }}>Recrutement</h3>
            </div>
            <p>• Gestion des bénévoles</p>
            <p>• Formulaires de candidature</p>
            <p>• Planification des horaires</p>
          </div>
        </div>

        <div className="footer-slide">Slide 7</div>
      </div>

      {/* SLIDE 8: TECHNOLOGIES */}
      <div className="slide gradient-secondary page-break">
        <h2 style={{ color: 'white', marginBottom: '40px' }}>Technologies et Architecture</h2>
        
        <div style={{ background: 'white', padding: '40px', borderRadius: '24px' }}>
          <div className="grid-2" style={{ gap: '40px' }}>
            <div>
              <h3 style={{ color: '#1a4d7a', marginBottom: '24px' }}>Stack Technique</h3>
              <div style={{ fontSize: '18px', lineHeight: '2' }}>
                <p>⚛️ <strong>React 18</strong> - Framework frontend</p>
                <p>🎨 <strong>Tailwind CSS v4</strong> - Styling moderne</p>
                <p>📦 <strong>TypeScript</strong> - Typage fort</p>
                <p>🔄 <strong>Zustand</strong> - Gestion d'état</p>
                <p>🌐 <strong>i18next</strong> - Internationalisation</p>
                <p>📊 <strong>Recharts</strong> - Visualisations</p>
                <p>🎭 <strong>Motion</strong> - Animations</p>
              </div>
            </div>

            <div>
              <h3 style={{ color: '#2d9561', marginBottom: '24px' }}>Caractéristiques Techniques</h3>
              <div className="card-feature">
                <p><strong>📱 Progressive Web App (PWA)</strong></p>
                <p style={{ fontSize: '16px', color: '#666' }}>Installation sur tous les appareils</p>
              </div>
              <div className="card-feature">
                <p><strong>⚡ Performance Optimisée</strong></p>
                <p style={{ fontSize: '16px', color: '#666' }}>Chargement ultra-rapide</p>
              </div>
              <div className="card-feature">
                <p><strong>📱 Responsive Design</strong></p>
                <p style={{ fontSize: '16px', color: '#666' }}>Adapté à tous les écrans</p>
              </div>
              <div className="card-feature">
                <p><strong>🔒 Sécurité Renforcée</strong></p>
                <p style={{ fontSize: '16px', color: '#666' }}>JWT, permissions, audit</p>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-slide" style={{ color: 'white' }}>Slide 8</div>
      </div>

      {/* SLIDE 9: BÉNÉFICES */}
      <div className="slide page-break">
        <div className="logo-area">🏦 Banque Alimentaire</div>
        <h2>Bénéfices pour votre Organisation</h2>
        
        <div className="grid-2" style={{ gap: '30px', marginTop: '40px' }}>
          <div style={{ background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', padding: '40px', borderRadius: '24px' }}>
            <h3 style={{ color: '#1565c0', marginBottom: '24px', fontSize: '28px' }}>💼 Opérationnels</h3>
            <ul style={{ fontSize: '18px', lineHeight: '2' }}>
              <li>✅ Réduction du temps de gestion jusqu'à 60%</li>
              <li>✅ Diminution des erreurs de stock de 85%</li>
              <li>✅ Traçabilité complète des produits</li>
              <li>✅ Optimisation des livraisons</li>
              <li>✅ Meilleure allocation des ressources</li>
            </ul>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)', padding: '40px', borderRadius: '24px' }}>
            <h3 style={{ color: '#6a1b9a', marginBottom: '24px', fontSize: '28px' }}>📊 Stratégiques</h3>
            <ul style={{ fontSize: '18px', lineHeight: '2' }}>
              <li>✅ Rapports détaillés pour la direction</li>
              <li>✅ Analyse des tendances et prévisions</li>
              <li>✅ Transparence totale des opérations</li>
              <li>✅ Conformité réglementaire</li>
              <li>✅ Prise de décision basée sur les données</li>
            </ul>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', padding: '40px', borderRadius: '24px' }}>
            <h3 style={{ color: '#2e7d32', marginBottom: '24px', fontSize: '28px' }}>👥 Humains</h3>
            <ul style={{ fontSize: '18px', lineHeight: '2' }}>
              <li>✅ Interface intuitive et facile à apprendre</li>
              <li>✅ Formation rapide des nouveaux utilisateurs</li>
              <li>✅ Satisfaction accrue des équipes</li>
              <li>✅ Réduction du stress opérationnel</li>
              <li>✅ Focus sur l'impact social</li>
            </ul>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)', padding: '40px', borderRadius: '24px' }}>
            <h3 style={{ color: '#e65100', marginBottom: '24px', fontSize: '28px' }}>💰 Financiers</h3>
            <ul style={{ fontSize: '18px', lineHeight: '2' }}>
              <li>✅ Réduction du gaspillage alimentaire</li>
              <li>✅ Optimisation des coûts opérationnels</li>
              <li>✅ Meilleure gestion budgétaire</li>
              <li>✅ ROI mesurable et rapide</li>
              <li>✅ Économies à long terme</li>
            </ul>
          </div>
        </div>

        <div className="footer-slide">Slide 9</div>
      </div>

      {/* SLIDE 10: CONCLUSION */}
      <div className="slide gradient-primary page-break">
        <div style={{ textAlign: 'center', paddingTop: '10vh' }}>
          <Sparkles style={{ width: '100px', height: '100px', margin: '0 auto 40px', color: 'white' }} />
          <h2 style={{ fontSize: '48px', marginBottom: '40px', color: 'white' }}>
            Système Complet et Évolutif
          </h2>
          
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '24px', marginTop: '60px', maxWidth: '900px', margin: '60px auto' }}>
            <p style={{ fontSize: '28px', lineHeight: '1.8', color: 'white', marginBottom: '30px' }}>
              Une solution moderne qui s'adapte à vos besoins et grandit avec votre organisation
            </p>
            
            <div className="grid-3" style={{ marginTop: '40px', gap: '20px' }}>
              <div>
                <div className="stat-number" style={{ color: 'white' }}>15+</div>
                <p style={{ color: '#b3e5fc', fontSize: '18px' }}>Modules Intégrés</p>
              </div>
              <div>
                <div className="stat-number" style={{ color: 'white' }}>100%</div>
                <p style={{ color: '#b3e5fc', fontSize: '18px' }}>Personnalisable</p>
              </div>
              <div>
                <div className="stat-number" style={{ color: 'white' }}>24/7</div>
                <p style={{ color: '#b3e5fc', fontSize: '18px' }}>Disponibilité</p>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '24px', marginTop: '60px', color: '#b3e5fc' }}>
            Merci de votre attention ! 🙏
          </p>
        </div>

        <div className="footer-slide" style={{ color: 'white', opacity: 0.8 }}>
          Slide 10
        </div>
      </div>

    </div>
  );
}
