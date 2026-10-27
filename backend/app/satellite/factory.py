from app.core.config import settings
from app.satellite.base import BaseSatelliteProvider
from app.satellite.stac_provider import PlanetaryComputerSTACProvider
from app.satellite.mock_provider import DemonstrationSatelliteProvider
from app.satellite.weather_provider import OpenMeteoWeatherProvider

def get_satellite_provider(override_mode: str | None = None) -> BaseSatelliteProvider:
    """
    Factory returning either the real Planetary Computer STAC provider
    or the offline Demonstration provider based on configuration.
    """
    mode = (override_mode or settings.TERRAPROOF_MODE).lower()
    if mode == "real":
        return PlanetaryComputerSTACProvider()
    return DemonstrationSatelliteProvider()

def get_weather_provider() -> OpenMeteoWeatherProvider:
    """Returns the weather provider instance."""
    return OpenMeteoWeatherProvider()
