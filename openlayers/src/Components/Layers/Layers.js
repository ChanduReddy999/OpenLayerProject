import React, { useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import ImageLayer from 'ol/layer/Image';
import { OSM, Vector as VectorSource, ImageStatic } from 'ol/source';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import 'ol/ol.css';
import { fromLonLat, get as getProjection } from 'ol/proj';
import NavBar from '../NavBar/NavBar';
import './Layers.css';

const Layers = () => {
    useEffect(() => {
        // Create raster layer with OpenStreetMap
        const rasterLayer = new TileLayer({
            source: new OSM(),
        });

        // Create a vector source and layer
        const vectorSource = new VectorSource();

        // Create a style for the vector features
        const vectorStyle = new Style({
            image: new CircleStyle({
                radius: 7,
                fill: new Fill({ color: '#ffcc33' }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 2,
                }),
            }),
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: vectorStyle,
        });

        // Create a feature and add it to the vector source
        const pointFeature = new Feature(new Point(fromLonLat([78.05, 16.55])));
        // const pointFeature1 = new Feature(new Point(fromLonLat([78.35, 16.55])));
        vectorSource.addFeature(pointFeature);
        // vectorSource.addFeature(pointFeature1);

        // create a image layer
        const imageLayer = new ImageLayer({
            source: new ImageStatic({
                url:'https://chandureddyvadala.netlify.app/static/media/csr_icon.8afe4d3d90213e72ea01.jpg',
                // imageExtent:[8705000, 1870000,8716000, 1882000],
                imageExtent : [
                    ...fromLonLat([78.20, 16.55], getProjection('EPSG:3857')),
                    ...fromLonLat([78.30, 16.65], getProjection('EPSG:3857')),
                  ],
                projection:getProjection('EPSG:3857')
            })
        })

        // Initialize the map with layers
        const map = new Map({
            target: 'layersMap',
            layers: [rasterLayer, vectorLayer, imageLayer], // Add multiple layers here
            view: new View({
                // center: [8705000, 1870000],
                center: fromLonLat([78.1899, 16.56575]),
                zoom: 8,
            }),
        });

        // Cleanup function to remove map instance on component unmount
        return () => map.setTarget(null);
    }, []);

    return (
        <>
            <NavBar />
            <div id='layersMap' className='layersMapClass'></div>
        </>
    );
};

export default Layers;
