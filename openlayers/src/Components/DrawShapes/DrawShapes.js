import { useEffect } from 'react';
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw';
import Map from 'ol/Map';
import Polygon from 'ol/geom/Polygon';
import View from 'ol/View';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import './DrawShapes.css';
import NavBar from '../NavBar/NavBar';
import 'ol/ol.css';


const DrawShapes = () => {
    useEffect(() => {
      // Create raster layer with OpenStreetMap
      const raster = new TileLayer({
        source: new OSM(),
      });
  
      // Create vector source and layer
      const source = new VectorSource({ wrapX: false });
      const vector = new VectorLayer({
        source: source,
      });

      // Create the map
      const map = new Map({
        layers: [raster, vector],
        target: 'maps', // Ensure the ID matches the HTML element
        view: new View({
          center: [-11000000, 4600000],
          zoom: 4,
        }),
      });

      // Get the shape type selector
      const typeSelect = document.getElementById('type');
      let draw; // Global variable for the draw interaction

      // Function to add the draw interaction based on the selected type
      function addInteraction() {
        let value = typeSelect.value;
        if (value !== 'None') {
          let geometryFunction;
          if (value === 'Square') {
            value = 'Circle';
            geometryFunction = createRegularPolygon(4);
          } else if (value === 'Box') {
            value = 'Circle';
            geometryFunction = createBox();
          } else if (value === 'Star') {
            value = 'Circle';
            geometryFunction = function (coordinates, geometry) {
              const center = coordinates[0];
              const last = coordinates[coordinates.length - 1];
              const dx = center[0] - last[0];
              const dy = center[1] - last[1];
              const radius = Math.sqrt(dx * dx + dy * dy);
              const rotation = Math.atan2(dy, dx);
              const newCoordinates = [];
              const numPoints = 12;
              for (let i = 0; i < numPoints; ++i) {
                const angle = rotation + (i * 2 * Math.PI) / numPoints;
                const fraction = i % 2 === 0 ? 1 : 0.5;
                const offsetX = radius * fraction * Math.cos(angle);
                const offsetY = radius * fraction * Math.sin(angle);
                newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
              }
              newCoordinates.push(newCoordinates[0].slice());
              if (!geometry) {
                geometry = new Polygon([newCoordinates]);
              } else {
                geometry.setCoordinates([newCoordinates]);
              }
              // console.log("geometryCoordinates", geometry.extent_);
              return geometry;
            };
          }
          // Create and add the draw interaction
          draw = new Draw({
            source: source,
            type: value,
            geometryFunction: geometryFunction,
          });
          map.addInteraction(draw);
        }
      }

      // Handle shape type change
      typeSelect.onchange = function () {
        map.removeInteraction(draw);
        addInteraction();
      };

      // Handle undo action
      const undoButton = document.getElementById('undo');
      undoButton.addEventListener('click', function () {
        const features = source.getFeatures();
        console.log("features", features);
        console.log("sourceFeatureChangeKeys_", source.featureChangeKeys_);
        // the above two log same co-ordinates

        if (features.length > 0) {
          source.removeFeature(features[features.length - 1]);
        }
      });

      // Initialize with default interaction
      addInteraction();
      
      // Cleanup function to remove interactions, event listeners, and map
      return () => {
        if (draw) {
          map.removeInteraction(draw);
        }
        map.setTarget(null); // Properly dispose of the map
        undoButton.removeEventListener('click', () => {});
      };
    }, []); // Empty dependency array ensures effect runs once on mount
  
    return (
      <> 
        <NavBar />
        <div id="maps" className="map"></div>
        <div className="row formDisplay">
          <div className="col-auto">
            <span className="input-group">
              <label className="input-group-text" htmlFor="type">Shape type:</label>
              <select className="form-select" id="type">
                <option value="Circle">Circle</option>
                <option value="Square">Square</option>
                <option value="Box">Box</option>
                <option value="Star">Star</option>
                <option value="None">None</option>
              </select>
              <input className="form-control" type="button" value="Undo" id="undo" />
            </span>
          </div>
        </div>
      </>
    );
  };
  
export default DrawShapes;
