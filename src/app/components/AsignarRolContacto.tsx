// Componente para asignar roles del sistema a contactos
import React, { useState, useEffect } from 'react';
import { Shield, User, Key, Mail, Phone, Users, Eye, EyeOff, RefreshCw, Check, X, AlertCircle, Lock, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { obtenerUsuarios, guardarUsuarios } from '../utils/usuarios';

interface AsignarRolContactoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacto: {
    id?: string;
    nombreCompleto?: string;
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    cargo?: string;
    modulo: 'organismo' | 'benevole' | 'donador' | 'vendedor';
    organismoId?: string;
    organismoNombre?: string;
  };
  rolesDisponibles: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    color: string;
  }>;
  onGuardar: (datosAcceso: {
    rolId: string;
    username: string;
    password: string;
    activo: boolean;
  }) => void;
}

export function AsignarRolContacto({
  open,
  onOpenChange,
  contacto,
  rolesDisponibles,
  onGuardar
}: AsignarRolContactoProps) {
  const [rolSeleccionado, setRolSeleccionado] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [accesoActivo, setAccesoActivo] = useState(true);
  const [usuarioExistente, setUsuarioExistente] = useState<any>(null);

  // Función para generar password automáticamente
  const generarPasswordAutomatica = () => {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let nuevaPassword = '';
    for (let i = 0; i < 12; i++) {
      nuevaPassword += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return nuevaPassword;
  };

  // Generar username sugerido basado en el nombre del contacto
  useEffect(() => {
    console.log('🔍 AsignarRolContacto - Diálogo abierto:', open);
    console.log('📝 Contacto:', contacto);
    console.log('👤 Usuario existente:', usuarioExistente);
    
    if (open && !username) {
      const nombreCompleto = contacto.nombreCompleto || `${contacto.nombre} ${contacto.apellido}`;
      const palabras = nombreCompleto.toLowerCase().split(' ');
      let sugerencia = '';
      
      if (palabras.length >= 2) {
        // Tomar primera letra del nombre + apellido completo
        sugerencia = palabras[0].charAt(0) + palabras[palabras.length - 1];
      } else {
        sugerencia = palabras[0];
      }
      
      // Limpiar caracteres especiales
      sugerencia = sugerencia.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      setUsername(sugerencia);
    }

    // Verificar si el contacto ya tiene usuario creado
    if (open && contacto.email) {
      const usuarios = obtenerUsuarios();
      const usuarioEncontrado = usuarios.find(u => u.email === contacto.email);
      if (usuarioEncontrado) {
        setUsuarioExistente(usuarioEncontrado);
        setRolSeleccionado(usuarioEncontrado.rol);
        setUsername(usuarioEncontrado.username);
        setPassword(usuarioEncontrado.password); // Mostrar contraseña actual
        setConfirmarPassword(usuarioEncontrado.password);
        setMostrarPassword(true); // Mostrar contraseña visible por defecto
        setAccesoActivo(true);
      } else {
        // Si es un nuevo usuario, generar contraseña automáticamente y mostrarla
        const passwordGenerada = generarPasswordAutomatica();
        setPassword(passwordGenerada);
        setConfirmarPassword(passwordGenerada);
        setMostrarPassword(true); // Mostrar contraseña por defecto cuando se genera
      }
    }
  }, [open, contacto]);

  const handleGenerarPassword = () => {
    const passwordGenerada = generarPasswordAutomatica();
    setPassword(passwordGenerada);
    setConfirmarPassword(passwordGenerada);
    toast.success('🔑 Mot de passe sécurisé généré automatiquement!');
  };

  // Función de fallback para copiar al portapapeles usando el método clásico
  const copiarTexto = (texto: string): boolean => {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    let exitoso = false;
    try {
      exitoso = document.execCommand('copy');
    } catch (err) {
      console.error('Error al copiar:', err);
    } finally {
      document.body.removeChild(textarea);
    }
    
    return exitoso;
  };

  const handleCopiarPassword = () => {
    if (copiarTexto(password)) {
      toast.success('✅ Mot de passe copié dans le presse-papier!', {
        description: 'Vous pouvez maintenant le partager de manière sécurisée'
      });
    } else {
      toast.error('❌ Erreur lors de la copie du mot de passe');
    }
  };

  const handleCopiarAccesoCompleto = () => {
    const textoAcceso = `🔐 Accès au Système\n\nNom d'utilisateur: ${username}\nMot de passe: ${password}\n\n✅ Utilisez ces identifiants pour vous connecter.`;
    
    if (copiarTexto(textoAcceso)) {
      toast.success('✅ Accès complet copié!', {
        description: 'Nom d\'utilisateur et mot de passe copiés dans le presse-papier'
      });
    } else {
      toast.error('❌ Erreur lors de la copie de l\'accès');
    }
  };

  const handleGuardar = () => {
    // Validaciones
    if (!rolSeleccionado) {
      toast.error('Veuillez sélectionner un rôle');
      return;
    }

    if (!username) {
      toast.error('Veuillez entrer un nom d\'utilisateur');
      return;
    }

    if (username.length < 3) {
      toast.error('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }

    // Verificar si el usuario ya existe (solo si no estamos actualizando uno existente)
    if (!usuarioExistente) {
      const usuarios = obtenerUsuarios();
      const usuarioExiste = usuarios.find(u => 
        u.username.toLowerCase() === username.toLowerCase()
      );
      
      if (usuarioExiste) {
        toast.error('Ce nom d\'utilisateur existe déjà');
        return;
      }
    }

    // Validar password
    if (!usuarioExistente) {
      // Nuevo usuario: password es obligatoria
      if (!password) {
        toast.error('Veuillez entrer un mot de passe');
        return;
      }

      if (password.length < 6) {
        toast.error('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      if (password !== confirmarPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }
    } else if (password) {
      // Usuario existente: si se ingresó nueva password, validarla
      if (password.length < 6) {
        toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
        return;
      }

      if (password !== confirmarPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }
    }

    // Crear o actualizar usuario en el sistema
    const usuarios = obtenerUsuarios();
    const nombreCompleto = contacto.nombreCompleto || `${contacto.nombre} ${contacto.apellido}`;
    const [nombre, ...apellidoArr] = nombreCompleto.split(' ');
    const apellido = apellidoArr.join(' ');

    if (usuarioExistente) {
      // Actualizar usuario existente
      const usuarioIndex = usuarios.findIndex(u => u.id === usuarioExistente.id);
      if (usuarioIndex !== -1) {
        usuarios[usuarioIndex] = {
          ...usuarios[usuarioIndex],
          rol: rolSeleccionado,
          username: username,
          // Solo actualizar password si se proporcionó uno nuevo
          ...(password ? { password } : {})
        };
        guardarUsuarios(usuarios);
        toast.success('Accès mis à jour avec succès');
      }
    } else {
      // Crear nuevo usuario
      const nuevoUsuario = {
        id: `user-${Date.now()}`,
        nombre: nombre || nombreCompleto,
        apellido: apellido || '',
        username: username,
        password: password,
        email: contacto.email || '',
        telefono: contacto.telefono || '',
        rol: rolSeleccionado,
        permisos: [], // Los permisos se obtienen del rol
        descripcion: `Contact ${contacto.modulo} - ${contacto.organismoNombre || 'Module Bénévoles'}`,
        foto: ''
      };

      usuarios.push(nuevoUsuario);
      guardarUsuarios(usuarios);
      toast.success('Accès créé avec succès');
    }

    // Llamar al callback con los datos
    onGuardar({
      rolId: rolSeleccionado,
      username: username,
      password: password || '',
      activo: accesoActivo
    });

    // Limpiar formulario
    setRolSeleccionado('');
    setUsername('');
    setPassword('');
    setConfirmarPassword('');
    setUsuarioExistente(null);
    onOpenChange(false);
  };

  const rolInfo = rolesDisponibles.find(r => r.id === rolSeleccionado);
  const nombreCompleto = contacto.nombreCompleto || `${contacto.nombre} ${contacto.apellido}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="asignar-rol-contacto-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#1a4d7a]" />
            {usuarioExistente ? 'Modifier l\'Accès au Système' : 'Créer un Accès au Système'}
          </DialogTitle>
          <DialogDescription id="asignar-rol-contacto-description">
            Assignez un rôle et des identifiants de connexion pour <strong>{nombreCompleto}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del contacto */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-[#1a4d7a] mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Informations du Contact
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Nom:</span>
                <p className="font-medium text-[#333333]">{nombreCompleto}</p>
              </div>
              {contacto.email && (
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium text-[#333333] flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {contacto.email}
                  </p>
                </div>
              )}
              {contacto.telefono && (
                <div>
                  <span className="text-gray-600">Téléphone:</span>
                  <p className="font-medium text-[#333333] flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {contacto.telefono}
                  </p>
                </div>
              )}
              {contacto.cargo && (
                <div>
                  <span className="text-gray-600">Poste:</span>
                  <p className="font-medium text-[#333333]">{contacto.cargo}</p>
                </div>
              )}
              {contacto.organismoNombre && (
                <div className="col-span-2">
                  <span className="text-gray-600">Organisme:</span>
                  <p className="font-medium text-[#333333] flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {contacto.organismoNombre}
                  </p>
                </div>
              )}
            </div>
          </div>

          {usuarioExistente && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  Accès existant détecté
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Ce contact dispose déjà d'un accès au système. Vous pouvez modifier son rôle ci-dessous.
                </p>
              </div>
            </div>
          )}

          {/* Selección de rol */}
          <div className="space-y-2">
            <Label htmlFor="rol" className="text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Rôle du Système *
            </Label>
            <Select value={rolSeleccionado} onValueChange={setRolSeleccionado}>
              <SelectTrigger id="rol">
                <SelectValue placeholder="Sélectionner un rôle..." />
              </SelectTrigger>
              <SelectContent>
                {rolesDisponibles.map(rol => (
                  <SelectItem key={rol.id} value={rol.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: rol.color }}
                      />
                      <span className="font-medium">{rol.nombre}</span>
                      <span className="text-xs text-gray-500">- {rol.descripcion}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {rolInfo && (
              <div className="mt-2 p-3 bg-gray-50 rounded border">
                <p className="text-xs text-gray-600">
                  <strong>Permissions du rôle:</strong> {rolInfo.descripcion}
                </p>
              </div>
            )}
          </div>

          {/* Credenciales de acceso */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-[#333333] flex items-center gap-2">
              <Key className="w-4 h-4" />
              Identifiants de Connexion
            </h4>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm">
                Nom d'utilisateur *
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                placeholder="Ex: jdupont"
              />
              <p className="text-xs text-gray-500">
                Lettres minuscules sans espaces ni accents
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">
                  Mot de passe {usuarioExistente ? '' : '*'}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerarPassword}
                  className="h-7 text-xs text-[#2d9561] hover:text-[#267d51] hover:bg-[#2d9561]/10"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Générer automatiquement
                </Button>
              </div>
              
              {/* Mostrar contraseña actual si existe usuario */}
              {usuarioExistente && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                  <div className="flex items-start gap-2">
                    <Key className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-800 mb-1">
                        Mot de passe actuel:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-white px-2 py-1 rounded border border-green-300 text-green-900 break-all">
                          {password}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="relative">
                <Input
                  id="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={usuarioExistente ? "Modifier le mot de passe" : "Saisir manuellement ou générer automatiquement"}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {password && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopiarPassword}
                  className="w-full h-8 text-xs border-[#2d9561] text-[#2d9561] hover:bg-[#2d9561] hover:text-white"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copier le mot de passe
                </Button>
              )}
            </div>

            {/* Confirmar Password - Solo si se ingresó una nueva contraseña */}
            {password && (
              <div className="space-y-2">
                <Label htmlFor="confirmar-password" className="text-sm">
                  Confirmer le mot de passe *
                </Label>
                <Input
                  id="confirmar-password"
                  type="password"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Retaper le mot de passe"
                />
              </div>
            )}
          </div>

          {/* Estado del acceso */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
            <div className="flex items-center gap-2">
              <Switch
                checked={accesoActivo}
                onCheckedChange={setAccesoActivo}
              />
              <Label className="text-sm font-medium">
                Accès actif au système
              </Label>
            </div>
            <Badge className={accesoActivo ? 'bg-green-500' : 'bg-gray-400'}>
              {accesoActivo ? 'Actif' : 'Inactif'}
            </Badge>
          </div>

          {/* Advertencia de seguridad */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1 text-xs text-blue-800">
              <p className="font-medium mb-1">📧 Informations importantes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Assurez-vous de communiquer les identifiants de manière sécurisée</li>
                <li>Le contact pourra se connecter immédiatement après la création</li>
                <li>Les permissions seront basées sur le rôle sélectionné</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              onOpenChange(false);
              setRolSeleccionado('');
              setUsername('');
              setPassword('');
              setConfirmarPassword('');
              setUsuarioExistente(null);
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={handleGuardar}
            className="bg-[#1a4d7a] hover:bg-[#153d61]"
          >
            <Check className="w-4 h-4 mr-2" />
            {usuarioExistente ? 'Mettre à jour' : 'Créer l\'accès'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}