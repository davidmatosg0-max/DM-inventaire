import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ArrowRightLeft, Bookmark, AlertCircle, CheckCircle2, TrendingDown, Undo2 } from 'lucide-react';
import { Badge } from '../ui/badge';

export function GuiaConversiones() {
  const ejemplosConversiones = [
    {
      titulo: '🥣 Céréales 2kg → Céréales 3kg',
      origen: '40 boîtes de céréales 2kg',
      destinos: ['26 boîtes de céréales 3kg'],
      merma: '2 kg (céréales abîmées)',
      descripcion: 'Reconditionnement pour optimiser l\'espace de stockage'
    },
    {
      titulo: '🍎 Fruits Variés → Pommes',
      origen: '100 kg de fruits variés (PRS)',
      destinos: ['92 kg de pommes'],
      merma: '8 kg (fruits abîmés)',
      descripcion: 'Tri et classification des fruits PRS en type spécifique'
    },
    {
      titulo: '🥬 Légumes Variés → Classification',
      origen: '80 kg de légumes variés (PRS)',
      destinos: ['35 kg carottes', '30 kg pommes de terre', '10 kg brocoli'],
      merma: '5 kg (légumes non utilisables)',
      descripcion: 'Tri de légumes PRS pour distribution ciblée'
    },
    {
      titulo: '🍚 Riz 25kg → Paquets 1kg',
      origen: '5 sacs de riz 25kg',
      destinos: ['123 paquets de 1kg'],
      merma: '2 kg (perte lors reconditionnement)',
      descripcion: 'Reconditionnement pour portions familiales'
    }
  ];

  const avantages = [
    {
      icono: <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />,
      titre: 'Traçabilité complète',
      description: 'Historique détaillé de toutes les transformations'
    },
    {
      icono: <Bookmark className="w-5 h-5 text-[#1E73BE]" />,
      titre: 'Modèles réutilisables',
      description: 'Créez des recettes de conversion standards'
    },
    {
      icono: <TrendingDown className="w-5 h-5 text-[#FFC107]" />,
      titre: 'Suivi des pertes',
      description: 'Comptabilisation précise de la merma et motifs'
    },
    {
      icono: <Undo2 className="w-5 h-5 text-[#DC3545]" />,
      titre: 'Réversibilité',
      description: 'Annulez une conversion en cas d\'erreur'
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card className="border-[#FFC107] border-2">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            <ArrowRightLeft className="w-6 h-6 text-[#FFC107]" />
            Guide des Conversions de Produits
          </CardTitle>
          <CardDescription>
            Transformez efficacement vos produits en maintenant une traçabilité complète du stock
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Qu'est-ce qu'une conversion? */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Qu'est-ce qu'une conversion de produit?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#666666]">
            Une <strong>conversion de produit</strong> permet de transformer un produit source (en vrac, grande quantité) 
            en un ou plusieurs produits destinés à la distribution (portions, conditionnements adaptés).
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#1E73BE] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-[#333333]">
                <p className="font-medium mb-2">Cas d'usage typiques:</p>
                <ul className="list-disc list-inside space-y-1 text-[#666666]">
                  <li>Reconditionnement de produits en différentes tailles (céréales 2kg → 3kg)</li>
                  <li>Tri et classification de produits variés (fruits variés → pommes)</li>
                  <li>Transformation de produits PRS en produits spécifiques</li>
                  <li>Reconditionnement de vrac en portions familiales (riz 25kg → paquets 1kg)</li>
                  <li>Classification de conserves variées en types spécifiques</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exemples de conversions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Exemples de conversions courantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {ejemplosConversiones.map((ejemplo, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-[#FFC107] transition-colors"
              >
                <h4 className="font-semibold text-[#333333] mb-3">{ejemplo.titulo}</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge className="bg-[#1E73BE] text-white shrink-0">Origine</Badge>
                    <span className="text-[#666666]">{ejemplo.origen}</span>
                  </div>
                  
                  <div className="flex items-center justify-center text-[#FFC107] my-1">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Badge className="bg-[#4CAF50] text-white shrink-0">Résultat</Badge>
                    <div className="text-[#666666]">
                      {ejemplo.destinos.map((dest, i) => (
                        <div key={i}>• {dest}</div>
                      ))}
                    </div>
                  </div>
                  
                  {ejemplo.merma && (
                    <div className="flex items-start gap-2 mt-2 pt-2 border-t">
                      <Badge className="bg-[#DC3545] text-white shrink-0">Perte</Badge>
                      <span className="text-[#666666]">{ejemplo.merma}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-[#999999] mt-3 italic">{ejemplo.descripcion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Avantages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Avantages du système de conversion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {avantages.map((avantage, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  {avantage.icono}
                </div>
                <div>
                  <h4 className="font-medium text-[#333333] mb-1">{avantage.titre}</h4>
                  <p className="text-sm text-[#666666]">{avantage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comment utiliser */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Comment effectuer une conversion?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFC107] text-white font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium text-[#333333] mb-1">Sélectionner le produit source</h4>
                <p className="text-sm text-[#666666]">
                  Choisissez le produit que vous souhaitez transformer (doit avoir du stock disponible)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFC107] text-white font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium text-[#333333] mb-1">Définir la quantité à convertir</h4>
                <p className="text-sm text-[#666666]">
                  Indiquez combien de kg/unités du produit source vous allez utiliser
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFC107] text-white font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium text-[#333333] mb-1">Ajouter les produits résultants</h4>
                <p className="text-sm text-[#666666]">
                  Sélectionnez un ou plusieurs produits de destination avec leurs quantités obtenues
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFC107] text-white font-bold shrink-0">
                4
              </div>
              <div>
                <h4 className="font-medium text-[#333333] mb-1">Documenter les pertes (optionnel)</h4>
                <p className="text-sm text-[#666666]">
                  Indiquez la merma (perte) et son motif (épluchage, os, produits abîmés, etc.)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4CAF50] text-white font-bold shrink-0">
                5
              </div>
              <div>
                <h4 className="font-medium text-[#333333] mb-1">Enregistrer la conversion</h4>
                <p className="text-sm text-[#666666]">
                  Le stock sera automatiquement ajusté: - origine, + destinations, traçabilité complète
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conseil */}
      <Card className="border-[#4CAF50]">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#4CAF50] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-[#333333] mb-2">💡 Conseil professionnel</h4>
              <p className="text-sm text-[#666666]">
                Créez des <strong>modèles de conversion</strong> pour vos transformations récurrentes 
                (ex: découpe de viande, reconditionnement de riz). Cela vous fera gagner du temps et 
                assurera la cohérence des ratios de conversion.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}