import React, { useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import {OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import 'ol/ol.css';
import './Home.css';


const Home = () => {
   useEffect(()=>{
    const map = new Map({
        layers:[
            new TileLayer({source: new OSM()}),
            new VectorLayer({
                source: new VectorSource({wrapX:false})
            })
        ],
        view: new View({
            center:[0,0],
            zoom:2
        }),
        target:'demoMap',
    });
    return ()=>map.setTarget(null)
   },[]
)
    return (
        <>
            <div id='demoMap' className='demoMapView'></div>
        </>
    )
}

export default Home
