/**
 * Formulario Simplificado para Crear Contacto (Donador/Proveedor)
 * 
 * Solo muestra campos ESENCIALES:
 * - Tipo de contacto
 * - Nombre de empresa
 * - Nombre de persona de contacto
 * - Email
 * - Teléfono
 */

import React, { useState } from 'react';
import { Building2, User, Mail, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// ==================== TIPOS ====================

interface ContactFormData {
  // Información básica
  nombreEmpresa: string;
  tipo: 'donador' | 'proveedor';
  
  // Persona de contacto
  nombreContacto: string;
  apellidoContacto: string;
  
  // Comunicación
  email: string;
  telefono: string;
}

interface ContactFormSimpleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuardar: (data: ContactFormData) => void;
}

// ==================== COMPONENTE ====================

export function ContactFormSimple({ open, onOpenChange, onGuardar }: ContactFormSimpleProps) {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<ContactFormData>({
    nombreEmpresa: '',
    tipo: 'donador',
    nombreContacto: '',
    apellidoContacto: '',
    email: '',
    telefono: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  // Validar formulario
  const validar = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.nombreEmpresa.trim()) {
      newErrors.nombreEmpresa = t('contacts.errors.companyNameRequired', 'Nombre de empresa requerido');
    }

    if (!formData.nombreContacto.trim()) {
      newErrors.nombreContacto = t('contacts.errors.contactNameRequired', 'Nombre de contacto requerido');
    }

    if (!formData.apellidoContacto.trim()) {
      newErrors.apellidoContacto = t('contacts.errors.contactLastNameRequired', 'Apellido de contacto requerido');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contacts.errors.emailRequired', 'Email requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contacts.errors.emailInvalid', 'Email inválido');
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = t('contacts.errors.phoneRequired', 'Teléfono requerido');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validar()) {
      onGuardar(formData);
      resetForm();
      onOpenChange(false);
      toast.success(
        formData.tipo === 'donador'
          ? t('contacts.donorCreated', 'Donador creado exitosamente')
          : t('contacts.supplierCreated', 'Proveedor creado exitosamente')
      );
    } else {
      toast.error(t('contacts.completeRequired', 'Complete los campos requeridos'));
    }
  };

  const resetForm = () => {
    setFormData({
      nombreEmpresa: '',
      tipo: 'donador',
      nombreContacto: '',
      apellidoContacto: '',
      email: '',
      telefono: ''
    });
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="contact-form-simple-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            <Building2 className="w-6 h-6 text-[#1a4d7a]" />
            {t('contacts.createNew', 'Crear Nuevo Contacto')}
          </DialogTitle>
          <DialogDescription id="contact-form-simple-description">
            Remplissez les informations de base du nouveau contact
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Sección: Información Básica */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Building2 className="w-4 h-4 text-[#1a4d7a]" />
                {t('contacts.basicInfo', 'Información Básica')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de contacto */}
              <div className="space-y-2">
                <Label htmlFor="tipo">
                  {t('contacts.contactType', 'Tipo de Contacto')} *
                </Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: 'donador' | 'proveedor') =>
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger id="tipo" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donador">
                      <span className="flex items-center gap-2">
                        💰 {t('contacts.donor', 'Donador')}
                      </span>
                    </SelectItem>
                    <SelectItem value="proveedor">
                      <span className="flex items-center gap-2">
                        🛍️ {t('contacts.supplier', 'Proveedor')}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {formData.tipo === 'donador'
                    ? t('contacts.donorDesc', 'Empresa o persona que dona alimentos')
                    : t('contacts.supplierDesc', 'Proveedor de productos o servicios')}
                </p>
              </div>

              {/* Nombre de empresa */}
              <div className="space-y-2">
                <Label htmlFor="nombreEmpresa">
                  {t('contacts.companyName', 'Nombre de Empresa/Organización')} *
                </Label>
                <Input
                  id="nombreEmpresa"
                  placeholder={t('contacts.companyNamePlaceholder', 'Ej: Costco Montreal')}
                  value={formData.nombreEmpresa}
                  onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                  className={`h-11 ${errors.nombreEmpresa ? 'border-red-500' : ''}`}
                />
                {errors.nombreEmpresa && (
                  <p className="text-xs text-red-500">{errors.nombreEmpresa}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sección: Persona de Contacto */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <User className="w-4 h-4 text-[#2d9561]" />
                {t('contacts.contactPerson', 'Persona de Contacto')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreContacto">
                    {t('contacts.firstName', 'Nombre')} *
                  </Label>
                  <Input
                    id="nombreContacto"
                    placeholder={t('contacts.firstNamePlaceholder', 'Ej: Jean')}
                    value={formData.nombreContacto}
                    onChange={(e) => setFormData({ ...formData, nombreContacto: e.target.value })}
                    className={`h-11 ${errors.nombreContacto ? 'border-red-500' : ''}`}
                  />
                  {errors.nombreContacto && (
                    <p className="text-xs text-red-500">{errors.nombreContacto}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellidoContacto">
                    {t('contacts.lastName', 'Apellido')} *
                  </Label>
                  <Input
                    id="apellidoContacto"
                    placeholder={t('contacts.lastNamePlaceholder', 'Ej: Tremblay')}
                    value={formData.apellidoContacto}
                    onChange={(e) => setFormData({ ...formData, apellidoContacto: e.target.value })}
                    className={`h-11 ${errors.apellidoContacto ? 'border-red-500' : ''}`}
                  />
                  {errors.apellidoContacto && (
                    <p className="text-xs text-red-500">{errors.apellidoContacto}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección: Información de Contacto */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Mail className="w-4 h-4 text-[#1a4d7a]" />
                {t('contacts.contactInfo', 'Información de Contacto')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t('contacts.email', 'Email')} *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`h-11 pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">
                  {t('contacts.phone', 'Teléfono')} *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="(514) 555-1234"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className={`h-11 pl-10 ${errors.telefono ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.telefono && (
                  <p className="text-xs text-red-500">{errors.telefono}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="min-w-[100px]"
            >
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button
              type="submit"
              className="min-w-[120px] bg-[#2d9561] hover:bg-[#257a4f]"
            >
              <Building2 className="w-4 h-4 mr-2" />
              {t('contacts.create', 'Crear Contacto')}
            </Button>
          </div>
        </form>

        {/* Indicador de campos requeridos */}
        <div className="text-xs text-gray-500 text-center pb-2">
          * {t('contacts.requiredFields', 'Campos requeridos')}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ContactFormSimple;