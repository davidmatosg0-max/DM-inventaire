// Componente para gestionar la contraseña de un usuario
import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Key, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import { copiarAlPortapapeles } from '../../utils/clipboard';
import { obtenerUsuarios, guardarUsuarios } from '../../utils/usuarios';

interface GestionPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioId: string;
  nombreUsuario: string;
  username: string;
}

export function GestionPasswordDialog({
  open,
  onOpenChange,
  usuarioId,
  nombreUsuario,
  username
}: GestionPasswordDialogProps) {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // Cargar la contraseña actual cuando se abre el diálogo
  React.useEffect(() => {
    if (open) {
      const usuarios = obtenerUsuarios();
      const usuario = usuarios.find(u => u.id === usuarioId);
      if (usuario) {
        setPasswordActual(usuario.password);
      }
    }
  }, [open, usuarioId]);

  const handleCopy = async (text: string) => {
    try {
      await copiarAlPortapapeles(text);
      setCopied(true);
      toast.success('Mot de passe copié dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleGenerarPassword = () => {
    // Generar una contraseña aleatoria segura
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    setNuevaPassword(password);
    setConfirmarPassword(password);
    toast.success('Mot de passe généré automatiquement');
  };

  const handleCambiarPassword = () => {
    if (!nuevaPassword) {
      toast.error('Veuillez entrer un nouveau mot de passe');
      return;
    }

    if (nuevaPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    // Actualizar la contraseña en localStorage
    const usuarios = obtenerUsuarios();
    const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId);
    
    if (usuarioIndex !== -1) {
      usuarios[usuarioIndex].password = nuevaPassword;
      guardarUsuarios(usuarios);
      
      toast.success(`Mot de passe de ${nombreUsuario} mis à jour avec succès`);
      setPasswordActual(nuevaPassword);
      setNuevaPassword('');
      setConfirmarPassword('');
      onOpenChange(false);
    } else {
      toast.error('Utilisateur non trouvé');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="password-management-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            Gérer le Mot de Passe
          </DialogTitle>
          <DialogDescription id="password-management-description">
            Modifier ou générer un nouveau mot de passe pour votre compte
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contraseña actual */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Mot de passe actuel</Label>
            <div className="relative">
              <Input
                type={mostrarPassword ? 'text' : 'password'}
                value={passwordActual}
                readOnly
                className="pr-20 bg-gray-50"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleCopy(passwordActual)}
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              ⚠️ Mode démo: Les mots de passe sont visibles uniquement à des fins de démonstration
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3">Changer le mot de passe</h4>
            
            {/* Nueva contraseña */}
            <div className="space-y-2">
              <Label htmlFor="nueva-password" className="text-sm">Nouveau mot de passe</Label>
              <Input
                id="nueva-password"
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="Entrer nouveau mot de passe"
              />
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-2 mt-3">
              <Label htmlFor="confirmar-password" className="text-sm">Confirmer le mot de passe</Label>
              <Input
                id="confirmar-password"
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
              />
            </div>

            {/* Botón generar contraseña */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerarPassword}
              className="mt-3 w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Générer un mot de passe sécurisé
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleCambiarPassword}>
            <Key className="w-4 h-4 mr-2" />
            Mettre à jour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}