import logging
from datetime import date
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class OpenMeteoWeatherProvider:
    """
    Retrieves real historical meteorological records (precipitation, soil moisture, temperature)
    from the Open-Meteo Historical Archive API.
    In Demonstration Mode, provides calibrated synthetic weather data immediately without network latency.
    """

    def __init__(self):
        self.endpoint = settings.OPEN_METEO_API_URL
        self.timeout = 5.0

    async def get_historical_weather(
        self,
        latitude: float,
        longitude: float,
        start_date: date,
        end_date: date,
        mode: str = "demo"
    ) -> Optional[Dict[str, Any]]:
        # In demonstration mode, return deterministic offline fixture
        if mode == "demo" or settings.TERRAPROOF_MODE == "demo":
            return {
                "provider": "Open-Meteo Historical Archive (Demonstration Fixture)",
                "latitude": round(latitude, 4),
                "longitude": round(longitude, 4),
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "total_precipitation_mm": 68.4,
                "max_daily_rainfall_mm": 41.2,
                "average_soil_moisture_m3_m3": 0.38,
                "daily_timeline": {
                    "dates": [start_date.isoformat(), end_date.isoformat()],
                    "precipitation_mm": [27.2, 41.2],
                    "temperature_max_c": [31.5, 29.8],
                    "temperature_min_c": [22.4, 21.6]
                },
                "provenance": "DEMO MODE: Calibrated meteorological fixture for testing"
            }

        params = {
            "latitude": round(latitude, 4),
            "longitude": round(longitude, 4),
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "daily": "precipitation_sum,soil_moisture_0_to_7cm_mean,temperature_2m_max,temperature_2m_min",
            "timezone": "auto"
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(self.endpoint, params=params)
                if resp.status_code != 200:
                    logger.warning(f"Open-Meteo returned HTTP {resp.status_code}: {resp.text}")
                    return None
                data = resp.json()
                daily = data.get("daily", {})
                
                precip_list = daily.get("precipitation_sum", [])
                soil_list = daily.get("soil_moisture_0_to_7cm_mean", [])
                
                valid_precip = [p for p in precip_list if p is not None]
                valid_soil = [s for s in soil_list if s is not None]

                total_rainfall_mm = round(sum(valid_precip), 1) if valid_precip else 0.0
                max_daily_rainfall_mm = round(max(valid_precip), 1) if valid_precip else 0.0
                avg_soil_moisture = round(sum(valid_soil) / len(valid_soil), 3) if valid_soil else None

                return {
                    "provider": "Open-Meteo Historical Archive",
                    "latitude": latitude,
                    "longitude": longitude,
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "total_precipitation_mm": total_rainfall_mm,
                    "max_daily_rainfall_mm": max_daily_rainfall_mm,
                    "average_soil_moisture_m3_m3": avg_soil_moisture,
                    "daily_timeline": {
                        "dates": daily.get("time", []),
                        "precipitation_mm": precip_list,
                        "temperature_max_c": daily.get("temperature_2m_max", []),
                        "temperature_min_c": daily.get("temperature_2m_min", [])
                    }
                }
        except Exception as e:
            logger.error(f"Weather query failed: {str(e)}")
            return None

