export type VehicleService = {
  id: string;
  vehiculo_id: number;       // Postgres
  service_type_id: string;   // Mongo
  date?: string;             // backend asigna fecha al crear (NO se envía desde app)
  notes?: string;
  cost?: number;
};
