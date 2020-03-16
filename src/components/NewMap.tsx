import React, { useState } from 'react';
import GoogleMapReact from 'google-map-react';
import './NewMap.css';

const AnyReactComponent = ({text}: any) => <div>{text}</div>;

interface MapProps {
  mapCenter: {}
}

const Map : React.FC<MapProps> = ({ mapCenter }) => {
  const [zoom, setZoom] = useState(14);
  const mapStyles = [
    {elementType: 'geometry', stylers: [{color: '#121212'}]},
    {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.fill', stylers: [{color: '#facf8c'}]},
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{color: '#263c3f'}]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{color: '#6b9a76'}]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{color: '#38414e'}]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{color: '#212a37'}]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{color: '#9ca5b3'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{color: '#746855'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{color: '#1f2835'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{color: '#f3d19c'}]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{color: '#2f3948'}]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{color: '#17263c'}]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{color: '#515c6d'}]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{color: '#17263c'}]
    }
  ];
  const mapOptions = {
    styles: mapStyles
  }
  const renderMap = (map, maps) => {
    const infoWindow = new maps.InfoWindow({
      content: '<div class="map-label">Pierpont<div>'
    });
    const marker = new maps.Marker({
      map: map,
      position: new maps.LatLng(42.2911535, -83.7174913),
    });
    marker.addListener('click', function() {
      infoWindow.open(map, marker);
    });
  }
  fetch("https://cors-anywhere.herokuapp.com/https://mbus.ltp.umich.edu/bustime/api/v3/getrtpidatafeeds?requestType=getrtpidatafeeds&locale=en&key=NztS3ptaAMhC2tsS3rUKFfqPW&format=json",
    {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Origin': 'mbus.ltp.umich.edu'
      }
    })
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
  
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyCW48Rz9hIFEuNdeYKx2sHSz8cQ1z53hI0' }}
        defaultCenter={mapCenter}
        defaultZoom={zoom}
        options={mapOptions}
        yesIWantToUseGoogleMapApiInternals={true}
        onGoogleApiLoaded={({ map, maps }) => renderMap(map, maps)}
        />
    </div>
  );
}

export default Map;