import React, { useRef } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import {
  Truck,
  Camera,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileUp,
  Settings,
  FileText,
  Shield,
  AlertTriangle,
  Package
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { useTranslation } from 'react-i18next';

interface FormVehiculoData {
  placa: string;
  marca: string;
  modelo: string;
  anio: string;
  tipo: string;
  capacidadKg: number;
  capacidadM3: number;
  foto: string | null;
  estado: string;
  activo: boolean;
  fechaAdquisicion: string;
  fechaMantenimiento: string;
  seguro: string;
  notas: string;
  documentos: string[];
}

interface FormularioVehiculoCompactoProps {
  abierto: boolean;
  onCerrar: () => void;
  formulario: FormVehiculoData;
  setFormulario: React.Dispatch<React.SetStateAction<FormVehiculoData>>;
  modoEdicion: boolean;
  onGuardar: () => void;
}

export function FormularioVehiculoCompacto({
  abierto,
  onCerrar,
  formulario,
  setFormulario,
  modoEdicion,
  onGuardar
}: FormularioVehiculoCompactoProps) {
  const branding = useBranding();
  const { t } = useTranslation();
  const fileInputFotoRef = useRef<HTMLInputElement>(null);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormulario({ ...formulario, foto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const tiposVehiculo = [
    { id: 'camion', label: t('transport.vehicleTypes.truck'), icon: '🚚', color: '#1a4d7a' },
    { id: 'furgoneta', label: t('transport.vehicleTypes.van'), icon: '🚐', color: '#2d9561' },
    { id: 'auto', label: t('transport.vehicleTypes.car'), icon: '🚗', color: '#e8a419' },
    { id: 'refrigerado', label: t('transport.vehicleTypes.refrigerated'), icon: '❄️', color: '#4a90e2' },
  ];

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent 
        className="!max-w-none !w-[95vw] !max-h-[95vh] !h-[95vh] overflow-hidden p-0 m-0 rounded-xl"
        aria-describedby="vehicle-form-description"
      >
        <div className="h-full flex flex-col">
          <DialogHeader className="sticky top-0 z-10 bg-white border-b-2 border-[#E0E0E0] px-6 py-3 shadow-sm">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.25rem' }}>
              <Truck className="w-5 h-5 inline mr-2" />
              {modoEdicion ? t('transport.editVehicle') : t('transport.newVehicle')}
            </DialogTitle>
            <DialogDescription id="vehicle-form-description" className="sr-only">
              {modoEdicion ? t('transport.editVehicleDescription') : t('transport.newVehicleDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar izquierda: Foto y Tipo */}
            <div className="w-64 border-r-2 border-[#E0E0E0] bg-[#F9FAFB] p-4 overflow-y-auto scrollbar-thin">
              {/* Photo du Véhicule */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#666666] mb-3 uppercase tracking-wide">
                  {t('transport.vehiclePhoto')}
                </h4>
                <div className="flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-28 h-28 rounded-lg border-4 overflow-hidden bg-white flex items-center justify-center"
                      style={{ borderColor: branding.primaryColor }}
                    >
                      {formulario.foto ? (
                        <img src={formulario.foto} alt="Vehicle" className="w-full h-full object-cover" />
                      ) : (
                        <Truck className="w-14 h-14 text-gray-400" />
                      )}
                    </div>
                    <Button
                      size="icon"
                      type="button"
                      className="absolute bottom-0 right-0 rounded-full text-white h-8 w-8"
                      style={{ backgroundColor: branding.primaryColor }}
                      onClick={() => fileInputFotoRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      ref={fileInputFotoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFotoChange}
                    />
                  </div>
                </div>
              </div>

              {/* Type de Véhicule */}
              <div>
                <h4 className="text-sm font-semibold text-[#666666] mb-3 uppercase tracking-wide">
                  {t('transport.vehicleType')}
                </h4>
                <div className="space-y-2">
                  {tiposVehiculo.map((tipo) => {
                    const isSelected = formulario.tipo === tipo.id;
                    return (
                      <div
                        key={tipo.id}
                        onClick={() => setFormulario({ ...formulario, tipo: tipo.id })}
                        className={`p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                          isSelected ? 'ring-2' : ''
                        }`}
                        style={{
                          borderColor: isSelected ? tipo.color : '#E0E0E0',
                          backgroundColor: isSelected ? `${tipo.color}15` : 'white',
                          ringColor: tipo.color
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-xl">
                            {tipo.icon}
                          </div>
                          <span className="text-xs font-medium text-[#333333] leading-tight">
                            {tipo.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Contenido principal con Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs defaultValue="base" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-[#F9FAFB] px-6 py-0 h-12">
                  <TabsTrigger value="base" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Truck className="w-4 h-4 mr-2" />
                    {t('transport.basicInfo')}
                  </TabsTrigger>
                  <TabsTrigger value="capacidad" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Package className="w-4 h-4 mr-2" />
                    {t('transport.capacity')}
                  </TabsTrigger>
                  <TabsTrigger value="mantenimiento" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('transport.maintenance')}
                  </TabsTrigger>
                  <TabsTrigger value="seguro" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Shield className="w-4 h-4 mr-2" />
                    {t('transport.insurance')}
                  </TabsTrigger>
                  <TabsTrigger value="autres" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <FileText className="w-4 h-4 mr-2" />
                    {t('transport.other')}
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Información Base */}
                <TabsContent value="base" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="placa" className="text-xs">{t('transport.licensePlate')} *</Label>
                        <Input
                          id="placa"
                          value={formulario.placa}
                          onChange={(e) => setFormulario({ ...formulario, placa: e.target.value.toUpperCase() })}
                          placeholder="ABC-1234"
                          className="h-9 uppercase"
                        />
                      </div>
                      <div>
                        <Label htmlFor="marca" className="text-xs">{t('transport.brand')} *</Label>
                        <Input
                          id="marca"
                          value={formulario.marca}
                          onChange={(e) => setFormulario({ ...formulario, marca: e.target.value })}
                          placeholder="Ford"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="modelo" className="text-xs">{t('transport.model')} *</Label>
                        <Input
                          id="modelo"
                          value={formulario.modelo}
                          onChange={(e) => setFormulario({ ...formulario, modelo: e.target.value })}
                          placeholder="Transit"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="anio" className="text-xs">{t('transport.year')}</Label>
                        <Input
                          id="anio"
                          type="number"
                          value={formulario.anio}
                          onChange={(e) => setFormulario({ ...formulario, anio: e.target.value })}
                          placeholder="2024"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="estado" className="text-xs">{t('transport.status')}</Label>
                        <Select value={formulario.estado} onValueChange={(value) => setFormulario({ ...formulario, estado: value })}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={t('transport.selectStatus')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excelente">{t('transport.excellent')}</SelectItem>
                            <SelectItem value="bueno">{t('transport.good')}</SelectItem>
                            <SelectItem value="regular">{t('transport.regular')}</SelectItem>
                            <SelectItem value="necesita-reparacion">{t('transport.needsRepair')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="activo"
                            checked={formulario.activo}
                            onCheckedChange={(checked) => setFormulario({ ...formulario, activo: checked as boolean })}
                          />
                          <Label htmlFor="activo" className="text-xs cursor-pointer">
                            {t('transport.active')}
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="fechaAdquisicion" className="text-xs">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {t('transport.acquisitionDate')}
                      </Label>
                      <Input
                        id="fechaAdquisicion"
                        type="date"
                        value={formulario.fechaAdquisicion}
                        onChange={(e) => setFormulario({ ...formulario, fechaAdquisicion: e.target.value })}
                        className="h-9"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Capacidad */}
                <TabsContent value="capacidad" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="capacidadKg" className="text-xs">
                          <Package className="w-3 h-3 inline mr-1" />
                          {t('transport.capacityKg')}
                        </Label>
                        <Input
                          id="capacidadKg"
                          type="number"
                          value={formulario.capacidadKg}
                          onChange={(e) => setFormulario({ ...formulario, capacidadKg: parseInt(e.target.value) || 0 })}
                          placeholder="1000"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="capacidadM3" className="text-xs">
                          <Package className="w-3 h-3 inline mr-1" />
                          {t('transport.capacityM3')}
                        </Label>
                        <Input
                          id="capacidadM3"
                          type="number"
                          step="0.1"
                          value={formulario.capacidadM3}
                          onChange={(e) => setFormulario({ ...formulario, capacidadM3: parseFloat(e.target.value) || 0 })}
                          placeholder="10.5"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Mantenimiento */}
                <TabsContent value="mantenimiento" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div>
                      <Label htmlFor="fechaMantenimiento" className="text-xs">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {t('transport.lastMaintenanceDate')}
                      </Label>
                      <Input
                        id="fechaMantenimiento"
                        type="date"
                        value={formulario.fechaMantenimiento}
                        onChange={(e) => setFormulario({ ...formulario, fechaMantenimiento: e.target.value })}
                        className="h-9"
                      />
                    </div>
                    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm text-yellow-900 mb-1">
                            {t('transport.maintenanceReminder')}
                          </h4>
                          <p className="text-xs text-yellow-700">
                            {t('transport.maintenanceReminderDescription')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Seguro */}
                <TabsContent value="seguro" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div>
                      <Label htmlFor="seguro" className="text-xs">
                        <Shield className="w-3 h-3 inline mr-1" />
                        {t('transport.insuranceNumber')}
                      </Label>
                      <Input
                        id="seguro"
                        value={formulario.seguro}
                        onChange={(e) => setFormulario({ ...formulario, seguro: e.target.value })}
                        placeholder={t('transport.insuranceNumberPlaceholder')}
                        className="h-9"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Autres */}
                <TabsContent value="autres" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div>
                      <Label htmlFor="notas" className="text-xs">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {t('transport.notes')}
                      </Label>
                      <Textarea
                        id="notas"
                        value={formulario.notas}
                        onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                        placeholder={t('transport.notesPlaceholder')}
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentos" className="text-xs">
                        <FileUp className="w-3 h-3 inline mr-1" />
                        {t('transport.documents')}
                      </Label>
                      <Input
                        id="documentos"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        className="h-9"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('transport.documentsHint')}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer con botones de acción */}
              <div className="sticky bottom-0 bg-white border-t-2 border-[#E0E0E0] px-6 py-3 shadow-sm flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={onCerrar}
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={onGuardar}
                  className="text-white"
                  style={{ 
                    backgroundColor: branding.primaryColor,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600
                  }}
                >
                  {modoEdicion ? t('common.save') : t('common.create')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}