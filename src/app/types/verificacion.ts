// Tipos para el sistema de verificación de vehículos según SAAQ Quebec

export type EstadoVerificacion = 'conforme' | 'no_conforme' | 'reparar';

export type ItemVerificacion = {
  id: string;
  categoria: string;
  descripcion: string;
  estado: EstadoVerificacion;
  observaciones?: string;
  fotoUrl?: string;
};

export type CategoriaVerificacion = 
  | 'exterior'
  | 'cabina'
  | 'motor'
  | 'frenos'
  | 'luces'
  | 'neumaticos'
  | 'carga'
  | 'documentacion';

export type VerificacionVehiculo = {
  id: string;
  vehiculoId: string;
  vehiculoPlaca: string;
  conductorId: string;
  conductorNombre: string;
  fecha: string;
  hora: string;
  tipoVerificacion: 'pre_viaje' | 'post_viaje' | 'mensual';
  odometro: number;
  items: ItemVerificacion[];
  estadoGeneral: 'apto' | 'apto_con_observaciones' | 'no_apto';
  firmaConductor?: string;
  observacionesGenerales?: string;
  accionesRequeridas?: string[];
  proximaVerificacion?: string;
};

// Checklist según reglamentos SAAQ Quebec
export const checklistSAAQ: { [key in CategoriaVerificacion]: { id: string; descripcion: string }[] } = {
  exterior: [
    { id: 'ext_carroceria', descripcion: 'Carrocería sin daños significativos' },
    { id: 'ext_espejos', descripcion: 'Espejos retrovisores intactos y ajustados' },
    { id: 'ext_parabrisas', descripcion: 'Parabrisas sin grietas ni daños' },
    { id: 'ext_limpiaparabrisas', descripcion: 'Limpiaparabrisas en buen estado' },
    { id: 'ext_puertas', descripcion: 'Puertas cierran correctamente' },
    { id: 'ext_defensas', descripcion: 'Defensas y protecciones instaladas' },
  ],
  cabina: [
    { id: 'cab_asiento', descripcion: 'Asiento del conductor ajustable y seguro' },
    { id: 'cab_cinturon', descripcion: 'Cinturones de seguridad funcionales' },
    { id: 'cab_volante', descripcion: 'Volante sin juego excesivo' },
    { id: 'cab_bocina', descripcion: 'Bocina funcionando correctamente' },
    { id: 'cab_tablero', descripcion: 'Instrumentos del tablero operativos' },
    { id: 'cab_calefaccion', descripcion: 'Sistema de calefacción/desempañador funcional' },
    { id: 'cab_extintor', descripcion: 'Extintor presente y vigente' },
    { id: 'cab_botiquin', descripcion: 'Botiquín de primeros auxilios completo' },
  ],
  motor: [
    { id: 'mot_aceite', descripcion: 'Nivel de aceite adecuado' },
    { id: 'mot_refrigerante', descripcion: 'Nivel de refrigerante adecuado' },
    { id: 'mot_liquido_frenos', descripcion: 'Líquido de frenos al nivel correcto' },
    { id: 'mot_bateria', descripcion: 'Batería asegurada y sin corrosión' },
    { id: 'mot_correas', descripcion: 'Correas en buen estado' },
    { id: 'mot_fugas', descripcion: 'Sin fugas de fluidos' },
    { id: 'mot_escape', descripcion: 'Sistema de escape sin fugas' },
  ],
  frenos: [
    { id: 'fre_pedal', descripcion: 'Pedal de freno con resistencia adecuada' },
    { id: 'fre_estacionamiento', descripcion: 'Freno de estacionamiento funcional' },
    { id: 'fre_abs', descripcion: 'Sistema ABS operativo (si aplica)' },
    { id: 'fre_aire', descripcion: 'Presión de aire adecuada (vehículos neumáticos)' },
    { id: 'fre_pastillas', descripcion: 'Pastillas/zapatas con grosor adecuado' },
  ],
  luces: [
    { id: 'luz_delanteras', descripcion: 'Luces delanteras (altas y bajas)' },
    { id: 'luz_traseras', descripcion: 'Luces traseras' },
    { id: 'luz_freno', descripcion: 'Luces de freno' },
    { id: 'luz_direccionales', descripcion: 'Luces direccionales' },
    { id: 'luz_reversa', descripcion: 'Luces de reversa' },
    { id: 'luz_emergencia', descripcion: 'Luces de emergencia' },
    { id: 'luz_placa', descripcion: 'Luz de placa trasera' },
  ],
  neumaticos: [
    { id: 'neu_presion', descripcion: 'Presión de neumáticos correcta' },
    { id: 'neu_dibujo', descripcion: 'Profundidad de dibujo mínima 1.6mm' },
    { id: 'neu_desgaste', descripcion: 'Desgaste uniforme sin protuberancias' },
    { id: 'neu_danos', descripcion: 'Sin cortes, grietas ni daños' },
    { id: 'neu_tuercas', descripcion: 'Tuercas apretadas correctamente' },
    { id: 'neu_refaccion', descripcion: 'Neumático de refacción disponible' },
  ],
  carga: [
    { id: 'car_distribucion', descripcion: 'Carga distribuida equilibradamente' },
    { id: 'car_asegurada', descripcion: 'Carga asegurada con correas/cadenas' },
    { id: 'car_peso', descripcion: 'Peso dentro de límites permitidos' },
    { id: 'car_altura', descripcion: 'Altura de carga dentro de límites' },
    { id: 'car_senalizacion', descripcion: 'Señalización de carga sobresaliente' },
    { id: 'car_puertas', descripcion: 'Puertas de carga aseguradas' },
  ],
  documentacion: [
    { id: 'doc_registro', descripcion: 'Certificado de registro del vehículo' },
    { id: 'doc_seguro', descripcion: 'Certificado de seguro vigente' },
    { id: 'doc_inspeccion', descripcion: 'Certificado de inspección mecánica vigente' },
    { id: 'doc_licencia', descripcion: 'Licencia de conducir apropiada' },
    { id: 'doc_permisos', descripcion: 'Permisos especiales (si aplica)' },
    { id: 'doc_manifiestos', descripcion: 'Manifiestos de carga completos' },
  ],
};
