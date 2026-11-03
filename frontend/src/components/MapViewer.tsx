import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  LayersControl,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import { Layers, MapPin, Eye, EyeOff, Maximize2, Sparkles } from 'lucide-react';
import { GeoJSONGeometry } from '../types';

interface MapViewerProps {
  boundaryGeoJson?: GeoJSONGeometry | any;
  overlayGeoJson?: any;
  overlayLayerName?: string;
  overlayColor?: string;
  center?: [number, number];
  zoom?: number;
  height?: string;
  parcelInfo?: {
    farmerName?: string;
    khasraNo?: string;
    areaHa?: number;
    village?: string;
    crop?: string;
    damageType?: string;
    verifiedDamageHa?: number;
  };
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
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
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
  center = [25.435, 81.838],
  zoom = 14,
  height = '420px',
  parcelInfo,
}) => {
  const [showOverlay, setShowOverlay] = useState(true);

  // Compute centroid and vertices for clear cadastral parcel display
  let mapCenter = center;
  let centroid: [number, number] | null = null;
  const vertices: [number, number][] = [];

  if (boundaryGeoJson && boundaryGeoJson.coordinates) {
    try {
      const ring =
        boundaryGeoJson.type === 'Polygon'
          ? boundaryGeoJson.coordinates[0]
          : boundaryGeoJson.coordinates[0][0];
      if (Array.isArray(ring) && ring.length > 0) {
        let sumLat = 0;
        let sumLon = 0;
        const validCoords = ring.filter((pt: any) => Array.isArray(pt) && pt.length >= 2);
        validCoords.forEach((pt: any) => {
          sumLon += pt[0];
          sumLat += pt[1];
          vertices.push([pt[1], pt[0]]);
        });
        if (validCoords.length > 0) {
          centroid = [sumLat / validCoords.length, sumLon / validCoords.length];
          mapCenter = centroid;
        }
      }
    } catch (e) {
      console.warn('Centroid computation warning:', e);
    }
  }

  // High-contrast glowing emerald cadastral boundary style
  const boundaryStyle = {
    color: '#00f59b', // High-contrast neon emerald
    weight: 3.5,
    opacity: 1.0,
    fillColor: '#10b981',
    fillOpacity: 0.18,
    dashArray: '6, 4',
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
  const hasZonedDamage = overlayGeoJson?.features?.some(
    (f: any) => f?.properties?.severity_label
  );

  // Custom Centroid Badge Icon
  const centroidIcon = L.divIcon({
    className: 'custom-parcel-centroid-icon',
    html: `
      <div style="transform: translate(-50%, -50%); pointer-events: auto; display: inline-flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.96); border: 2px solid #00f59b; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 10px 25px -5px rgba(0, 245, 155, 0.4), 0 0 15px rgba(0,0,0,0.8); font-family: ui-sans-serif, system-ui, sans-serif; white-space: nowrap; cursor: pointer;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #00f59b; box-shadow: 0 0 8px #00f59b;"></span>
        <span style="font-weight: 700; color: #fff; font-size: 11px;">${parcelInfo?.farmerName || 'Cadastral Parcel'}</span>
        <span style="color: #94a3b8; font-size: 10px;">| Khasra: <b style="color: #38bdf8;">${parcelInfo?.khasraNo || '104/1'}</b></span>
        <span style="background: rgba(16, 185, 129, 0.25); color: #6ee7b7; font-weight: 700; font-size: 10px; padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.4);">${parcelInfo?.areaHa ? parcelInfo.areaHa + ' Ha' : '5.0 Ha'}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  // Small corner vertex pin icon
  const vertexIcon = L.divIcon({
    className: 'custom-vertex-icon',
    html: `
      <div style="transform: translate(-50%, -50%); width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; border: 2px solid #0f172a; box-shadow: 0 0 6px #38bdf8;"></div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl"
      style={{ height }}
    >
      {/* Map Controls & Legend Overlay */}
      <div className="absolute top-3 right-3 z-20 flex flex-col space-y-2 bg-slate-900/95 backdrop-blur-md p-2.5 rounded-lg border border-slate-700/80 text-xs shadow-xl max-w-[210px]">
        <div className="flex items-center space-x-1.5 font-semibold text-slate-200 pb-1 border-b border-slate-800">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cadastral Satellite Layers</span>
        </div>

        {boundaryGeoJson && (
          <div className="flex items-center space-x-2 text-[11px] text-slate-300">
            <span className="w-3 h-3 rounded-sm border-2 border-emerald-400 bg-emerald-500/30"></span>
            <span className="font-medium text-emerald-300">Farmer Land Parcel</span>
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
                {showOverlay ? (
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
            </div>

            {hasZonedDamage ? (
              <div className="flex flex-col space-y-1 text-[10px] text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span>
                  <span>Severe Inundation / Loss</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span>
                  <span>Moderate Siltation</span>
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
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: overlayColor }}
                ></span>
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
          <LayersControl.BaseLayer name="Esri Dark Canvas">
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

        {/* High-Contrast Boundary Polygon */}
        {boundaryGeoJson && (
          <GeoJSON
            key={JSON.stringify(boundaryGeoJson)}
            data={boundaryGeoJson}
            style={boundaryStyle}
            onEachFeature={(_feature, layer) => {
              layer.bindPopup(`
                <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; color: #0f172a; padding: 4px;">
                  <b style="color: #059669; font-size: 13px;">${parcelInfo?.farmerName || 'Agricultural Parcel'}</b><br/>
                  <b>Khasra No:</b> ${parcelInfo?.khasraNo || '104/1'}<br/>
                  <b>Cadastral Land Area:</b> ${parcelInfo?.areaHa || 5.0} Ha (${((parcelInfo?.areaHa || 5.0) * 2.47105).toFixed(2)} Acres)<br/>
                  ${parcelInfo?.crop ? `<b>Crop:</b> ${parcelInfo.crop}<br/>` : ''}
                  ${parcelInfo?.verifiedDamageHa ? `<b>Verified Damage:</b> <span style="color: #dc2626; font-weight: bold;">${parcelInfo.verifiedDamageHa} Ha</span><br/>` : ''}
                  <span style="display: inline-block; margin-top: 4px; padding: 2px 6px; background: #d1fae5; color: #065f46; border-radius: 4px; font-weight: 600; font-size: 10px;">
                    PMFBY Fast-Track Verified
                  </span>
                </div>
              `);
            }}
          />
        )}

        {/* Centroid Parcel Information Pin */}
        {centroid && (
          <Marker position={centroid} icon={centroidIcon}>
            <Popup>
              <div style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#0f172a' }}>
                <b style={{ color: '#059669' }}>{parcelInfo?.farmerName || 'Farmer Land Parcel'}</b>
                <br />
                <b>Khasra Plot No:</b> {parcelInfo?.khasraNo || '104/1'}
                <br />
                <b>Land Area:</b> {parcelInfo?.areaHa || 5.0} Hectares (
                {((parcelInfo?.areaHa || 5.0) * 2.47105).toFixed(2)} Acres)
                <br />
                <b>GPS Centroid:</b> {centroid[0].toFixed(4)}°N, {centroid[1].toFixed(4)}°E
              </div>
            </Popup>
          </Marker>
        )}

        {/* Boundary Corner Pins */}
        {vertices.slice(0, 4).map((v, i) => (
          <Marker key={`v-${i}`} position={v} icon={vertexIcon} />
        ))}

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

        {/* Auto Fit Bounds to parcel boundary */}
        <FitBoundsToGeometry geometry={overlayGeoJson || boundaryGeoJson} />
      </MapContainer>
    </div>
  );
};
