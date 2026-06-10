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
import type { LatLngExpression } from 'leaflet';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ========== TYPES ==========
interface Metric {
  label: string;
  value: string;
  change?: string;
}

interface Project {
  id: number;
  title: string;
  country: string;
  zone: string;
  year: number;
  date: string;
  theme: string;
  color: string;
  image: string;
  description: string;
  longDesc: string;
  study: string;
  authors: string;
  center: LatLngExpression;
  zoom: number;
  metrics: Metric[];
  keyFindings: string[];
  markers: Array<{
    position: LatLngExpression;
    type: 'good' | 'bad' | 'neutral';
    popup: string;
    radius?: number;
  }>;
  polygons: Array<{
    positions: LatLngExpression[];
    color: string;
    name: string;
  }>;
}

const THEMES = [
  "Eau & Assainissement",
  "Adaptation Climatique",
  "Santé Publique",
  "Nutrition & Sécurité Alimentaire",
  "Education",
  "Protection",
  "Genre",
  "MEAL / Suivi-Évaluation",
  "Autre"
];

const COLORS = ["#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 1,
    title: "Accès à l'Eau Potable",
    country: "Sénégal",
    zone: "Dakar, Thiès, Fatick",
    year: 2024,
    date: "2024-06-15",
    theme: "Eau & Assainissement",
    color: "#0ea5e9",
    image: "",
    description: "Taux d'accès à l'eau potable par département et localisation des points d'eau.",
    longDesc: "Cette carte présente les résultats d'une évaluation MEAL complète réalisée en partenariat avec le Ministère de l'Eau et de l'Assainissement. Les cercles bleus représentent les forages fonctionnels tandis que les cercles rouges indiquent les infrastructures nécessitant une réhabilitation urgente.",
    study: "Évaluation du programme national d'accès à l'eau potable en milieu rural",
    authors: "C. GOUESSE",
    center: [14.5, -14.45],
    zoom: 7,
    metrics: [
      { label: "Taux d'accès national", value: "68%", change: "+11%" },
      { label: "Points d'eau fonctionnels", value: "1 247", change: "" },
      { label: "Population couverte", value: "9.4 M", change: "" },
    ],
    keyFindings: [
      "92% d'accès dans la région de Dakar",
      "Seulement 41% dans la région de Kédougou",
      "Investissement prioritaire recommandé dans le sud-est",
      "Impact positif des forages solaires (+27% de fonctionnalité)",
    ],
    markers: [
      { position: [14.75, -17.35], type: 'good', popup: 'Forage de Thiès - Fonctionnel' },
      { position: [14.92, -15.32], type: 'good', popup: 'Puits village de Mbour' },
      { position: [13.85, -16.25], type: 'bad', popup: 'Forage de Ziguinchor - En panne' },
      { position: [15.35, -13.15], type: 'good', popup: 'Station de pompage de Louga' },
      { position: [12.95, -15.45], type: 'neutral', popup: "Point d'eau communautaire de Kolda" },
      { position: [14.25, -14.85], type: 'good', popup: 'Forage solaire de Fatick' },
    ],
    polygons: [],
  },
  {
    id: 2,
    title: "Vulnérabilité Climatique",
    country: "Burkina Faso",
    zone: "Centre-Nord, Sahel",
    year: 2023,
    date: "2023-11-20",
    theme: "Adaptation Climatique",
    color: "#10b981",
    image: "",
    description: "Cartographie des zones à risque de sécheresse et inondations.",
    longDesc: "Analyse des impacts du changement climatique sur les communautés vulnérables du Sahel. La carte combine des données satellitaires (NDVI), des enquêtes ménages et des modèles climatiques.",
    study: "Analyse de la vulnérabilité climatique et des capacités d'adaptation",
    authors: "C. GOUESSE",
    center: [12.35, -1.5],
    zoom: 7,
    metrics: [
      { label: "Zones à très haut risque", value: "23%", change: "" },
      { label: "Ménages affectés", value: "1.8 M", change: "-14%" },
      { label: "Projets d'adaptation", value: "47", change: "+19" },
    ],
    keyFindings: [
      "Le Centre-Nord est la région la plus vulnérable",
      "Perte moyenne de 38% des récoltes sur 3 ans",
      "Les femmes et enfants sont les plus touchés",
      "Recommandation : renforcement des systèmes d'alerte précoce",
    ],
    markers: [
      { position: [12.1, -1.3], type: 'bad', popup: 'Zone critique - Ouagadougou Nord' },
      { position: [11.2, -4.3], type: 'bad', popup: 'Sécheresse chronique - Bobo-Dioulasso' },
      { position: [13.6, -2.1], type: 'neutral', popup: 'Zone tampon - Centre Nord' },
      { position: [10.8, -0.9], type: 'good', popup: 'Projet agroécologie réussi' },
    ],
    polygons: [],
  },
  {
    id: 3,
    title: "Couverture Vaccinale",
    country: "Côte d'Ivoire",
    zone: "National",
    year: 2025,
    date: "2025-03-10",
    theme: "Santé Publique",
    color: "#8b5cf6",
    image: "",
    description: "Taux de vaccination Penta3 et rougeole par district sanitaire.",
    longDesc: "Cette visualisation a été produite dans le cadre du programme MEAL du Ministère de la Santé et de l'UNICEF. Les marqueurs représentent les centres de santé avec le taux de couverture vaccinale.",
    study: "Enquête nationale de couverture vaccinale 2025",
    authors: "C. GOUESSE",
    center: [7.5, -5.2],
    zoom: 7,
    metrics: [
      { label: "Couverture nationale Penta3", value: "81%", change: "+6%" },
      { label: "Districts < 70%", value: "11", change: "" },
      { label: "Enfants vaccinés estimés", value: "2.9 M", change: "" },
    ],
    keyFindings: [
      "Abidjan atteint 94% de couverture",
      "Les zones frontalières du nord-ouest sont en retard",
      "Forte amélioration grâce aux approches communautaires",
      "Nécessité de renforcer la chaîne du froid dans 7 districts",
    ],
    markers: [
      { position: [5.35, -4.05], type: 'good', popup: 'CHU Treichville - 96%' },
      { position: [9.45, -6.65], type: 'neutral', popup: 'District de Korhogo - 67%' },
      { position: [6.8, -5.3], type: 'good', popup: 'Yamoussoukro - 89%' },
      { position: [7.9, -3.1], type: 'bad', popup: 'District de Bondoukou - 54%' },
    ],
    polygons: [],
  },
  {
    id: 4,
    title: "Sécurité Alimentaire",
    country: "Niger",
    zone: "Diffa, Agadez, Maradi",
    year: 2024,
    date: "2024-09-01",
    theme: "Nutrition & Sécurité Alimentaire",
    color: "#f59e0b",
    image: "",
    description: "Phases IPC et prévalence de la malnutrition aiguë globale.",
    longDesc: "Évaluation intégrée de la sécurité alimentaire et nutritionnelle au Niger. La carte combine des données IPC (Integrated Phase Classification), des enquêtes SMART et des données de marché.",
    study: "Analyse intégrée de la sécurité alimentaire et nutritionnelle",
    authors: "C. GOUESSE",
    center: [17.0, 8.0],
    zoom: 6,
    metrics: [
      { label: "Population en phase 3+", value: "3.2 M", change: "" },
      { label: "Prévalence MAG", value: "13.4%", change: "-2.1pp" },
      { label: "Marchés fonctionnels", value: "87%", change: "" },
    ],
    keyFindings: [
      "La région de Diffa reste en crise alimentaire",
      "Amélioration dans le sud-ouest grâce aux pluies 2024",
      "Les enfants de moins de 5 ans sont les plus vulnérables",
      "Recommandation : diversification des sources de revenus",
    ],
    markers: [
      { position: [16.95, 7.1], type: 'bad', popup: 'Diffa - Phase 4' },
      { position: [13.5, 2.1], type: 'neutral', popup: 'Niamey - Phase 2' },
      { position: [17.8, 8.9], type: 'bad', popup: 'Agadez - Sécheresse' },
      { position: [14.2, 5.4], type: 'good', popup: 'Maradi - Amélioration' },
    ],
    polygons: [],
  },
];

function emptyProject(id: number): Project {
  return {
    id,
    title: "Nouvelle carte",
    country: "",
    zone: "",
    year: new Date().getFullYear(),
    date: new Date().toISOString().slice(0, 10),
    theme: "MEAL / Suivi-Évaluation",
    color: "#0ea5e9",
    image: "",
    description: "",
    longDesc: "",
    study: "",
    authors: "C. GOUESSE",
    center: [12.0, 0.0],
    zoom: 5,
    metrics: [
      { label: "Indicateur 1", value: "—", change: "" },
      { label: "Indicateur 2", value: "—", change: "" },
      { label: "Indicateur 3", value: "—", change: "" },
    ],
    keyFindings: ["Ajoutez vos conclusions..."],
    markers: [],
    polygons: [],
  };
}

function MapController({ project }: { project: Project }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (map) {
      map.flyTo(project.center, project.zoom, { duration: 1.2 });
    }
  }, [project, map]);
  return null;
}

// ========== CONTACT INFO ==========
const CONTACT = {
  email: "christgoue@gmail.com",
  phone: "+225 07 47 51 12 15",
  github: "https://github.com/christgoue",
  linkedin: "https://www.linkedin.com/in/christgoue",
};

// ========== ICONS SVG (pour GitHub / LinkedIn) ==========
function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.07 0 0 .96-.31 3.15 1.18a10.94 10.94 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.6.23 2.78.11 3.07.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5z"/>
    </svg>
  );
}

function LinkedinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.21 24 24 23.23 24 22.28V1.72C24 .77 23.21 0 22.22 0z"/>
    </svg>
  );
}

// ========== EDITOR MODAL ==========
function EditorModal({
  project,
  onSave,
  onClose,
}: {
  project: Project;
  onSave: (p: Project) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Project>({ ...project });
  const [activeTab, setActiveTab] = useState<'general' | 'metrics' | 'findings' | 'markers'>('general');

  const updateField = <K extends keyof Project>(key: K, value: Project[K]) => {
    setDraft({ ...draft, [key]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateField('image', (ev.target?.result as string) || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const addMarker = () => {
    const [lat, lng] = draft.center as [number, number];
    const newMarkers = [
      ...draft.markers,
      { position: [lat + (Math.random() - 0.5) * 2, lng + (Math.random() - 0.5) * 2] as LatLngExpression, type: 'neutral' as const, popup: 'Nouveau point de données' },
    ];
    updateField('markers', newMarkers);
  };

  const removeMarker = (idx: number) => {
    const newMarkers = draft.markers.filter((_, i) => i !== idx);
    updateField('markers', newMarkers);
  };

  const tabs: Array<{ id: any; label: string; icon: any }> = [
    { id: 'general', label: 'Général', icon: FileText },
    { id: 'metrics', label: 'Indicateurs', icon: BarChart3 },
    { id: 'findings', label: 'Conclusions', icon: Target },
    { id: 'markers', label: 'Points & Zone', icon: MapPin },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="theme-bg-elevated border theme-border rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b theme-border">
          <div>
            <div className="text-xs uppercase tracking-[1.5px] theme-accent font-semibold">ÉDITION DU PROJET</div>
            <div className="text-2xl font-semibold theme-text mt-1 tracking-tight">{draft.title || 'Nouvelle carte'}</div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-2xl hover:opacity-80 theme-text-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-x-1 px-8 pt-4 border-b theme-border theme-bg-elevated">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-x-2 px-5 py-3 text-sm border-b-2 -mb-px transition-all ${
                activeTab === tab.id
                  ? 'border-emerald-500 theme-text'
                  : 'border-transparent theme-text-muted hover:opacity-80'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-8 theme-bg-elevated custom-scroll">
          {activeTab === 'general' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Titre de la carte *</label>
                <input
                  value={draft.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full mt-2 theme-bg-base border theme-border focus:border-emerald-500 rounded-2xl px-4 py-3 theme-text focus:outline-none transition-colors"
                  placeholder="Ex : Accès à l'eau potable dans le district de..."
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Pays / Région *</label>
                <input
                  value={draft.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="w-full mt-2 theme-bg-base border theme-border focus:border-emerald-500 rounded-2xl px-4 py-3 theme-text focus:outline-none"
                  placeholder="Ex : Sénégal"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Zone géographique</label>
                <input
                  value={draft.zone}
                  onChange={(e) => updateField('zone', e.target.value)}
                  className="w-full mt-2 theme-bg-base border theme-border focus:border-emerald-500 rounded-2xl px-4 py-3 theme-text focus:outline-none"
                  placeholder="Ex : Dakar, Thiès, Fatick"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Date de conception</label>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full mt-2 theme-bg-base border theme-border focus:border-emerald-500 rounded-2xl px-4 py-3 theme-text focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Année</label>
                <input
                  type="number"
                  value={draft.year}
                  onChange={(e) => updateField('year', parseInt(e.target.value) || 2024)}
                  className="w-full mt-2 theme-bg-base border theme-border focus:border-emerald-500 rounded-2xl px-4 py-3 theme-text focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Thématique</label>
                <select
                  value={draft.theme}
                  onChange={(e) => updateField('theme', e.target.value)}
                  className="w-full mt-2 theme-bg-base border theme-border focus:border-emerald-500 rounded-2xl px-4 py-3 theme-text focus:outline-none"
                >
                  {THEMES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Auteur(s)</label>
                <input
                  value={draft.authors}
                  onChange={(e) => updateField('authors', e.target.value)}
                  className="w-full mt-2 theme-bg-base border theme-border focus:border-emerald-500 rounded-2xl px-4 py-3 theme-text focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Étude / Programme correspondant</label>
                <input
                  value={draft.study}
                  onChange={(e) => updateField('study', e.target.value)}
                  className="w-full mt-2 theme-bg-base border theme-border focus:border-emerald-500 rounded-2xl px-4 py-3 theme-text focus:outline-none"
                  placeholder="Nom de l'étude, du programme ou du projet..."
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Description courte (résumé)</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={2}
                  className="w-full mt-2 theme-bg-base border theme-border focus:border-emerald-500 rounded-2xl px-4 py-3 theme-text focus:outline-none resize-none"
                  placeholder="Résumé en une ou deux phrases..."
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Description détaillée</label>
                <textarea
                  value={draft.longDesc}
                  onChange={(e) => updateField('longDesc', e.target.value)}
                  rows={5}
                  className="w-full mt-2 theme-bg-base border theme-border focus:border-emerald-500 rounded-2xl px-4 py-3 theme-text focus:outline-none resize-none"
                  placeholder="Méthodologie, sources de données, résultats principaux..."
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted flex items-center gap-x-2">
                  <ImageIcon className="h-3.5 w-3.5" /> Image de la carte (optionnel)
                </label>
                <div className="mt-2 border-2 border-dashed theme-border rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer theme-bg-base">
                  {draft.image ? (
                    <img src={draft.image} alt="preview" className="max-h-40 mx-auto rounded-xl" />
                  ) : (
                    <div className="theme-text-muted text-sm">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 theme-text-muted" />
                      Glissez une image ou cliquez
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="img-upload" />
                  <label htmlFor="img-upload" className="inline-block mt-3 text-xs theme-accent font-semibold cursor-pointer uppercase tracking-wider">
                    {draft.image ? 'Changer l\'image' : 'Parcourir...'}
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted flex items-center gap-x-2">
                  <Palette className="h-3.5 w-3.5" /> Couleur du projet
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateField('color', c)}
                      className={`h-9 w-9 rounded-2xl border-2 transition-all ${
                        draft.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="mt-6">
                  <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted flex items-center gap-x-2">
                    <Globe className="h-3.5 w-3.5" /> Centre de la carte (lat, lng)
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      type="number"
                      step="0.01"
                      value={(draft.center as [number, number])[0]}
                      onChange={(e) => updateField('center', [parseFloat(e.target.value) || 0, (draft.center as [number, number])[1]])}
                      className="theme-bg-base border theme-border focus:border-emerald-500 rounded-2xl px-3 py-2 theme-text text-sm focus:outline-none"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={(draft.center as [number, number])[1]}
                      onChange={(e) => updateField('center', [(draft.center as [number, number])[0], parseFloat(e.target.value) || 0])}
                      className="theme-bg-base border theme-border focus:border-emerald-500 rounded-2xl px-3 py-2 theme-text text-sm focus:outline-none"
                    />
                  </div>
                  <input
                    type="range"
                    min="2" max="12"
                    value={draft.zoom}
                    onChange={(e) => updateField('zoom', parseInt(e.target.value))}
                    className="w-full mt-3 accent-emerald-500"
                  />
                  <div className="text-xs theme-text-muted text-center">Niveau de zoom : {draft.zoom}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4 max-w-3xl">
              <div className="text-sm theme-text-secondary mb-6">Définissez jusqu'à 3 indicateurs clés.</div>
              {draft.metrics.map((m, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-end theme-bg-base border theme-border rounded-2xl p-5">
                  <div className="col-span-5">
                    <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Indicateur {idx + 1}</label>
                    <input
                      value={m.label}
                      onChange={(e) => {
                        const newMetrics = [...draft.metrics];
                        newMetrics[idx] = { ...m, label: e.target.value };
                        updateField('metrics', newMetrics);
                      }}
                      className="w-full mt-2 theme-bg-elevated border theme-border focus:border-emerald-500 rounded-xl px-3 py-2.5 theme-text text-sm focus:outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Valeur</label>
                    <input
                      value={m.value}
                      onChange={(e) => {
                        const newMetrics = [...draft.metrics];
                        newMetrics[idx] = { ...m, value: e.target.value };
                        updateField('metrics', newMetrics);
                      }}
                      className="w-full mt-2 theme-bg-elevated border theme-border focus:border-emerald-500 rounded-xl px-3 py-2.5 theme-text text-sm focus:outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs uppercase font-semibold tracking-wider theme-text-muted">Évolution</label>
                    <input
                      value={m.change || ''}
                      onChange={(e) => {
                        const newMetrics = [...draft.metrics];
                        newMetrics[idx] = { ...m, change: e.target.value };
                        updateField('metrics', newMetrics);
                      }}
                      placeholder="Ex : +12%"
                      className="w-full mt-2 theme-bg-elevated border theme-border focus:border-emerald-500 rounded-xl px-3 py-2.5 theme-text text-sm focus:outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => {
                        const newMetrics = draft.metrics.filter((_, i) => i !== idx);
                        updateField('metrics', newMetrics.length ? newMetrics : [{ label: 'Indicateur', value: '—', change: '' }]);
                      }}
                      className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-red-500/20 theme-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {draft.metrics.length < 3 && (
                <button
                  onClick={() => updateField('metrics', [...draft.metrics, { label: 'Nouvel indicateur', value: '—', change: '' }])}
                  className="text-sm theme-accent hover:opacity-80 font-semibold flex items-center gap-x-2"
                >
                  <Plus className="h-4 w-4" /> Ajouter un indicateur
                </button>
              )}
            </div>
          )}

          {activeTab === 'findings' && (
            <div className="space-y-3 max-w-3xl">
              <div className="text-sm theme-text-secondary mb-6">Listez les principales conclusions / résultats de l'étude.</div>
              {draft.keyFindings.map((f, idx) => (
                <div key={idx} className="flex gap-3 items-start theme-bg-base border theme-border rounded-2xl p-4">
                  <div className="theme-accent text-sm font-mono pt-2 w-8">{String(idx + 1).padStart(2, '0')}</div>
                  <textarea
                    value={f}
                    onChange={(e) => {
                      const newFindings = [...draft.keyFindings];
                      newFindings[idx] = e.target.value;
                      updateField('keyFindings', newFindings);
                    }}
                    rows={2}
                    className="flex-1 theme-bg-elevated border theme-border focus:border-emerald-500 rounded-xl px-3 py-2 theme-text text-sm focus:outline-none resize-none"
                  />
                  <button
                    onClick={() => {
                      const newFindings = draft.keyFindings.filter((_, i) => i !== idx);
                      updateField('keyFindings', newFindings.length ? newFindings : ['Ajoutez vos conclusions...']);
                    }}
                    className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-red-500/20 theme-text-muted hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateField('keyFindings', [...draft.keyFindings, 'Nouvelle conclusion...'])}
                className="text-sm theme-accent hover:opacity-80 font-semibold flex items-center gap-x-2 mt-2"
              >
                <Plus className="h-4 w-4" /> Ajouter une conclusion
              </button>
            </div>
          )}

          {activeTab === 'markers' && (
            <div className="space-y-4 max-w-3xl">
              <div className="text-sm theme-text-secondary mb-4">
                Ajoutez des points de données. Les coordonnées sont générées autour du centre défini dans l'onglet Général.
              </div>
              <button
                onClick={addMarker}
                className="text-sm theme-accent hover:opacity-80 font-semibold flex items-center gap-x-2"
              >
                <Plus className="h-4 w-4" /> Ajouter un point
              </button>
              {draft.markers.length === 0 && (
                <div className="text-sm theme-text-muted italic p-8 border border-dashed theme-border rounded-2xl text-center theme-bg-base">
                  Aucun point de données pour l'instant.
                </div>
              )}
              {draft.markers.map((mk, idx) => (
                <div key={idx} className="theme-bg-base border theme-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold theme-text flex items-center gap-x-2">
                      <MapPin className="h-4 w-4" style={{ color: mk.type === 'good' ? '#22c55e' : mk.type === 'bad' ? '#ef4444' : '#eab308' }} />
                      Point #{idx + 1}
                    </div>
                    <button
                      onClick={() => removeMarker(idx)}
                      className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-red-500/20 theme-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <input
                      value={(mk.position as [number, number])[0]}
                      onChange={(e) => {
                        const newM = [...draft.markers];
                        newM[idx] = { ...mk, position: [parseFloat(e.target.value) || 0, (mk.position as [number, number])[1]] };
                        updateField('markers', newM);
                      }}
                      placeholder="Lat"
                      className="theme-bg-elevated border theme-border focus:border-emerald-500 rounded-xl px-3 py-2 theme-text text-sm focus:outline-none"
                    />
                    <input
                      value={(mk.position as [number, number])[1]}
                      onChange={(e) => {
                        const newM = [...draft.markers];
                        newM[idx] = { ...mk, position: [(mk.position as [number, number])[0], parseFloat(e.target.value) || 0] };
                        updateField('markers', newM);
                      }}
                      placeholder="Lng"
                      className="theme-bg-elevated border theme-border focus:border-emerald-500 rounded-xl px-3 py-2 theme-text text-sm focus:outline-none"
                    />
                    <select
                      value={mk.type}
                      onChange={(e) => {
                        const newM = [...draft.markers];
                        newM[idx] = { ...mk, type: e.target.value as 'good' | 'bad' | 'neutral' };
                        updateField('markers', newM);
                      }}
                      className="theme-bg-elevated border theme-border focus:border-emerald-500 rounded-xl px-3 py-2 theme-text text-sm focus:outline-none"
                    >
                      <option value="good">✅ Positif</option>
                      <option value="neutral">⚠️ Neutre</option>
                      <option value="bad">❌ Critique</option>
                    </select>
                  </div>
                  <input
                    value={mk.popup}
                    onChange={(e) => {
                      const newM = [...draft.markers];
                      newM[idx] = { ...mk, popup: e.target.value };
                      updateField('markers', newM);
                    }}
                    placeholder="Libellé / description du point"
                    className="w-full theme-bg-elevated border theme-border focus:border-emerald-500 rounded-xl px-3 py-2 theme-text text-sm focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-x-3 px-8 py-5 border-t theme-border theme-bg-elevated">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm theme-text-secondary hover:opacity-80 hover:theme-bg-base rounded-2xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(draft)}
            className="px-8 py-2.5 text-sm bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-semibold flex items-center gap-x-2 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Save className="h-4 w-4" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== MAIN APP ==========
export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('midata-projects');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PROJECTS;
  });

  const [selectedProjectId, setSelectedProjectId] = useState<number>(projects[0]?.id || 1);
  const [activeTheme, setActiveTheme] = useState<string>("Tous");
  const [activeLayers, setActiveLayers] = useState<string[]>(['markers', 'osm']);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryDetailId, setGalleryDetailId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState<Project | null>(null);

  // Edit mode (protected by code)
  const [editMode, setEditMode] = useState<boolean>(() => {
    try { return localStorage.getItem('midata-edit-mode') === '1'; } catch { return false; }
  });

  // Theme (dark / light)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem('midata-theme') !== 'light'; } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem('midata-projects', JSON.stringify(projects)); } catch {}
  }, [projects]);

  useEffect(() => {
    try { localStorage.setItem('midata-edit-mode', editMode ? '1' : '0'); } catch {}
  }, [editMode]);

  useEffect(() => {
    try {
      localStorage.setItem('midata-theme', isDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } catch {}
  }, [isDark]);

  useEffect(() => {
    if (!projects.find(p => p.id === selectedProjectId) && projects.length) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const allThemes = ["Tous", ...Array.from(new Set(projects.map(p => p.theme)))];
  const filteredProjects = projects.filter(project => {
    const matchesTheme = activeTheme === "Tous" || project.theme === activeTheme;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  const toggleLayer = (layer: string) => {
    if (activeLayers.includes(layer)) {
      setActiveLayers(activeLayers.filter(l => l !== layer));
    } else {
      setActiveLayers([...activeLayers, layer]);
    }
  };

  const getMarkerColor = (type: 'good' | 'bad' | 'neutral') => {
    if (type === 'good') return '#22c55e';
    if (type === 'bad') return '#ef4444';
    return '#eab308';
  };

  const handleCreate = () => {
    if (!editMode) return;
    const newId = Math.max(0, ...projects.map(p => p.id)) + 1;
    setEditing(emptyProject(newId));
  };

  const handleEdit = (project: Project) => {
    if (!editMode) return;
    setEditing({ ...project });
  };

  const handleDelete = (id: number) => {
    if (!editMode) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette carte ?")) return;
    setProjects(projects.filter(p => p.id !== id));
    if (galleryDetailId === id) setGalleryDetailId(null);
  };

  const handleSave = (draft: Project) => {
    const exists = projects.some(p => p.id === draft.id);
    if (exists) {
      setProjects(projects.map(p => (p.id === draft.id ? draft : p)));
    } else {
      setProjects([draft, ...projects]);
      setSelectedProjectId(draft.id);
    }
    setEditing(null);
  };

  // Secret code activator
  const handleSecretTap = () => {
    if (editMode) {
      setEditMode(false);
      return;
    }
    const code = prompt("🔒 Mode édition — Entrez le code d'accès :");
    if (code && code.toLowerCase() === "jaukho") {
      setEditMode(true);
      alert("✅ Mode édition activé. Vous pouvez maintenant modifier les cartes.");
    } else if (code !== null) {
      alert("❌ Code incorrect.");
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden theme-bg-base theme-text">
      {/* ===== TOP NAVIGATION ===== */}
      <header className="flex h-16 items-center justify-between border-b theme-border theme-bg-base px-6">
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 shadow-lg shadow-emerald-500/30">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight theme-text leading-none">MiData</div>
              <div className="text-[11px] theme-accent uppercase tracking-[2px] font-semibold mt-0.5">Cartographie / SIG</div>
            </div>
          </div>

          <div className="ml-10 flex items-center gap-x-2">
            <button
              onClick={() => setShowGallery(false)}
              className={`flex items-center gap-x-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${!showGallery ? 'bg-white text-slate-900 shadow-lg' : 'theme-text-secondary hover:theme-bg-elevated hover:theme-text'}`}
            >
              <MapPin className="h-4 w-4" />
              Visualiseur
            </button>
            <button
              onClick={() => { setShowGallery(true); setGalleryDetailId(null); }}
              className={`flex items-center gap-x-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${showGallery ? 'bg-white text-slate-900 shadow-lg' : 'theme-text-secondary hover:theme-bg-elevated hover:theme-text'}`}
            >
              <BarChart3 className="h-4 w-4" />
              Galerie
            </button>
          </div>
        </div>

        <div className="flex items-center gap-x-3">
          <div className={`flex items-center gap-x-2 rounded-full theme-bg-elevated px-3 py-1.5 text-xs border theme-border`}>
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="theme-text-secondary">{projects.length} cartes</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            title={isDark ? "Passer en mode jour" : "Passer en mode nuit"}
            className="h-10 w-10 flex items-center justify-center rounded-2xl theme-bg-elevated border theme-border hover:theme-border-hover transition-colors theme-text"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* New project (edit mode only) */}
          {editMode && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-x-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-lg shadow-emerald-500/30 transition-all"
            >
              <Plus className="h-4 w-4" />
              Nouvelle carte
            </button>
          )}

          <div className="flex items-center gap-x-3 theme-bg-elevated rounded-2xl pl-2 pr-5 py-1.5 border theme-border">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-sm font-bold text-white">CG</div>
            <div>
              <div className="text-sm theme-text font-medium leading-tight">C. GOUESSE</div>
              <div className="text-[10px] theme-accent uppercase tracking-wider font-semibold -mt-0.5">Expert SIG / MEAL</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ===== LEFT SIDEBAR ===== */}
        <div className="w-80 border-r theme-border theme-bg-base flex flex-col">
          <div className="p-6 border-b theme-border">
            <div className="flex items-center justify-between mb-5">
              <div className="uppercase text-[11px] tracking-[1.5px] font-mono theme-text-secondary font-semibold">Exploration</div>
              <button
                onClick={() => { setActiveTheme("Tous"); setSearchTerm(""); }}
                className="text-xs theme-text-secondary hover:theme-text"
              >
                Réinitialiser
              </button>
            </div>

            <div className="relative mb-5">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une carte, un pays..."
                className="w-full theme-bg-elevated border theme-border focus:border-emerald-500 rounded-2xl py-3 pl-11 text-sm placeholder:theme-text-muted focus:outline-none theme-text"
              />
              <MapPin className="absolute left-4 top-3.5 h-4 w-4 theme-text-muted" />
            </div>

            <div>
              <div className="text-xs theme-text-secondary mb-3 font-semibold uppercase tracking-wider">Thématiques</div>
              <div className="flex flex-wrap gap-2">
                {allThemes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setActiveTheme(theme)}
                    className={`text-xs px-4 py-1.5 rounded-2xl transition-all border font-medium ${activeTheme === theme
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30'
                      : 'theme-bg-elevated theme-border hover:theme-border-hover theme-text-secondary'
                      }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3 custom-scroll">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="uppercase text-[10px] tracking-[2px] theme-text-muted font-semibold">
                Mes cartes ({filteredProjects.length})
              </div>
              {editMode && (
                <button
                  onClick={handleCreate}
                  className="h-7 w-7 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`group p-5 rounded-2xl cursor-pointer transition-all border ${selectedProject?.id === project.id && !showGallery
                  ? 'theme-bg-elevated border-emerald-600 shadow-inner'
                  : 'theme-bg-base theme-border hover:theme-border-hover hover:theme-bg-elevated/50'
                  }`}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setShowGallery(false);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium theme-text text-sm leading-tight mb-1.5 group-hover:theme-accent transition-colors truncate">
                      {project.title}
                    </div>
                    <div className="text-xs theme-text-muted flex items-center gap-x-2">
                      <Globe className="h-3 w-3" />
                      <span>{project.country}</span>
                      <span className="opacity-50">•</span>
                      <span>{project.year}</span>
                    </div>
                  </div>
                  <div
                    className="h-6 w-6 flex-shrink-0 rounded-xl ml-3"
                    style={{ backgroundColor: project.color }}
                  />
                </div>

                <div className="mt-3 text-[11px] theme-text-muted line-clamp-2 leading-relaxed">
                  {project.description || 'Aucune description'}
                </div>

                {editMode && (
                  <div className="mt-4 flex items-center justify-end gap-x-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                      className="h-7 w-7 flex items-center justify-center rounded-xl hover:theme-bg-base theme-text-muted hover:theme-text"
                      title="Modifier"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                      className="h-7 w-7 flex items-center justify-center rounded-xl hover:bg-red-500/20 theme-text-muted hover:text-red-400"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="p-8 text-center theme-text-muted text-sm border border-dashed theme-border rounded-2xl theme-bg-elevated/50">
                Aucune carte trouvée.
              </div>
            )}
          </div>

          {/* ===== CONTACT SECTION ===== */}
          <div className="p-4 border-t theme-border theme-bg-elevated/30">
            <div className="uppercase text-[10px] tracking-[2px] theme-text-muted font-semibold mb-3 px-1">Me contacter</div>
            <div className="space-y-2">
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-x-3 p-2.5 rounded-2xl hover:theme-bg-elevated theme-text-secondary hover:theme-text transition-colors group"
                title={CONTACT.email}
              >
                <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors flex-shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] theme-text-muted uppercase tracking-wider">Email</div>
                  <div className="text-xs theme-text truncate">{CONTACT.email}</div>
                </div>
              </a>
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-x-3 p-2.5 rounded-2xl hover:theme-bg-elevated theme-text-secondary hover:theme-text transition-colors group"
                title={CONTACT.phone}
              >
                <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors flex-shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] theme-text-muted uppercase tracking-wider">Téléphone</div>
                  <div className="text-xs theme-text truncate">{CONTACT.phone}</div>
                </div>
              </a>
              <a
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-x-3 p-2.5 rounded-2xl hover:theme-bg-elevated theme-text-secondary hover:theme-text transition-colors group"
                title="LinkedIn"
              >
                <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors flex-shrink-0">
                  <LinkedinIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] theme-text-muted uppercase tracking-wider">LinkedIn</div>
                  <div className="text-xs theme-text truncate">C. GOUESSE</div>
                </div>
              </a>
              <a
                href={CONTACT.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-x-3 p-2.5 rounded-2xl hover:theme-bg-elevated theme-text-secondary hover:theme-text transition-colors group"
                title="GitHub"
              >
                <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-500/10 theme-text-muted group-hover:bg-slate-500 group-hover:text-white transition-colors flex-shrink-0">
                  <GithubIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] theme-text-muted uppercase tracking-wider">GitHub</div>
                  <div className="text-xs theme-text truncate">@christgoue</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* ===== MAIN AREA ===== */}
        <div className="flex-1 flex flex-col relative theme-bg-base">
          {!showGallery && selectedProject ? (
            /* ===== VISUALIZER VIEW (unchanged) ===== */
            <>
              {/* Map Info Card */}
              <div className="absolute top-5 left-5 z-20 theme-bg-elevated/95 backdrop-blur-lg border theme-border rounded-3xl px-6 py-4 shadow-2xl flex items-center gap-x-5 max-w-[calc(100%-280px)]">
                <div>
                  <div className="flex items-center gap-x-3">
                    <div
                      className="h-10 w-10 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: selectedProject.color + '33', color: selectedProject.color }}
                    >
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg leading-none theme-text">{selectedProject.title}</div>
                      <div className="text-xs theme-text-muted mt-1.5">
                        {selectedProject.country}
                        {selectedProject.zone && ` — ${selectedProject.zone}`}
                        {' • '}{selectedProject.year}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`h-10 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                <div className="text-xs leading-snug max-w-[240px] theme-text-secondary">
                  {selectedProject.description}
                </div>
                {editMode && (
                  <>
                    <div className={`h-10 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                    <button
                      onClick={() => handleEdit(selectedProject)}
                      className="flex items-center gap-x-2 px-4 py-2 text-xs hover:opacity-80 theme-text rounded-2xl border theme-border transition-all"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      MODIFIER
                    </button>
                  </>
                )}
              </div>

              {/* Layer Controls */}
              <div className="absolute top-5 right-5 z-20 theme-bg-elevated/95 backdrop-blur-lg border theme-border rounded-3xl p-2 shadow-2xl w-56">
                <div className="text-[10px] font-mono tracking-[2px] theme-text-muted px-4 pt-2 pb-3 uppercase">Couches</div>
                <div className="space-y-1 pb-2">
                  <button
                    onClick={() => toggleLayer('markers')}
                    className={`w-full flex items-center gap-x-3 px-4 py-2.5 hover:theme-bg-base rounded-2xl text-sm transition-all ${activeLayers.includes('markers') ? 'theme-bg-base theme-text' : 'theme-text-muted'}`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedProject.color }}></div>
                    <span>Points de données</span>
                    <span className="ml-auto text-xs theme-text-muted">{selectedProject.markers.length}</span>
                  </button>
                  <button
                    onClick={() => toggleLayer('polygons')}
                    className={`w-full flex items-center gap-x-3 px-4 py-2.5 hover:theme-bg-base rounded-2xl text-sm transition-all ${activeLayers.includes('polygons') ? 'theme-bg-base theme-text' : 'theme-text-muted'}`}
                  >
                    <div className="w-3 h-3 bg-emerald-400/70 rounded"></div>
                    <span>Zones</span>
                    <span className="ml-auto text-xs theme-text-muted">{selectedProject.polygons.length}</span>
                  </button>
                  <button
                    onClick={() => toggleLayer('osm')}
                    className={`w-full flex items-center gap-x-3 px-4 py-2.5 hover:theme-bg-base rounded-2xl text-sm transition-all ${activeLayers.includes('osm') ? 'theme-bg-base theme-text' : 'theme-text-muted'}`}
                  >
                    <div className="text-amber-400 text-sm">🛰️</div>
                    <span>Fond cartographique</span>
                  </button>
                </div>
                <div className={`border-t theme-border pt-3 pb-2 px-4`}>
                  <div className="text-[10px] font-mono tracking-[2px] theme-text-muted mb-3 uppercase">Légende</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-x-2.5 theme-text-secondary">
                      <div className="w-3 h-3 rounded-full bg-green-500 border-2 theme-border"></div>
                      <span>Positif / Fonctionnel</span>
                    </div>
                    <div className="flex items-center gap-x-2.5 theme-text-secondary">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 theme-border"></div>
                      <span>Neutre / À surveiller</span>
                    </div>
                    <div className="flex items-center gap-x-2.5 theme-text-secondary">
                      <div className="w-3 h-3 rounded-full bg-red-500 border-2 theme-border"></div>
                      <span>Critique / À traiter</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* THE MAP */}
              <div className="flex-1 relative">
                {selectedProject.image ? (
                  <div className="h-full w-full flex items-center justify-center theme-bg-base p-8 relative">
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
                    />
                  </div>
                ) : (
                  <MapContainer
                    center={selectedProject.center}
                    zoom={selectedProject.zoom}
                    className="h-full w-full"
                    zoomControl={false}
                    attributionControl={false}
                  >
                    <MapController project={selectedProject} />
                    {activeLayers.includes('osm') ? (
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                    ) : (
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                        attribution='Tiles &copy; Esri'
                      />
                    )}
                    {activeLayers.includes('polygons') && selectedProject.polygons.map((poly, index) => (
                      <Polygon
                        key={index}
                        positions={poly.positions}
                        pathOptions={{
                          color: isDark ? '#111827' : '#1e293b',
                          fillColor: poly.color,
                          fillOpacity: 0.65,
                          weight: 2
                        }}
                      >
                        <Popup><div className="font-semibold">{poly.name}</div></Popup>
                      </Polygon>
                    ))}
                    {activeLayers.includes('markers') && selectedProject.markers.map((marker, index) => (
                      <CircleMarker
                        key={index}
                        center={marker.position}
                        radius={marker.radius || 9}
                        pathOptions={{
                          color: isDark ? '#111827' : '#1e293b',
                          fillColor: getMarkerColor(marker.type),
                          fillOpacity: 0.9,
                          weight: 2.5,
                        }}
                      >
                        <Popup>
                          <div className="max-w-[240px]">
                            <div className="font-semibold mb-1 text-base">{marker.popup}</div>
                            <div className="text-xs text-emerald-600 font-semibold">POINT DE DONNÉES</div>
                            <div className="mt-2 text-xs text-slate-600">
                              {selectedProject.title} — {selectedProject.year}
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                )}
              </div>

              {/* Bottom Bar */}
              <div className="h-16 theme-bg-elevated border-t theme-border px-8 flex items-center justify-between text-xs z-10">
                <div className="flex items-center gap-x-6">
                  <div className="flex items-center gap-x-3">
                    <button
                      onClick={() => {
                        const idx = projects.findIndex(p => p.id === selectedProjectId);
                        if (idx > 0) setSelectedProjectId(projects[idx - 1].id);
                      }}
                      disabled={projects.findIndex(p => p.id === selectedProjectId) === 0}
                      className="flex items-center justify-center h-9 w-9 hover:theme-bg-base rounded-2xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="font-mono theme-accent text-sm">
                      {String(projects.findIndex(p => p.id === selectedProjectId) + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                    </div>
                    <button
                      onClick={() => {
                        const idx = projects.findIndex(p => p.id === selectedProjectId);
                        if (idx < projects.length - 1) setSelectedProjectId(projects[idx + 1].id);
                      }}
                      disabled={projects.findIndex(p => p.id === selectedProjectId) === projects.length - 1}
                      className="flex items-center justify-center h-9 w-9 hover:theme-bg-base rounded-2xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className={`h-8 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                  <div className="theme-text-muted flex items-center gap-x-2">
                    <Users className="h-4 w-4" />
                    <span>Auteur : <span className="theme-text font-medium">{selectedProject.authors}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-x-3 theme-text-muted">
                  <button
                    onClick={() => alert(`Export de "${selectedProject.title}" (démo)`)}
                    className="flex items-center gap-x-2 px-4 py-2 hover:theme-bg-base hover:theme-text transition-colors rounded-2xl border theme-border"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-xs tracking-wider font-semibold">EXPORT</span>
                  </button>
                  {editMode && (
                    <button
                      onClick={() => handleEdit(selectedProject)}
                      className="flex items-center gap-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white transition-colors rounded-2xl shadow-lg shadow-emerald-500/20"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span className="text-xs tracking-wider font-semibold">ÉDITER</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : showGallery && galleryDetailId !== null ? (
            /* ===== GALLERY DETAIL VIEW ===== */
            <GalleryDetail
              project={projects.find(p => p.id === galleryDetailId)!}
              isDark={isDark}
              editMode={editMode}
              onBack={() => setGalleryDetailId(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              getMarkerColor={getMarkerColor}
            />
          ) : showGallery ? (
            /* ===== GALLERY GRID ===== */
            <div className="flex-1 overflow-auto theme-bg-base">
              <div className="max-w-7xl mx-auto p-10">
                <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-5xl font-semibold theme-text tracking-tight">Mes Réalisations Cartographiques</h1>
                    <p className="text-lg theme-text-muted mt-3 max-w-2xl">
                      Une sélection de visualisations géospatiales produites dans le cadre de projets MEAL, SIG et d'études territoriales.
                    </p>
                  </div>
                  {editMode && (
                    <button
                      onClick={handleCreate}
                      className="flex items-center gap-x-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg shadow-emerald-500/30 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      Nouvelle carte
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setGalleryDetailId(project.id)}
                      className="group theme-bg-elevated rounded-3xl overflow-hidden border theme-border hover:border-emerald-600 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10"
                    >
                      <div className="h-52 relative theme-bg-base overflow-hidden">
                        {project.image ? (
                          <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[length:6px_6px]' : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[length:6px_6px]'} opacity-60`}></div>
                        )}
                        {!project.image && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="inline-flex h-20 w-20 items-center justify-center rounded-3xl"
                              style={{ backgroundColor: project.color + '22', color: project.color }}
                            >
                              <MapPin className="h-10 w-10" />
                            </div>
                          </div>
                        )}
                        <div
                          className="absolute top-4 left-4 px-3 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-2xl text-white"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.theme.split(" ")[0]}
                        </div>
                        <div className="absolute bottom-4 right-4 px-4 py-1.5 text-[10px] bg-black/70 text-white/90 rounded-2xl flex items-center gap-x-2 backdrop-blur">
                          <Maximize2 className="h-3 w-3" />
                          DÉTAILS
                        </div>
                        {editMode && (
                          <div className="absolute top-4 right-4 flex gap-x-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                              className="h-9 w-9 flex items-center justify-center rounded-2xl bg-slate-900/90 backdrop-blur hover:bg-white text-white hover:text-slate-900 border border-slate-700"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                              className="h-9 w-9 flex items-center justify-center rounded-2xl bg-slate-900/90 backdrop-blur hover:bg-red-500 text-slate-300 hover:text-white border border-slate-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="text-xs theme-text-muted mb-2 flex items-center gap-x-2">
                          <Globe className="h-3 w-3" />
                          {project.country} • {project.year}
                        </div>
                        <h3 className="theme-text text-lg font-semibold leading-tight mb-3 group-hover:theme-accent transition-colors">
                          {project.title}
                        </h3>
                        <p className="theme-text-muted text-sm line-clamp-2 leading-relaxed">
                          {project.description || (project.longDesc || '').substring(0, 120) + '...'}
                        </p>
                        {project.study && (
                          <div className="mt-5 pt-4 border-t theme-border">
                            <div className="text-[10px] uppercase tracking-widest theme-text-muted mb-1">Étude</div>
                            <div className="text-xs theme-text-secondary line-clamp-1">{project.study}</div>
                          </div>
                        )}
                        <div className="mt-5 flex items-center justify-between">
                          <div className="text-[10px] theme-text-muted uppercase tracking-widest">
                            {project.authors}
                          </div>
                          <div className="text-xs theme-accent font-semibold flex items-center gap-x-1.5">
                            Voir détails
                            <ChevronRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {projects.length === 0 && (
                  <div className="mt-20 border border-dashed theme-border rounded-3xl p-16 text-center">
                    <div className="mx-auto w-16 h-16 theme-bg-elevated rounded-3xl flex items-center justify-center mb-6">
                      <MapPin className="theme-text-muted h-8 w-8" />
                    </div>
                    <div className="theme-text text-2xl font-semibold">Aucune carte pour l'instant</div>
                    <div className="theme-text-muted mt-3 max-w-md mx-auto">Commencez à créer votre première carte.</div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* ===== RIGHT PANEL (visualiseur only) ===== */}
        {!showGallery && selectedProject && (
          <div className="w-[380px] border-l theme-border theme-bg-base flex flex-col overflow-hidden">
            <div className="p-7 border-b theme-border">
              <div className="flex justify-between items-center">
                <div className="uppercase tracking-[1.5px] text-[11px] theme-accent font-semibold">Fiche projet</div>
                <div className="text-xs px-3 py-1 theme-bg-elevated rounded-2xl theme-text-muted border theme-border">
                  {selectedProject.year}
                </div>
              </div>
              <h3 className="theme-text text-2xl font-semibold tracking-tight mt-3 leading-tight">
                {selectedProject.title}
              </h3>
              <div className="theme-accent text-sm mt-1.5">{selectedProject.country}</div>
            </div>

            <div className="px-7 flex-1 overflow-auto custom-scroll">
              <div className="theme-bg-elevated rounded-3xl p-5 text-sm leading-relaxed border theme-border mt-7">
                {selectedProject.longDesc || "Aucune description détaillée."}
              </div>

              <div className="mt-7 space-y-3">
                {selectedProject.zone && (
                  <div className="flex gap-x-3 text-sm">
                    <Globe className="h-4 w-4 theme-text-muted mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest theme-text-muted">Zone</div>
                      <div className="theme-text">{selectedProject.zone}</div>
                    </div>
                  </div>
                )}
                {selectedProject.study && (
                  <div className="flex gap-x-3 text-sm">
                    <FileText className="h-4 w-4 theme-text-muted mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest theme-text-muted">Étude</div>
                      <div className="theme-text">{selectedProject.study}</div>
                    </div>
                  </div>
                )}
                <div className="flex gap-x-3 text-sm">
                  <Users className="h-4 w-4 theme-text-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-widest theme-text-muted">Auteur(s)</div>
                    <div className="theme-text">{selectedProject.authors}</div>
                  </div>
                </div>
                <div className="flex gap-x-3 text-sm">
                  <Calendar className="h-4 w-4 theme-text-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-widest theme-text-muted">Date</div>
                    <div className="theme-text">{selectedProject.date}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-xs uppercase font-semibold theme-text-muted mb-4 tracking-wider">Indicateurs clés</div>
                <div className="space-y-3">
                  {selectedProject.metrics.map((metric, index) => (
                    <div key={index} className="theme-bg-elevated border theme-border rounded-2xl p-5">
                      <div className="text-xs theme-text-muted">{metric.label}</div>
                      <div className="flex items-baseline gap-x-3 mt-2">
                        <div className="text-4xl font-semibold theme-text tracking-tight">{metric.value}</div>
                        {metric.change && (
                          <div className="text-xs theme-accent font-semibold">{metric.change}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pb-10">
                <div className="text-xs uppercase font-semibold theme-text-muted mb-4 tracking-wider">Conclusions</div>
                <div className="space-y-4">
                  {selectedProject.keyFindings.map((finding, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="theme-accent text-lg font-light mt-0.5 w-7 flex-shrink-0 font-mono">0{index + 1}</div>
                      <div className="text-sm theme-text-secondary leading-snug pt-1.5">
                        {finding}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {editMode && (
              <div className="px-7 pb-7 pt-5 border-t theme-border mt-auto theme-bg-base">
                <button
                  onClick={() => handleEdit(selectedProject)}
                  className="w-full py-3.5 bg-white hover:bg-amber-100 text-slate-900 rounded-2xl flex items-center justify-center gap-x-2 text-sm font-semibold transition-all active:scale-[0.985] shadow-lg"
                >
                  <Edit3 className="h-4 w-4" />
                  MODIFIER CETTE CARTE
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== HIDDEN BUTTON TO ACTIVATE EDIT MODE (bottom right corner) ===== */}
      <button
        onClick={handleSecretTap}
        title={editMode ? "Désactiver le mode édition" : "Mode édition (protégé)"}
        className={`fixed bottom-3 right-3 z-50 h-9 w-9 flex items-center justify-center rounded-full transition-all opacity-30 hover:opacity-100 ${
          editMode
            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50'
            : 'theme-bg-elevated theme-text-muted border theme-border'
        }`}
      >
        {editMode ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
      </button>

      {/* Editor Modal */}
      {editing && (
        <EditorModal
          project={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

// ========== GALLERY DETAIL COMPONENT ==========
function GalleryDetail({
  project,
  isDark,
  editMode,
  onBack,
  onEdit,
  onDelete,
  getMarkerColor,
}: {
  project: Project;
  isDark: boolean;
  editMode: boolean;
  onBack: () => void;
  onEdit: (p: Project) => void;
  onDelete: (id: number) => void;
  getMarkerColor: (type: 'good' | 'bad' | 'neutral') => string;
}) {
  if (!project) return null;

  return (
    <div className="flex-1 overflow-auto theme-bg-base custom-scroll">
      <div className="max-w-6xl mx-auto p-8 animate-fadeIn">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-x-2 theme-text-secondary hover:theme-text mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la galerie
        </button>

        {/* Hero image */}
        <div className="theme-bg-elevated rounded-3xl overflow-hidden border theme-border mb-6">
          {project.image ? (
            <img src={project.image} alt={project.title} className="w-full h-96 object-cover" />
          ) : (
            <div className="w-full h-96 relative">
              <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[length:6px_6px]' : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[length:6px_6px]'} opacity-60`}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="inline-flex h-32 w-32 items-center justify-center rounded-3xl"
                  style={{ backgroundColor: project.color + '22', color: project.color }}
                >
                  <MapPin className="h-16 w-16" />
                </div>
              </div>
            </div>
          )}

          {/* Title overlay */}
          <div className="p-8">
            <div className="flex items-center gap-x-3 mb-3">
              <span
                className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-2xl text-white"
                style={{ backgroundColor: project.color }}
              >
                {project.theme}
              </span>
              <span className="text-xs theme-text-muted">{project.year}</span>
            </div>
            <h1 className="theme-text text-4xl font-semibold tracking-tight leading-tight mb-3">
              {project.title}
            </h1>
            <div className="flex items-center gap-x-4 text-sm theme-text-muted">
              <span className="flex items-center gap-x-2">
                <Globe className="h-4 w-4" />
                {project.country}
                {project.zone && ` — ${project.zone}`}
              </span>
              <span className="flex items-center gap-x-2">
                <Users className="h-4 w-4" />
                {project.authors}
              </span>
              <span className="flex items-center gap-x-2">
                <Calendar className="h-4 w-4" />
                {project.date}
              </span>
            </div>
          </div>
        </div>

        {/* Description + map preview */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 space-y-6">
            <div className="theme-bg-elevated border theme-border rounded-3xl p-6">
              <div className="text-xs uppercase tracking-wider theme-accent font-semibold mb-3">Description</div>
              <p className="theme-text leading-relaxed">{project.description}</p>
            </div>

            {project.longDesc && (
              <div className="theme-bg-elevated border theme-border rounded-3xl p-6">
                <div className="text-xs uppercase tracking-wider theme-accent font-semibold mb-3">Détails méthodologiques</div>
                <p className="theme-text-secondary leading-relaxed text-sm whitespace-pre-wrap">{project.longDesc}</p>
              </div>
            )}

            {/* Embedded map preview */}
            {project.markers.length > 0 && (
              <div className="theme-bg-elevated border theme-border rounded-3xl overflow-hidden">
                <div className="p-6 border-b theme-border">
                  <div className="text-xs uppercase tracking-wider theme-accent font-semibold">Localisation des points de données</div>
                  <div className="text-sm theme-text-muted mt-1">{project.markers.length} points géolocalisés</div>
                </div>
                <div className="h-80">
                  <MapContainer
                    center={project.center}
                    zoom={project.zoom}
                    className="h-full w-full"
                    zoomControl={false}
                    attributionControl={false}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap'
                    />
                    {project.markers.map((marker, index) => (
                      <CircleMarker
                        key={index}
                        center={marker.position}
                        radius={9}
                        pathOptions={{
                          color: isDark ? '#111827' : '#1e293b',
                          fillColor: getMarkerColor(marker.type),
                          fillOpacity: 0.9,
                          weight: 2.5,
                        }}
                      >
                        <Popup>{marker.popup}</Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            )}

            {/* Key findings */}
            {project.keyFindings.length > 0 && (
              <div className="theme-bg-elevated border theme-border rounded-3xl p-6">
                <div className="text-xs uppercase tracking-wider theme-accent font-semibold mb-4">Conclusions principales</div>
                <div className="space-y-3">
                  {project.keyFindings.map((finding, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="theme-accent text-base font-mono mt-1 w-7 flex-shrink-0">0{index + 1}</div>
                      <div className="theme-text-secondary text-sm leading-relaxed pt-1">{finding}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Metrics */}
            <div className="theme-bg-elevated border theme-border rounded-3xl p-6">
              <div className="text-xs uppercase tracking-wider theme-accent font-semibold mb-4">Indicateurs clés</div>
              <div className="space-y-4">
                {project.metrics.map((m, i) => (
                  <div key={i}>
                    <div className="text-xs theme-text-muted">{m.label}</div>
                    <div className="flex items-baseline gap-x-2 mt-1.5">
                      <div className="text-3xl font-semibold theme-text tracking-tight">{m.value}</div>
                      {m.change && <div className="text-xs theme-accent font-semibold">{m.change}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study */}
            {project.study && (
              <div className="theme-bg-elevated border theme-border rounded-3xl p-6">
                <div className="text-xs uppercase tracking-wider theme-accent font-semibold mb-3 flex items-center gap-x-2">
                  <FileText className="h-3.5 w-3.5" />
                  Étude
                </div>
                <div className="theme-text text-sm">{project.study}</div>
              </div>
            )}

            {/* Actions */}
            {editMode && (
              <div className="flex gap-x-2">
                <button
                  onClick={() => onEdit(project)}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl flex items-center justify-center gap-x-2 text-sm font-semibold transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
