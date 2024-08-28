import React, { useEffect, useState, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { OSM } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { LineString } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Stroke } from 'ol/style';
import { getDistance } from 'ol/sphere';
import NavBar from '../NavBar/NavBar';
import './DrawLines.css';

const DrawLines = () => {
    const [points, setPoints] = useState([]);
    const [distance, setDistance] = useState(0);  // State for storing the distance
    const [formValues, setFormValues] = useState({
        point1: { lat: '', lon: '' },
        point2: { lat: '', lon: '' },
    });

    const mapRef = useRef();
    const vectorSourceRef = useRef(new VectorSource());

    useEffect(() => {
        const rasterLayer = new TileLayer({
            source: new OSM(),
        });

        const vectorLayer = new VectorLayer({
            source: vectorSourceRef.current,
            style: new Style({
                stroke: new Stroke({
                    color: 'blue',
                    width: 3,
                }),
            }),
        });

        mapRef.current = new Map({
            target: 'DrawLinesMap',
            layers: [rasterLayer, vectorLayer],
            view: new View({
                center: [0, 0],
                zoom: 2,
            }),
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.setTarget(undefined);
            }
        };
    }, []);

    useEffect(() => {
        if (points.length === 2) {
            const transformedPoints = points.map((point) => fromLonLat(point));

            const lineString = new LineString(transformedPoints);
            const lineFeature = new Feature({
                geometry: lineString,
            });

            vectorSourceRef.current.clear();
            vectorSourceRef.current.addFeature(lineFeature);

            mapRef.current.getView().fit(lineString.getExtent(), { padding: [50, 50, 50, 50] });

            // Calculate the distance and update the state using the geographic coordinates
            const totalLength = calculateDistance(points); // Use original geographic coordinates
            setDistance(totalLength);  // Update the distance state
        }
    }, [points]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const [point, coord] = name.split('.');
        setFormValues((prevFormValues) => ({
            ...prevFormValues,
            [point]: {
                ...prevFormValues[point],
                [coord]: value,
            },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newPoints = [
            [parseFloat(formValues.point1.lon), parseFloat(formValues.point1.lat)],
            [parseFloat(formValues.point2.lon), parseFloat(formValues.point2.lat)],
        ];
        setPoints(newPoints);
    };

    return (
        <>
            <NavBar />
            <div id="DrawLinesMap" className='drawLinesMapClass'></div>
            <div className='DrawLinesForm'>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Latitude1 : </label>
                        <input type="number" step=".01" name="point1.lat" value={formValues.point1.lat} onChange={handleInputChange} required />
                        <label>Longitude1 : </label>
                        <input type="number" step=".01" name="point1.lon" value={formValues.point1.lon} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label>Latitude2 : </label>
                        <input type="number" step=".01" name="point2.lat" value={formValues.point2.lat} onChange={handleInputChange} required />
                        <label>Longitude2 : </label>
                        <input type="number" step=".01" name="point2.lon" value={formValues.point2.lon} onChange={handleInputChange} required />
                    </div>
                    <button type="submit">Draw Line</button>
                </form>
                <p>Distance: {distance.toFixed(2)} meters</p>
            </div>
        </>
    );
};

const calculateDistance = (coordinates) => {
    if (coordinates.length < 2) {
        return 0;
    }
    let totalLength = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
        // Directly use the geographic coordinates (lat, lon) for distance calculation
        const start = coordinates[i];
        const end = coordinates[i + 1];
        const lineSegmentLength = getDistance(start, end);
        totalLength += lineSegmentLength;
    }
    return totalLength;
};

export default DrawLines;
