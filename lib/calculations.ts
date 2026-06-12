/**
 * Pure calculation functions — no DB or network dependencies.
 * Extracted from the pipeline so they can be unit-tested in isolation.
 */

/**
 * NWS Heat Index (Rothfusz regression). Inputs in °C / %RH, output in °C.
 * Uses the simple formula at lower temps and the full regression at/above 80°F,
 * matching the National Weather Service algorithm.
 * Reference: https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
 */
export function computeHeatIndex(tempC: number, rh: number): number {
  const T = (tempC * 9) / 5 + 32; // °C -> °F
  let hiF = 0.5 * (T + 61 + (T - 68) * 1.2 + rh * 0.094);

  if ((T + hiF) / 2 >= 80) {
    hiF =
      -42.379 +
      2.04901523 * T +
      10.14333127 * rh -
      0.22475541 * T * rh -
      0.00683783 * T * T -
      0.05481717 * rh * rh +
      0.00122874 * T * T * rh +
      0.00085282 * T * rh * rh -
      0.00000199 * T * T * rh * rh;

    if (rh < 13 && T >= 80 && T <= 112) {
      hiF -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    } else if (rh > 85 && T >= 80 && T <= 87) {
      hiF += ((rh - 85) / 10) * ((87 - T) / 5);
    }
  }

  const hiC = ((hiF - 32) * 5) / 9;
  return Number(hiC.toFixed(2));
}

/**
 * Composite environmental risk on a true 0–100 scale.
 * Heat index is mapped onto NWS heat-stress bands (27°C = none, 54°C = extreme danger),
 * then combined with humidity and cloud cover.
 */
export function computeRiskScore(heatIndex: number, humidity: number, cloud: number): number {
  const heatNorm = Math.max(0, Math.min(100, ((heatIndex - 27) / (54 - 27)) * 100));
  const raw = 0.6 * heatNorm + 0.25 * humidity + 0.15 * cloud;
  return Number(Math.min(100, Math.max(0, raw)).toFixed(2));
}
