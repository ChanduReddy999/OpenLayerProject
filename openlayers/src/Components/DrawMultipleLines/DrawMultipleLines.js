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
import './DrawMultipleLines.css';

const DrawMultipleLines = () => {
    const [points, setPoints] = useState([]); // Array of points for drawing lines
    const [formValues, setFormValues] = useState([{ lat: '', lon: '' }]); // Dynamic form values

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
            target: 'DrawMultipleLinesMap',
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
        if (points.length > 1) {
            vectorSourceRef.current.clear(); // Clear previous lines
            let totalDistance = 0;

            for (let i = 0; i < points.length - 1; i++) {
                const start = fromLonLat(points[i]);
                const end = fromLonLat(points[i + 1]);
                const lineString = new LineString([start, end]);
                const lineFeature = new Feature({
                    geometry: lineString,
                });

                vectorSourceRef.current.addFeature(lineFeature);
                mapRef.current.getView().fit(lineString.getExtent(), { padding: [50, 50, 50, 50] });

                totalDistance += getDistance(points[i], points[i + 1]);
            }
            console.log(`Total distance: ${totalDistance.toFixed(2)} meters`);
        }
    }, [points]);

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        setFormValues((prevFormValues) => {
            const updatedFormValues = [...prevFormValues];
            updatedFormValues[index][name] = value;
            return updatedFormValues;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newPoints = formValues.map((formValue) => [
            parseFloat(formValue.lon), parseFloat(formValue.lat)
        ]);
        setPoints(newPoints);
        if (newPoints.length < 2) {
            alert("Atleast Two Points are Needed to Draw a Line, Click Add Point Button to Add Points");
        }
    };

    const handleAddPoint = () => {
        setFormValues((prevFormValues) => [...prevFormValues, { lat: '', lon: '' }]);
    };

    const handleRemoveLastPoint = () => {
        setFormValues((prevFormValues) => {
            if (prevFormValues.length < 1) {
                alert("No more points to remove");
                return prevFormValues;
            }
            return prevFormValues.slice(0, -1)
        });
    };


    return (
        <>
            <NavBar />
            <div id="DrawMultipleLinesMap" className='drawMultipleLinesMapClass'></div>
            <div className='DrawMultipleLinesFormDiv'>
                <form onSubmit={handleSubmit}>
                    {formValues.map((formValue, index) => (
                        <div key={index}>
                            <div>
                                <label>Latitude{index + 1} : </label>
                                <input type="number" step="any" name="lat" value={formValue.lat} onChange={(e) => handleInputChange(e, index)} required />
                                <label>Longitude{index + 1} : </label>
                                <input type="number" step="any" name="lon" value={formValue.lon} onChange={(e) => handleInputChange(e, index)} required />
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddPoint}>Add Point</button>
                    <button type="button" onClick={handleRemoveLastPoint}>Remove Point</button>
                    <button type="submit">Draw Lines</button>
                </form>
                {points.length > 1 && (
                    <p>Total Distance: {points.length > 1 ? calculateTotalDistance(points) : 0} meters</p>
                )}
            </div>
        </>
    );
};

const calculateTotalDistance = (points) => {
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
        totalDistance += getDistance(points[i], points[i + 1]);
    }
    return totalDistance.toFixed(2);
};

export default DrawMultipleLines;
