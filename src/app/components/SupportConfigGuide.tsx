import React from 'react';
import { HelpCircle, Mail, Send, Globe, Phone, Check, AlertCircle, MessageCircle, Bug, LifeBuoy } from 'lucide-react';

interface SupportConfigGuideProps {
  type: 'chatAide' | 'support' | 'reportBug';
}

export function SupportConfigGuide({ type }: SupportConfigGuideProps) {
  const guides = {
    chatAide: {
      title: "💬 Chat d'Aide - Guide de Configuration",
      icon: <MessageCircle className="w-5 h-5" />,
      color: '#2196F3',
      description: "Canal de communication pour offrir une assistance rapide aux utilisateurs",
      steps: [
        {
          title: "1️⃣ Choisissez le Type de Contact",
          items: [
            "📧 Email: Les utilisateurs envoient un email pour obtenir de l'aide",
            "🔗 URL (Chat Web): Redirige vers une plateforme de chat en ligne",
            "📞 Téléphone: Affiche un numéro de téléphone à appeler"
          ]
        },
        {
          title: "2️⃣ Configurez les Informations",
          items: [
            "Email: Entrez l'adresse email du service d'aide (ex: aide@banque-alimentaire.org)",
            "URL: Entrez le lien complet du chat web (ex: https://chat.example.com)",
            "Téléphone: Entrez le numéro avec indicatif (ex: +1 (514) 555-0100)"
          ]
        },
        {
          title: "3️⃣ Comportement",
          items: [
            "Email: Ouvre le client email avec le sujet pré-rempli",
            "URL: Ouvre le lien dans un nouvel onglet",
            "Téléphone: Affiche le numéro dans une notification"
          ]
        }
      ],
      examples: [
        { type: "Email", value: "aide@banque-alimentaire.org", icon: "📧" },
        { type: "Chat Web", value: "https://chat.banque-alimentaire.org", icon: "🔗" },
        { type: "Téléphone", value: "+1 (514) 555-0100", icon: "📞" }
      ]
    },
    support: {
      title: "📞 Contacter le Support - Guide de Configuration",
      icon: <LifeBuoy className="w-5 h-5" />,
      color: '#00BCD4',
      description: "Service de support technique pour résoudre les problèmes des utilisateurs",
      steps: [
        {
          title: "1️⃣ Email Principal (Obligatoire)",
          items: [
            "Adresse email principale du support technique",
            "C'est l'adresse qui apparaîtra comme destinataire principal",
            "Exemple: support@banque-alimentaire.org"
          ]
        },
        {
          title: "2️⃣ Email Secondaire (Optionnel)",
          items: [
            "Adresse email alternative pour recevoir une copie",
            "Sera ajoutée automatiquement en CC dans les emails",
            "Utile pour avoir un backup ou une équipe secondaire",
            "Exemple: support-technique@banque-alimentaire.org"
          ]
        },
        {
          title: "3️⃣ Téléphone (Optionnel)",
          items: [
            "Numéro de téléphone pour contacter le support",
            "Sera affiché dans la notification avec les emails",
            "Format recommandé: +1 (514) 555-0100"
          ]
        },
        {
          title: "4️⃣ Fonctionnement",
          items: [
            "Clic sur le bouton → Ouvre le client email",
            "Destinataire: Email principal",
            "CC: Email secondaire (si configuré)",
            "Toast: Affiche tous les contacts disponibles"
          ]
        }
      ],
      examples: [
        { type: "Configuration Complète", value: "support@org.ca + support-tech@org.ca + +1 (514) 555-0100", icon: "✅" },
        { type: "Configuration Minimale", value: "support@banque-alimentaire.org", icon: "📧" }
      ]
    },
    reportBug: {
      title: "🐛 Signaler un Problème - Guide de Configuration",
      icon: <Bug className="w-5 h-5" />,
      color: '#DC3545',
      description: "Canal pour permettre aux utilisateurs de signaler bugs et dysfonctionnements",
      steps: [
        {
          title: "1️⃣ Choisissez le Type",
          items: [
            "📧 Email: Les signalements sont envoyés par email",
            "🔗 URL (Formulaire): Redirige vers un formulaire web de signalement"
          ]
        },
        {
          title: "2️⃣ Configuration Email",
          items: [
            "Email Principal: Adresse qui recevra les signalements",
            "Email Secondaire: Copie des signalements (optionnel)",
            "Les deux emails seront inclus dans l'envoi automatique",
            "Exemple: bugs@banque-alimentaire.org"
          ]
        },
        {
          title: "3️⃣ Configuration URL",
          items: [
            "Entrez l'URL complète du formulaire de signalement",
            "Exemple: https://bugs.banque-alimentaire.org",
            "Exemple: https://github.com/votre-org/issues"
          ]
        },
        {
          title: "4️⃣ Comportement",
          items: [
            "Email: Ouvre le client avec sujet 'Signalement de problème'",
            "Email secondaire ajouté en CC automatiquement",
            "URL: Ouvre le formulaire dans un nouvel onglet",
            "Toast: Confirme l'ouverture et affiche les destinataires"
          ]
        }
      ],
      examples: [
        { type: "Email Principal", value: "bugs@banque-alimentaire.org", icon: "📧" },
        { type: "Email avec Copie", value: "bugs@org.ca + problemes@org.ca", icon: "📧📧" },
        { type: "Formulaire Web", value: "https://bugs.example.com", icon: "🔗" }
      ]
    }
  };

  const guide = guides[type];

  return (
    <div className="border-2 border-[#1E73BE] rounded-lg p-6 bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
          style={{ backgroundColor: guide.color }}
        >
          {guide.icon}
        </div>
        <div>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#333333', fontSize: '1.1rem' }}>
            {guide.title}
          </h3>
          <p className="text-sm text-[#666666] mt-1">{guide.description}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-6">
        {guide.steps.map((step, idx) => (
          <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: guide.color, marginBottom: '0.75rem' }}>
              {step.title}
            </h4>
            <ul className="space-y-2">
              {step.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2 text-sm text-[#666666]">
                  <span className="text-[#4CAF50] mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Examples */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <Check className="w-5 h-5 text-[#4CAF50]" />
          <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: '#4CAF50' }}>
            Exemples de Configuration
          </h4>
        </div>
        <div className="space-y-2">
          {guide.examples.map((example, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm bg-white rounded px-3 py-2 border border-gray-200">
              <span className="text-xl">{example.icon}</span>
              <div>
                <span className="font-medium text-[#333333]">{example.type}:</span>
                <span className="text-[#666666] ml-2 font-mono text-xs">{example.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Note */}
      <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-[#FFC107] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-[#FFC107]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Important
          </p>
          <p className="text-xs text-[#666666] mt-1">
            Les changements sont sauvegardés localement et prennent effet immédiatement pour tous les utilisateurs du système.
          </p>
        </div>
      </div>
    </div>
  );
}
