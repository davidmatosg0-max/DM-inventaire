import React, { useState } from 'react';
import { Send, Copy, Mail, MessageSquare, CheckCircle2, QrCode, CreditCard, Users, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { copiarAlPortapapeles } from '../utils/clipboard';

interface EnviarCredencialesIDProps {
  idDigital: any;
  organismo: any;
}

export function EnviarCredencialesID({ idDigital, organismo }: EnviarCredencialesIDProps) {
  const [open, setOpen] = useState(false);
  const [metodosSeleccionados, setMetodosSeleccionados] = useState({
    email: true,
    sms: true
  });
  
  // Destinatarios
  const [destinatarios, setDestinatarios] = useState({
    beneficiario: true,
    contactoOrganismo: true
  });
  
  const [emailBeneficiario, setEmailBeneficiario] = useState('');
  const [telefonoBeneficiario, setTelefonoBeneficiario] = useState('');
  const [emailContacto, setEmailContacto] = useState(organismo.email || '');
  const [telefonoContacto, setTelefonoContacto] = useState(organismo.telefono || '');

  // Determinar si es beneficiario o contacto
  const esContacto = organismo.nombre.includes('Donador') || organismo.nombre.includes('Vendedor');
  const tipoUsuario = esContacto ? 'contacto' : 'beneficiario';
  
  // Mensaje personalizado
  const mensajeBase = `🎉 ¡Hola ${idDigital.beneficiario}!

✅ Votre ID Digital de la Banque Alimentaire a été généré avec succès.

📇 INFORMACIÓN DE TU ID:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Número de ID: ${idDigital.numeroID}
• Código QR: ${idDigital.qrCode}
• Fecha de emisión: ${idDigital.fechaEmision}
• Fecha de vencimiento: ${idDigital.fechaVencimiento}
• Tipo: ${organismo.nombre}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 INSTRUCCIONES DE USO:
1. Présentez cet ID à chaque ${esContacto ? 'transaction' : 'visite'} à la Banque Alimentaire
2. Escanea tu código QR pour registrar tu ${esContacto ? 'operación' : 'asistencia'}
3. Guarda este mensaje para futuras referencias
4. El ID es válido hasta ${idDigital.fechaVencimiento}

⚠️ IMPORTANTE:
• No compartas tu ID con otras personas
• Asegúrate de renovarlo antes de su vencimiento
• Contactez la Banque Alimentaire si vous avez des questions

Si tienes preguntas o necesitas ayuda, contacta a:
📞 ${organismo.telefono || 'Teléfono no disponible'}
✉️ ${organismo.email || 'Email no disponible'}

---
Banque Alimentaire - Système de Gestion
Ayudando a las comunidades, un alimento a la vez.`;

  const [mensajePersonalizado, setMensajePersonalizado] = useState(mensajeBase);

  // Mensaje corto para SMS
  const mensajeSMS = `Bonjour ${idDigital.beneficiario}! Votre ID Digital: ${idDigital.numeroID} | QR: ${idDigital.qrCode} | Valide jusqu'au ${idDigital.fechaVencimiento}. Présentez cet ID à chaque ${esContacto ? 'transaction' : 'visite'}. Plus d'info: ${organismo.telefono || 'Banque Alimentaire'} - Banque Alimentaire`;

  const handleCopiarMensaje = async () => {
    const exito = await copiarAlPortapapeles(mensajePersonalizado);
    if (exito) toast.success('Mensaje copiado al portapapeles');
  };

  const handleCopiarMensajeSMS = async () => {
    const exito = await copiarAlPortapapeles(mensajeSMS);
    if (exito) toast.success('Mensaje SMS copiado al portapapeles');
  };

  const handleCopiarCredenciales = async () => {
    const credenciales = `ID: ${idDigital.numeroID}\nQR: ${idDigital.qrCode}\nVálido: ${idDigital.fechaEmision} - ${idDigital.fechaVencimiento}`;
    const exito = await copiarAlPortapapeles(credenciales);
    if (exito) toast.success('Credenciales copiadas');
  };

  const handleEnviar = () => {
    const metodosActivos = Object.entries(metodosSeleccionados)
      .filter(([_, activo]) => activo)
      .map(([metodo]) => metodo);

    if (metodosActivos.length === 0) {
      toast.error('Selecciona al menos un método de envío');
      return;
    }

    // Validar que al menos un destinatario esté seleccionado
    if (!destinatarios.beneficiario && !destinatarios.contactoOrganismo) {
      toast.error('Selecciona al menos un destinatario');
      return;
    }

    // Validar destinatarios del beneficiario
    if (destinatarios.beneficiario) {
      if (metodosSeleccionados.email && !emailBeneficiario) {
        toast.error('Ingresa el email del beneficiario');
        return;
      }
      if (metodosSeleccionados.sms && !telefonoBeneficiario) {
        toast.error('Ingresa el teléfono del beneficiario');
        return;
      }
    }

    // Validar destinatarios del contacto
    if (destinatarios.contactoOrganismo) {
      if (metodosSeleccionados.email && !emailContacto) {
        toast.error('Ingresa el email del contacto del organismo');
        return;
      }
      if (metodosSeleccionados.sms && !telefonoContacto) {
        toast.error('Ingresa el teléfono del contacto del organismo');
        return;
      }
    }

    // Simulación de envío
    const metodosTexto = metodosActivos
      .map(m => {
        if (m === 'email') return 'Email';
        if (m === 'sms') return 'SMS';
        return m;
      })
      .join(' y ');

    const destinatariosTexto = [];
    if (destinatarios.beneficiario) {
      destinatariosTexto.push(idDigital.beneficiario);
    }
    if (destinatarios.contactoOrganismo) {
      destinatariosTexto.push(`${organismo.responsable} (${organismo.nombre})`);
    }

    toast.success(
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
          <span className="font-semibold">Credenciales enviadas</span>
        </div>
        <span className="text-sm text-[#666666]">
          Enviado a {destinatariosTexto.join(' y ')} por {metodosTexto}
        </span>
      </div>,
      { duration: 6000 }
    );

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-[#1E73BE] border-[#1E73BE] hover:bg-[#E3F2FD] w-full"
        >
          <Send className="w-4 h-4 mr-1" />
          Enviar Credenciales
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="enviar-credenciales-description">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Enviar Credenciales de ID Digital {esContacto ? '- Contacto' : '- Beneficiario'}
          </DialogTitle>
          <DialogDescription id="enviar-credenciales-description">
            Complete la información para enviar las credenciales del ID digital al destinatario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del ID Digital */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-[#1E73BE] rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                {idDigital.foto && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-md">
                    <img 
                      src={idDigital.foto} 
                      alt={idDigital.beneficiario}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-[#1E73BE] text-lg mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {idDigital.beneficiario}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#666666]" />
                      <span><strong>ID:</strong> {idDigital.numeroID}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#666666]" />
                      <span><strong>QR:</strong> {idDigital.qrCode}</span>
                    </div>
                    <div className="text-xs text-[#666666]">
                      Válido: {idDigital.fechaEmision} → {idDigital.fechaVencimiento}
                    </div>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopiarCredenciales}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copiar
              </Button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-[#F4F4F4] rounded-lg p-4">
            <p className="text-xs text-[#666666] mb-2">{esContacto ? 'Categoría' : 'Organismo Asociado'}</p>
            <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {organismo.nombre}
            </p>
            <p className="text-sm text-[#666666]">{organismo.responsable}</p>
          </div>

          {/* Selección de Destinatarios */}
          <div className="space-y-3">
            <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              👥 Destinatarios
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Beneficiario */}
              <div className="border-2 rounded-lg p-4 bg-white">
                <div className="flex items-start gap-3 mb-3">
                  <Checkbox
                    id="dest-beneficiario"
                    checked={destinatarios.beneficiario}
                    onCheckedChange={(checked) => 
                      setDestinatarios(prev => ({ ...prev, beneficiario: checked as boolean }))
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="dest-beneficiario" className="cursor-pointer flex items-center gap-2">
                      <User className="w-4 h-4 text-[#1E73BE]" />
                      <span className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {esContacto ? 'Contacto Principal' : 'Beneficiario'}
                      </span>
                    </Label>
                    <p className="text-xs text-[#666666] mt-1">
                      {idDigital.beneficiario}
                    </p>
                  </div>
                </div>
                {destinatarios.beneficiario && (
                  <div className="space-y-2 pl-7">
                    <div className="space-y-1">
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        placeholder="beneficiario@email.com"
                        value={emailBeneficiario}
                        onChange={(e) => setEmailBeneficiario(e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Teléfono</Label>
                      <Input
                        type="tel"
                        placeholder="(514) 555-0100"
                        value={telefonoBeneficiario}
                        onChange={(e) => setTelefonoBeneficiario(e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Contacto del Organismo */}
              <div className="border-2 rounded-lg p-4 bg-white">
                <div className="flex items-start gap-3 mb-3">
                  <Checkbox
                    id="dest-contacto"
                    checked={destinatarios.contactoOrganismo}
                    onCheckedChange={(checked) => 
                      setDestinatarios(prev => ({ ...prev, contactoOrganismo: checked as boolean }))
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="dest-contacto" className="cursor-pointer flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#4CAF50]" />
                      <span className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {esContacto ? 'Administración General' : 'Contacto del Organismo'}
                      </span>
                    </Label>
                    <p className="text-xs text-[#666666] mt-1">
                      {organismo.responsable} {!esContacto && `- ${organismo.nombre}`}
                    </p>
                  </div>
                </div>
                {destinatarios.contactoOrganismo && (
                  <div className="space-y-2 pl-7">
                    <div className="space-y-1">
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        placeholder="contacto@organismo.com"
                        value={emailContacto}
                        onChange={(e) => setEmailContacto(e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Teléfono</Label>
                      <Input
                        type="tel"
                        placeholder="(514) 555-0100"
                        value={telefonoContacto}
                        onChange={(e) => setTelefonoContacto(e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {!destinatarios.beneficiario && !destinatarios.contactoOrganismo && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  ⚠️ Selecciona al menos un destinatario para enviar las credenciales
                </p>
              </div>
            )}
          </div>

          {/* Métodos de envío */}
          <div className="space-y-3">
            <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              📨 Métodos de Envío
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Email */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  metodosSeleccionados.email
                    ? 'border-[#1E73BE] bg-[#E3F2FD]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setMetodosSeleccionados(prev => ({ ...prev, email: !prev.email }))}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${metodosSeleccionados.email ? 'text-[#1E73BE]' : 'text-gray-400'}`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Email (Mensaje Completo)
                    </p>
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={emailBeneficiario}
                      onChange={(e) => {
                        e.stopPropagation();
                        setEmailBeneficiario(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs"
                      disabled={!metodosSeleccionados.email}
                    />
                    {metodosSeleccionados.email && (
                      <Badge className="bg-[#4CAF50] mt-2 text-xs">Seleccionado</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* SMS */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  metodosSeleccionados.sms
                    ? 'border-[#1E73BE] bg-[#E3F2FD]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setMetodosSeleccionados(prev => ({ ...prev, sms: !prev.sms }))}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${metodosSeleccionados.sms ? 'text-[#1E73BE]' : 'text-gray-400'}`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      SMS (Mensaje Corto)
                    </p>
                    <Input
                      type="tel"
                      placeholder="(514) 555-0100"
                      value={telefonoBeneficiario}
                      onChange={(e) => {
                        e.stopPropagation();
                        setTelefonoBeneficiario(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs"
                      disabled={!metodosSeleccionados.sms}
                    />
                    {metodosSeleccionados.sms && (
                      <Badge className="bg-[#4CAF50] mt-2 text-xs">Seleccionado</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje para Email */}
          {metodosSeleccionados.email && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                  ✉️ Mensaje para Email (Completo)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopiarMensaje}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={mensajePersonalizado}
                onChange={(e) => setMensajePersonalizado(e.target.value)}
                rows={14}
                className="font-mono text-sm"
                placeholder="Personaliza el mensaje aquí..."
              />
              <p className="text-xs text-[#666666]">
                Este mensaje incluye toda la información del ID Digital y será enviado por email.
              </p>
            </div>
          )}

          {/* Mensaje para SMS */}
          {metodosSeleccionados.sms && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                  📱 Mensaje para SMS (Corto)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopiarMensajeSMS}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </Button>
              </div>
              <div className="bg-[#F4F4F4] rounded-lg p-4 border border-gray-300">
                <p className="text-sm font-mono whitespace-pre-wrap">{mensajeSMS}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-[#666666]">
                <span>Versión optimizada para SMS (160 caracteres aprox.)</span>
                <Badge variant="outline" className="text-xs">
                  {mensajeSMS.length} caracteres
                </Badge>
              </div>
            </div>
          )}

          {/* Información importante */}
          <div className="bg-[#FFF3CD] border border-[#FFC107] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-[#856404] mt-0.5">
                ⚠️
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#856404] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Información Importante
                </p>
                <ul className="text-sm text-[#856404] space-y-1 list-disc list-inside">
                  <li>Verifica que los datos de contacto sean correctos antes de enviar</li>
                  <li>El mensaje por SMS es una versión resumida del mensaje completo</li>
                  <li>Guarda una copia del ID Digital en el sistema</li>
                  <li>El beneficiario debe presentar este ID en cada visita</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Vista previa de credenciales */}
          <div className="bg-[#E8F5E9] border border-[#4CAF50] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <QrCode className="w-5 h-5 text-[#4CAF50] mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-[#2E7D32] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Credenciales a Enviar
                </p>
                <div className="space-y-2 text-sm text-[#666666]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <strong>Número de ID:</strong>
                      <p className="font-mono text-[#333333]">{idDigital.numeroID}</p>
                    </div>
                    <div>
                      <strong>Código QR:</strong>
                      <p className="font-mono text-[#333333]">{idDigital.qrCode}</p>
                    </div>
                  </div>
                  <div>
                    <strong>Vigencia:</strong>
                    <p className="text-[#333333]">
                      Del {idDigital.fechaEmision} al {idDigital.fechaVencimiento}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnviar}
              className="bg-[#4CAF50] hover:bg-[#45a049]"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Credenciales
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}