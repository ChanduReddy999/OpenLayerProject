import React, { useEffect } from 'react';
import Draw from 'ol/interaction/Draw.js';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import View from 'ol/View.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { LineString, Polygon } from 'ol/geom.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { getArea, getLength } from 'ol/sphere.js';
import { unByKey } from 'ol/Observable.js';
import './Measures.css';
import NavBar from '../NavBar/NavBar';




const Measures = () => {
    useEffect(() => {
        const raster = new TileLayer({
            source: new OSM(),
        });

        const source = new VectorSource();

        const vector = new VectorLayer({
            source: source,
            style: {
                'fill-color': 'rgba(255, 255, 255, 0.2)',
                'stroke-color': '#ff0c33',   // line color after completion of drawing a line
                'stroke-width': 2,
                'circle-radius': 7,
                'circle-fill-color': '#ffcc33',
            },
        });


        // Currently drawn feature.
        // @type {import("../src/ol/Feature.js").default}

        let sketch;


        // The help tooltip element.
        // @type {HTMLElement}

        let helpTooltipElement;


        // Overlay to show the help messages.
        // @type {Overlay}

        let helpTooltip;


        // The measure tooltip element.
        // @type {HTMLElement}

        let measureTooltipElement;


        //  Overlay to show the measurement.
        // @type {Overlay}

        let measureTooltip;


        // Message to show when the user is drawing a polygon.
        // @type {string}

        const continuePolygonMsg = 'Click to continue drawing the polygon';


        // Message to show when the user is drawing a line.
        // @type {string}

        const continueLineMsg = 'Click to continue drawing the line';


        // Handle pointer move.
        // @param {import("../src/ol/MapBrowserEvent").default} evt The event.

        const pointerMoveHandler = function (evt) {
            if (evt.dragging) {
                return;
            }
            // @type {string} 
            let helpMsg = 'Click to start drawing';

            if (sketch) {
                const geom = sketch.getGeometry();
                console.log("geom", geom.flatCoordinates);   // flatCoordinates are the real Coordinates
                if (geom instanceof Polygon) {
                    helpMsg = continuePolygonMsg;
                } else if (geom instanceof LineString) {
                    helpMsg = continueLineMsg;
                }
            }

            helpTooltipElement.innerHTML = helpMsg;
            helpTooltip.setPosition(evt.coordinate);

            helpTooltipElement.classList.remove('hidden');
        };

        const map = new Map({
            layers: [raster, vector],
            target: 'mapMeasures',
            view: new View({
                center: [8705000, 1870000],
                zoom: 14,
                minZoom: 4,
            }),
        });

        map.on('pointermove', pointerMoveHandler);

        map.getViewport().addEventListener('mouseout', function () {
            helpTooltipElement.classList.add('hidden');
        });

        const typeSelect = document.getElementById('type');

        let draw; // global so we can remove it later


        // Format length output
        // @param {LineString} line The line.
        // @return {string} The formatted length.

        const formatLength = function (line) {
            const length = getLength(line);
            let output;
            if (length > 100) {
                output = Math.round((length / 1000) * 100) / 100 + ' km';
            } else {
                output = Math.round(length * 100) / 100 + ' m';
            }
            return output;
        };


        // Format area output.
        // @param {Polygon} polygon The polygon.
        // @return {string} Formatted area.

        const formatArea = function (polygon) {
            const area = getArea(polygon);
            let output;
            if (area > 10000) {
                output = Math.round((area / 1000000) * 100) / 100 + ' km<sup>2</sup>';
            } else {
                output = Math.round(area * 100) / 100 + ' m<sup>2</sup>';
            }
            return output;
        };

        const style = new Style({
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)',
            }),
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2,
            }),
            image: new CircleStyle({
                radius: 5,
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0.7)',
                }),
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)',
                }),
            }),
        });

        function addInteraction() {
            const type = typeSelect.value === 'area' ? 'Polygon' : 'LineString';
            draw = new Draw({
                source: source,
                type: type,
                style: function (feature) {
                    const geometryType = feature.getGeometry().getType();
                    if (geometryType === type || geometryType === 'Point') {
                        return style;
                    }
                },
            });
            map.addInteraction(draw);

            createMeasureTooltip();
            createHelpTooltip();

            let listener;
            draw.on('drawstart', function (evt) {
                // set sketch
                sketch = evt.feature;

                //  @type {import("../src/ol/coordinate.js").Coordinate|undefined} 
                let tooltipCoord = evt.coordinate;

                listener = sketch.getGeometry().on('change', function (evt) {
                    const geom = evt.target;
                    let output;
                    if (geom instanceof Polygon) {
                        output = formatArea(geom);
                        tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    } else if (geom instanceof LineString) {
                        output = formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    measureTooltipElement.innerHTML = output;
                    measureTooltip.setPosition(tooltipCoord);
                });
            });

            draw.on('drawend', function () {
                measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
                measureTooltip.setOffset([0, -7]);
                // unset sketch
                sketch = null;
                // unset tooltip so that a new one can be created
                measureTooltipElement = null;
                createMeasureTooltip();
                unByKey(listener);
            });
        }


        // Creates a new help tooltip

        function createHelpTooltip() {
            if (helpTooltipElement) {
                helpTooltipElement.remove();
            }
            helpTooltipElement = document.createElement('div');
            helpTooltipElement.className = 'ol-tooltip hidden';
            helpTooltip = new Overlay({
                element: helpTooltipElement,
                offset: [15, 0],
                positioning: 'center-left',
            });
            map.addOverlay(helpTooltip);
        }


        // Creates a new measure tooltip

        function createMeasureTooltip() {
            if (measureTooltipElement) {
                measureTooltipElement.remove();
            }
            measureTooltipElement = document.createElement('div');
            measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
            measureTooltip = new Overlay({
                element: measureTooltipElement,
                offset: [0, -15],
                positioning: 'bottom-center',
                stopEvent: false,
                insertFirst: false,
            });
            map.addOverlay(measureTooltip);
        }


        // Let user change the geometry type.

        typeSelect.onchange = function () {
            map.removeInteraction(draw);
            addInteraction();
        };

        addInteraction();
        return () => map.setTarget(null)

    }, [])
    return (
        <>
            <NavBar />
            <div id="mapMeasures" className="mapMeasures"></div>
            <div className='measuresFormDiv'>
                <form>
                    <label htmlFor="type">Measurement type &nbsp;</label>
                    <select id="type">
                        <option value="length">Length (LineString)</option>
                        <option value="area">Area (Polygon)</option>
                    </select>
                </form>
            </div>
        </>
    )
}

export default Measures