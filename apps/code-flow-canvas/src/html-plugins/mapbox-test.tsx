import ReactMapboxGl from 'react-mapbox-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './mapbox-test.css';
import { memo } from 'react';

export interface IMapBoxTestProps {
  node?: any;
  payload?: any;
}

let accessToken = '';

export const MapBoxTest = (props: IMapBoxTestProps) => {
  const Map = ReactMapboxGl({
    accessToken: accessToken,
  });
  return (
    <div className="no-wheel" style={{ height: '100%', minHeight: '100%', width: '100%', position: 'absolute' }}>
      <Map
        style="mapbox://styles/mapbox/streets-v9"
        containerStyle={{
          height: '100%',
          minHeight: '100%',
          width: '100%',
          position: 'absolute',
        }}
        center={[5.2332526, 52.0906015]}
        zoom={[10]}
        onStyleLoad={(map) => {
          if (mapboxgl) {
            const marker1 = new mapboxgl.Marker();
            marker1.setLngLat([5.2332526, 52.0906015]).addTo(map);
          }
        }}
      ></Map>
    </div>
  );
};

export const getMapBoxTestComponent = (secrets) => {
  accessToken = secrets?.mapbox ?? '';
  return memo(MapBoxTest);
};
