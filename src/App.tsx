import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polygon, Popup, useMapEvents } from 'react-leaflet';
import {
  MapPin, Plus, Edit3, Trash2, BarChart3, Download,
  ChevronLeft, ChevronRight, Calendar, Users, X, Save,
  Image as ImageIcon, FileText, Globe, Palette, Target,
  Layers, Sun, Moon, Lock, Unlock, Mail, Phone,
  ArrowLeft, Maximize2
} from 'lucide-react';
import L from 'leaflet';

// Import de vos données et types
import { Project } from './types';
import { MY_PROJECTS } from './data/projects';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ========== COMPOSANTS UTILITAIRES ==========

function MapController({ project }: { project: Project }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (map) {
      map.flyTo(project.center, project.zoom, { duration: 1.2 });
    }
  }, [project, map]);
  return null;
}

// ========== APPLICATION PRINCIPALE ==========

export default function App() {
  // INITIALISATION : On utilise directement MY_PROJECTS
  const [projects, setProjects] = useState<Project[]>(MY_PROJECTS);

  const [selectedProjectId, setSelectedProjectId] = useState<number>(projects[0]?.id || 1);
  const [activeTheme, setActiveTheme] = useState<string>("Tous");
  const [activeLayers, setActiveLayers] = useState<string[]>(['markers', 'osm']);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryDetailId, setGalleryDetailId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState<Project | null>(null);

  // Thème Sombre/Clair
  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem('midata-theme') !== 'light'; } catch { return true; }
  });

  // Mode Édition (Code secret : jaukho)
  const [editMode, setEditMode] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('midata-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const getMarkerColor = (type: 'good' | 'bad' | 'neutral') => {
    if (type === 'good') return '#22c55e';
    if (type === 'bad') return '#ef4444';
    return '#eab308';
  };

  const handleSecretTap = () => {
    if (editMode) { setEditMode(false); return; }
    const code = prompt("🔒 Mode édition — Entrez le code d'accès :");
    if (code?.toLowerCase() === "jaukho") {
      setEditMode(true);
      alert("✅ Mode édition activé.");
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden theme-bg-base theme-text">
      {/* HEADER */}
      <header className="h-20 border-b theme-border px-8 flex items-center justify-between z-30 theme-bg-elevated shadow-sm">
        <div className="flex items-center gap-x-4">
          <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Layers className="text-white h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">MiData</div>
            <div className="text-[10px] uppercase tracking-[2px] theme-accent font-semibold">Cartographie / SIG</div>
          </div>
        </div>

        <nav className="flex items-center bg-theme-base p-1 rounded-2xl border theme-border">
          <button
            onClick={() => { setShowGallery(false); setGalleryDetailId(null); }}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${!showGallery ? 'bg-emerald-500 text-white shadow-md' : 'theme-text-muted hover:theme-text'}`}
          >
            Visualiseur
          </button>
          <button
            onClick={() => setShowGallery(true)}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${showGallery ? 'bg-emerald-500 text-white shadow-md' : 'theme-text-muted hover:theme-text'}`}
          >
            Galerie
          </button>
        </nav>

        <button onClick={() => setIsDark(!isDark)} className="h-10 w-10 flex items-center justify-center rounded-xl border theme-border hover:theme-bg-base transition-colors">
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {!showGallery ? (
          <>
            {/* CARTE (Visualiseur) */}
            <div className="flex-1 relative theme-bg-base">
              <MapContainer center={selectedProject.center} zoom={selectedProject.zoom} className="h-full w-full" zoomControl={true} attributionControl={false}>
                <MapController project={selectedProject} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />

                {/* Points de données */}
                {selectedProject.markers.map((marker, index) => (
                  <CircleMarker key={index} center={marker.position} radius={marker.radius || 8} pathOptions={{ color: '#ffffff', fillColor: getMarkerColor(marker.type), fillOpacity: 1, weight: 2 }}>
                    <Popup><div className="font-semibold">{marker.popup}</div></Popup>
                  </CircleMarker>
                ))}

                {/* Zones (Polygones) */}
                {selectedProject.polygons.map((poly, index) => (
                  <Polygon key={index} positions={poly.positions} pathOptions={{ color: '#1e293b', fillColor: poly.color, fillOpacity: 0.5, weight: 2 }}>
                    <Popup><div className="font-semibold">{poly.name}</div></Popup>
                  </Polygon>
                ))}
              </MapContainer>
            </div>

            {/* PANNEAU LATÉRAL DROIT */}
            <aside className="w-[400px] border-l theme-border theme-bg-elevated flex flex-col overflow-hidden">
              <div className="p-8 border-b theme-border">
                <div className="text-xs uppercase tracking-widest theme-accent font-bold mb-2">{selectedProject.country} — {selectedProject.year}</div>
                <h2 className="text-3xl font-bold leading-tight">{selectedProject.title}</h2>
              </div>
              <div className="flex-1 overflow-auto p-8 space-y-8 custom-scroll">
                <section>
                  <h3 className="text-xs uppercase tracking-widest theme-text-muted font-bold mb-4">Description</h3>
                  <p className="text-sm leading-relaxed theme-text-secondary">{selectedProject.description}</p>
                </section>
                <section>
                  <h3 className="text-xs uppercase tracking-widest theme-text-muted font-bold mb-4">Indicateurs</h3>
                  <div className="grid gap-4">
                    {selectedProject.metrics.map((m, i) => (
                      <div key={i} className="p-4 rounded-2xl border theme-border theme-bg-base">
                        <div className="text-xs theme-text-muted mb-1">{m.label}</div>
                        <div className="text-2xl font-bold">{m.value} <span className="text-xs theme-accent">{m.change}</span></div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </aside>
          </>
        ) : (
          /* GALERIE */
          <div className="flex-1 overflow-auto p-12 theme-bg-base">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-5xl font-bold mb-12">Galerie de Cartes</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map(p => (
                  <div key={p.id} className="group theme-bg-elevated rounded-3xl overflow-hidden border theme-border hover:border-emerald-500 transition-all cursor-pointer shadow-sm hover:shadow-xl">
                    <div className="h-48 bg-slate-800 relative overflow-hidden">
                      {p.image ? <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="flex items-center justify-center h-full"><MapPin className="h-12 w-12 text-slate-600" /></div>}
                    </div>
                    <div className="p-6">
                      <div className="text-[10px] uppercase font-bold theme-accent mb-2">{p.country} • {p.year}</div>
                      <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                      <p className="text-sm theme-text-muted line-clamp-2">{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BOUTON SECRET ÉDITION */}
      <button onClick={handleSecretTap} className="fixed bottom-4 right-4 h-10 w-10 rounded-full theme-bg-elevated border theme-border flex items-center justify-center opacity-20 hover:opacity-100 transition-all z-50">
        {editMode ? <Unlock className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4" />}
      </button>
    </div>
  );
}
