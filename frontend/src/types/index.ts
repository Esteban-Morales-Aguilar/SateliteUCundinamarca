export interface User { id: string; email: string; name: string; role: string; isActive: boolean; createdAt: string; updatedAt: string }
export interface AuthResponse { user: User; accessToken: string; refreshToken: string; expiresIn: number }

export interface TelemetryPoint {
  time: string; mission_id: string;
  altitude?: number | null; temperature?: number | null; pressure?: number | null; humidity?: number | null;
  latitude?: number | null; longitude?: number | null; rssi?: number | null; snr?: number | null; pdr?: number | null;
}
export interface Mission { id: string; name: string; description?: string; status: string; start_at: string; end_at?: string | null }

export interface MarcoSection { _id: string; slug: string; title: string; content: string; images: string[]; references: string[]; order: number }
export interface Paginated<T> { items: T[]; total: number; page: number; limit: number }
export interface Guia {
  _id: string; slug: string; title: string; description: string;
  steps: { step: number; title: string; body: string }[]; code: string[]; pdfUrl: string; order: number;
  components?: { category: string; item: string; economico: number; premium: number }[];
}
export interface Referencia { _id: string; citeKey: string; topic: string; apa: string }
export interface Creditos {
  authors: { name: string }[]; program: string; university: string; researchGroup: string; teacher: string;
  year: number; license: string; references: Referencia[];
}

export type Climate = 'despejado' | 'nublado' | 'lluvia' | 'tormenta';
export interface LinkInput {
  p_tx_dbm: number; g_tx_dbi: number; g_rx_dbi: number; distance_km: number; freq_mhz: 433 | 868 | 915;
  sf: number; bw_khz: 125 | 250 | 500; l_misc_db: number; climate: Climate; nf_db: number;
}
export interface LinkResult {
  fspl_db: number; p_rx_dbm: number; sensitivity_dbm: number; link_margin_db: number; pdr_estimated: number;
  viable: boolean; max_range_km: number; bitrate_bps: number; message: string;
  loss_curve: { distance_km: number; fspl_db: number; p_rx_dbm: number }[];
}
export interface CoverageResult {
  radio_range_km: number; horizon_km: number; coverage_radius_km: number; coverage_area_km2: number; limited_by: 'radio' | 'horizonte';
}
export interface DopplerResult {
  orbital_velocity_kms: number; orbital_period_min: number; radial_velocity_kms: number; doppler_shift_khz: number;
  lora_tolerance_khz: number; within_tolerance: boolean; message: string; pass_profile: { elevation_deg: number; doppler_hz: number }[];
}
export interface OptimizeResult { recommended: { sf: number; bw_khz: number; link_margin_db: number; bitrate_bps: number; pdr_estimated: number } | null; candidates: unknown[]; message: string }
