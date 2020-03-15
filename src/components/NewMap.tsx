import React, { useState } from 'react';
import GoogleMapReact from 'google-map-react';

const AnyReactComponent = ({text}: any) => <div>{text}</div>;

interface MapProps {
  mapCenter: {}
}

const Map : React.FC<MapProps> = ({ mapCenter }) => {
  const [zoom, setZoom] = useState(14);
  const renderMapActions = (map, maps) => {
    new maps.Marker({
      map: map,
      position: new maps.LatLng(42.2911535, -83.7174913),
      label: 'Pierpont'
    });
  }
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyCW48Rz9hIFEuNdeYKx2sHSz8cQ1z53hI0' }}
        defaultCenter={mapCenter}
        defaultZoom={zoom}
        yesIWantToUseGoogleMapApiInternals={true}
        onGoogleApiLoaded={({ map, maps }) => renderMapActions(map, maps)}
        />
    </div>
  );
}

export default Map;