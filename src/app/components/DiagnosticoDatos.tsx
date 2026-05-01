import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Database, Download } from 'lucide-react';
import { 
  buscarVoluntarioPorNombre, 
  auditarIntegridad, 
  exportarDatosCompletos,
  listarBackups,
  crearBackupSeguridad 
} from '../utils/recuperarDatos';

interface DiagnosticoDatosProps {
  branding: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export const DiagnosticoDatos: React.FC<DiagnosticoDatosProps> = ({ branding }) => {
  const [nombreBusqueda, setNombreBusqueda] = useState('');
  const [resultadoBusqueda, setResultadoBusqueda] = useState<any>(null);
  const [auditoria, setAuditoria] = useState<any>(null);

  const handleBuscar = () => {
    if (!nombreBusqueda.trim()) return;
    const resultado = buscarVoluntarioPorNombre(nombreBusqueda);
    setResultadoBusqueda(resultado);
  };

  const handleAuditar = () => {
    const reporte = auditarIntegridad();
    setAuditoria(reporte);
  };

  const handleExportar = () => {
    exportarDatosCompletos();
  };

  const handleCrearBackup = () => {
    const backupKey = crearBackupSeguridad('todos');
    if (backupKey) {
      alert(`✅ Backup creado: ${backupKey}`);
    }
  };

  const handleListarBackups = () => {
    const backups = listarBackups();
    alert(`Backups disponibles:\n${backups.join('\n') || 'No hay backups'}`);
  };

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: 'white', 
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: branding.primaryColor,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Database size={28} />
          🆘 Diagnostic et Récupération de Données
        </h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Outil de diagnostic pour rechercher et récupérer des bénévoles perdus
        </p>
      </div>

      {/* BÚSQUEDA DE VOLUNTARIO */}
      <div style={{ 
        marginBottom: '24px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Search size={20} />
          Rechercher un bénévole
        </h3>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Nom, prénom ou email..."
            value={nombreBusqueda}
            onChange={(e) => setNombreBusqueda(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleBuscar}
            style={{
              padding: '12px 24px',
              backgroundColor: branding.primaryColor,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Search size={16} />
            Rechercher
          </button>
        </div>

        {/* RESULTADOS DE BÚSQUEDA */}
        {resultadoBusqueda && (
          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: `2px solid ${resultadoBusqueda.encontrado ? branding.secondaryColor : '#dc3545'}`
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              color: resultadoBusqueda.encontrado ? branding.secondaryColor : '#dc3545'
            }}>
              {resultadoBusqueda.encontrado ? (
                <>
                  <CheckCircle size={20} />
                  ✅ Bénévole trouvé!
                </>
              ) : (
                <>
                  <AlertCircle size={20} />
                  ❌ Bénévole non trouvé
                </>
              )}
            </div>

            {resultadoBusqueda.ubicaciones.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Emplacements trouvés:</strong>
                <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                  {resultadoBusqueda.ubicaciones.map((loc: string, idx: number) => (
                    <li key={idx} style={{ color: '#333', marginBottom: '4px' }}>
                      {loc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resultadoBusqueda.datos && (
              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                <strong>Données trouvées:</strong>
                <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(resultadoBusqueda.datos, null, 2)}
                </pre>
              </div>
            )}

            {resultadoBusqueda.sugerencias.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <strong>Suggestions:</strong>
                <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                  {resultadoBusqueda.sugerencias.map((sug: string, idx: number) => (
                    <li key={idx} style={{ color: '#666', marginBottom: '4px' }}>
                      {sug}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AUDITORÍA */}
      <div style={{ 
        marginBottom: '24px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Database size={20} />
          Audit d'intégrité des données
        </h3>
        
        <button
          onClick={handleAuditar}
          style={{
            padding: '12px 24px',
            backgroundColor: branding.secondaryColor,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}
        >
          Exécuter audit
        </button>

        {auditoria && (
          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '2px solid ' + branding.primaryColor
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <strong>Bénévoles (module principal):</strong>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: branding.primaryColor }}>
                  {auditoria.benevoles}
                </div>
              </div>
              <div>
                <strong>Contacts (départements):</strong>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: branding.secondaryColor }}>
                  {auditoria.contactosDepartamento}
                </div>
              </div>
              <div>
                <strong>Utilisateurs système:</strong>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>
                  {auditoria.usuarios}
                </div>
              </div>
              <div>
                <strong>Doublons détectés:</strong>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: auditoria.duplicados > 0 ? '#dc3545' : '#28a745' 
                }}>
                  {auditoria.duplicados}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HERRAMIENTAS */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        <button
          onClick={handleExportar}
          style={{
            padding: '12px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Download size={16} />
          Exporter données
        </button>

        <button
          onClick={handleCrearBackup}
          style={{
            padding: '12px 16px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Créer backup
        </button>

        <button
          onClick={handleListarBackups}
          style={{
            padding: '12px 16px',
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Lister backups
        </button>
      </div>

      {/* INSTRUCCIONES */}
      <div style={{ 
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#fff3cd',
        borderLeft: '4px solid #ffc107',
        borderRadius: '4px'
      }}>
        <strong style={{ color: '#856404' }}>💡 Instructions:</strong>
        <ul style={{ marginTop: '8px', marginLeft: '20px', color: '#856404' }}>
          <li>Utilisez la recherche pour trouver un bénévole par nom ou email</li>
          <li>L'audit vérifie l'intégrité de toutes les données du système</li>
          <li>Exportez régulièrement les données comme sauvegarde</li>
          <li>Créez un backup avant toute opération de masse</li>
          <li>Vérifiez la console du navigateur (F12) pour les logs détaillés</li>
        </ul>
      </div>
    </div>
  );
};
