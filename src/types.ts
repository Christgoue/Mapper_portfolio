import { LatLngExpression } from 'leaflet';

export interface Metric {
    label: string;
    value: string;
    change?: string;
}

export interface Project {
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
