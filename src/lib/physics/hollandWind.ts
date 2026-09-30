export function calculateHollandWindSpeed(
  r_km: number,
  v_max_kmh: number,
  p_center_hpa: number,
  p_env_hpa = 1013.25,
  r_max_km = 35.0,
  latitude = 20.35
): number {
  if (r_km <= 0) return 0;

  const r_m = r_km * 1000.0;
  const r_max_m = r_max_km * 1000.0;
  const v_ms = v_max_kmh / 3.6;
  const delta_p_pa = Math.max(100, (p_env_hpa - p_center_hpa) * 100);
  const rho_a = 1.15; // kg/m^3

  // Dimensionless Holland B shape parameter clamped to [1.0, 2.5]
  const b_raw = (rho_a * Math.E * (v_ms ** 2)) / delta_p_pa;
  const b = Math.min(2.5, Math.max(1.0, b_raw));

  // Coriolis parameter
  const omega = 7.2921e-5;
  const f = 2 * omega * Math.sin((latitude * Math.PI) / 180);

  const ratio = Math.pow(r_max_m / r_m, b);
  const term1 = (b / rho_a) * ratio * delta_p_pa * Math.exp(-ratio);
  const term2 = Math.pow((r_m * f) / 2.0, 2);

  const v_calc_ms = Math.sqrt(Math.max(0, term1 + term2)) - (r_m * f) / 2.0;
  return Math.max(0, v_calc_ms * 3.6); // Return in km/h
}
