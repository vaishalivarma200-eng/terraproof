import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  LayersControl,
} from 'react-leaflet';
import L from 'leaflet';
import { Layers, MapPin, Eye, EyeOff } from 'lucide-react';
import { GeoJSONGeometry } from '../types';

interface MapViewerProps {
  boundaryGeoJson?: GeoJSONGeometry | any;
  overlayGeoJson?: any;
  overlayLayerName?: string;
  overlayColor?: string;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

// Helper component to auto-pan and zoom to the geometry
function FitBoundsToGeometry({ geometry }: { geometry?: any }) {
  const map = useMap();

  useEffect(() => {
    if (!geometry) return;
    try {
      const layer = L.geoJSON(geometry);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    } catch (e) {
      console.warn('Failed to fit bounds:', e);
    }
  }, [geometry, map]);

  return null;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  boundaryGeoJson,
  overlayGeoJson,
  overlayLayerName = 'Detected Anomalies',
  overlayColor = '#ef4444',
  center = [26.9124, 75.7873],
  zoom = 13,
  height = '420px',
}) => {
  const [showOverlay, setShowOverlay] = useState(true);

  // Default coordinate if boundary is provided
  let mapCenter = center;
  if (boundaryGeoJson && boundaryGeoJson.coordinates) {
    try {
      const firstCoord = boundaryGeoJson.type === 'Polygon'
        ? boundaryGeoJson.coordinates[0][0]
        : boundaryGeoJson.coordinates[0][0][0];
      if (firstCoord && firstCoord.length >= 2) {
        mapCenter = [firstCoord[1], firstCoord[0]];
      }
    } catch {}
  }

  const boundaryStyle = {
    color: '#10b981', // emerald-500
    weight: 2.5,
    opacity: 0.9,
    fillColor: '#10b981',
    fillOpacity: 0.15,
    dashArray: '4, 4',
  };

  const getFeatureStyle = (feature?: any) => {
    if (feature?.properties?.color) {
      return {
        color: feature.properties.color,
        weight: 1.5,
        opacity: 0.95,
        fillColor: feature.properties.color,
        fillOpacity: feature.properties.fill_opacity || 0.45,
      };
    }
    return {
      color: overlayColor,
      weight: 1.5,
      opacity: 0.95,
      fillColor: overlayColor,
      fillOpacity: 0.45,
    };
  };

  // Check if overlay contains multi-tier damage zoning
  const hasZonedDamage = overlayGeoJson?.features?.some((f: any) => f?.properties?.severity_label);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl" style={{ height }}>
      {/* Map Controls & Legend Overlay */}
      <div className="absolute top-3 right-3 z-20 flex flex-col space-y-2 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-700/80 text-xs shadow-lg">
        <div className="flex items-center space-x-1.5 font-semibold text-slate-200 pb-1 border-b border-slate-800">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Map Overlays</span>
        </div>
        
        {boundaryGeoJson && (
          <div className="flex items-center space-x-2 text-[11px] text-slate-300">
            <span className="w-3 h-3 rounded-sm border border-emerald-400 bg-emerald-500/20"></span>
            <span>Study Area Boundary</span>
          </div>
        )}

        {overlayGeoJson && (
          <div className="pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between space-x-3 text-[11px] text-slate-300 pb-1">
              <span className="font-medium text-slate-200">Severity Zones</span>
              <button
                type="button"
                onClick={() => setShowOverlay(!showOverlay)}
                className="text-slate-400 hover:text-white p-0.5"
                title="Toggle overlay visibility"
              >
                {showOverlay ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
              </button>
            </div>

            {hasZonedDamage ? (
              <div className="flex flex-col space-y-1 text-[10px] text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span>
                  <span>Severe Loss / Inundation</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span>
                  <span>Moderate Loss</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
                  <span>Mild Canopy Stress</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                  <span>Healthy Unaffected</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-[11px] text-slate-300">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: overlayColor }}></span>
                <span>{overlayLayerName}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer checked name="Esri World Imagery (Satellite)">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Esri Dark Gray Canvas">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenStreetMap Standard">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Boundary Polygon */}
        {boundaryGeoJson && (
          <GeoJSON
            key={JSON.stringify(boundaryGeoJson)}
            data={boundaryGeoJson}
            style={boundaryStyle}
          />
        )}

        {/* Analytical Change Mask Overlay */}
        {overlayGeoJson && showOverlay && (
          <GeoJSON
            key={JSON.stringify(overlayGeoJson)}
            data={overlayGeoJson}
            style={getFeatureStyle}
            onEachFeature={(feature, layer) => {
              if (feature?.properties?.severity_label) {
                layer.bindTooltip(
                  `<div style="font-family: sans-serif; font-size: 11px; line-height: 1.4; color: #0f172a;">
                    <b style="color: ${feature.properties.color || '#000'}">${feature.properties.severity_label}</b><br/>
                    Zone Area: <b>${feature.properties.zone_area_ha} ha</b> (${feature.properties.zone_percentage}%)
                  </div>`,
                  { sticky: true }
                );
              }
            }}
          />
        )}

        {/* Auto Fit Bounds */}
        <FitBoundsToGeometry geometry={overlayGeoJson || boundaryGeoJson} />
      </MapContainer>
    </div>
  );
};

