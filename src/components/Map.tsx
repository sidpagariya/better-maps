import React from 'react';
import GoogleMapReact from 'google-map-react';
import './Map.css';
import { mbusSvg, getBusMarkerIcon } from '../const';

// const AnyReactComponent = ({text}: any) => <div>{text}</div>;

interface MapProps {
  mapCenter: {}
}
interface MapState {
  zoom: number,
  map: any,
  maps: any,
  routes: any,
  patterns: any,
  polylines: any,
  buses: any,
  mbuses: any
}

export class GoogleMap extends React.Component<MapProps, MapState> {
  constructor(props: MapProps) {
    super(props);
    this.state = {
      zoom: 14,
      patterns: null,
      map: null,
      maps: null,
      polylines: null,
      routes: null,
      buses: null,
      mbuses: null
    }
  }
  componentDidMount() {
    const mbusRoutes = "https://mbus-cors.herokuapp.com/https://mbus.ltp.umich.edu/bustime/api/v3/getroutes?requestType=getroutes&locale=en&key=8TYWA9FMumRW5JgFXRzkj2Upk&format=json"
    fetch(mbusRoutes,
    {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Origin': 'mbus.ltp.umich.edu'
      }
    })
    .then(response => response.json())
    .then(result => {
      const routesMap = new Map(result['bustime-response']['routes'].map(rt => [rt.rt, [rt.rtnm, rt.rtclr]]))
      this.setState({routes: routesMap});
    })
    .catch(error => console.log('error', error));
    const mbusPatterns = "https://mbus-cors.herokuapp.com/https://mbus.ltp.umich.edu/bustime/api/v3/getpatterns?requestType=getpatterns&rtpidatafeed=bustime&locale=en&key=8TYWA9FMumRW5JgFXRzkj2Upk&format=json";
    
    const selectedRoutes = ['BB', 'NW', 'CN', 'DD', 'NX', 'CS'];
    const promises = selectedRoutes.map(rt => {
      return fetch(mbusPatterns + "&rt="+rt,
      {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'Origin': 'mbus.ltp.umich.edu'
        }
      })
      .then(response => response.json())
    });
    Promise.all(promises).then((vals) => {
      const patterns = new Map(vals.map(val => {
        return val['bustime-response']['ptr']
        .map(rt => {
          return rt.pt.map(pt => {
            return (pt.typ !== 'S') 
            ? {lat: pt.lat, lng: pt.lon}
            : {lat: pt.lat, lng: pt.lon, stpid: pt.stpid, stpnm: pt.stpnm}
          });
        });
      }).map((rt, ind) => [selectedRoutes[ind], rt]))
      this.setState({patterns: patterns});
    });
  }

  componentDidUpdate() {
    const { map, patterns, polylines, routes } = this.state;
    if (map && patterns && routes && !polylines) {
      this.setState({polylines: new Map(
        Array.from(patterns, 
          ([k, v]) => [
            k, 
            v.map(pt => new google.maps.Polyline({
                path: pt,
                geodesic: true,
                strokeColor: routes.get(k)[1],
                strokeOpacity: 1.0,
                strokeWeight: 2
              })
            )
          ]
        )
      )})
    }
    if (polylines) {
      this.renderPolylines(polylines);
    }
  }

  renderPolylines(polylines) {
    const { map, buses } = this.state;
    if (polylines && !buses) {
      polylines.forEach((plines, rt) => {
        plines.forEach(polyline => {
          polyline.setMap(map);
        })
      })
      this.renderBuses();
    }
  }

  renderBuses() {
    const { map, maps, routes } = this.state;
    var { mbuses } = this.state;
    var SlidingMarker = require('marker-animate-unobtrusive');
    const mbusVehicles = 'https://mbus-cors.herokuapp.com/https://mbus.ltp.umich.edu/bustime/api/v3/getvehicles?requestType=getvehicles&key=8TYWA9FMumRW5JgFXRzkj2Upk&format=json';
    fetch(mbusVehicles+'&rt=BB%2CNW%2CCN%2CCS%2CDD%2CNX',
    {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Origin': 'mbus.ltp.umich.edu'
      }
    })
    .then(response => response.json())
    .then(result => {
      const buses = result['bustime-response']['vehicle'].map(vh => {
        if (mbuses) {
          if (mbuses.get(vh.vid)) {
            mbuses.get(vh.vid).setPosition(new maps.LatLng(vh.lat, vh.lon));
            mbuses.get(vh.vid).setIcon(getBusMarkerIcon(routes.get(vh.rt)[1], vh.hdg))
          } else {
            const marker = new SlidingMarker({
              position: new maps.LatLng(vh.lat, vh.lon),
              map: map,
              title: vh.rt,
              duration: 5000,
              easing: "linear",
              icon: getBusMarkerIcon(routes.get(vh.rt)[1], vh.hdg)
            });
            mbuses.set(vh.vid, marker);
          }
        } else {
          mbuses = new Map();
          const marker = new SlidingMarker({
            position: new maps.LatLng(vh.lat, vh.lon),
            map: map,
            title: vh.rt,
            duration: 5000,
            easing: "linear",
            icon: getBusMarkerIcon(routes.get(vh.rt)[1], vh.hdg)
          });
          mbuses.set(vh.vid, marker);
        }
        return {vid: vh.vid, lat: vh.lat, lng: vh.lon, hdg: vh.hdg, rt: vh.rt, spd: vh.spd, id: vh.tablockid};
      })
      this.setState({buses: buses});
      this.setState({mbuses: mbuses});
    })
    .catch(error => console.log('error', error));
    setTimeout(this.renderBuses.bind(this), 5000);
  }

  render() {
    const { mapCenter } = this.props;
    const { zoom } = this.state;
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
      styles: null //mapStyles
    }
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyCW48Rz9hIFEuNdeYKx2sHSz8cQ1z53hI0' }}
          defaultCenter={mapCenter}
          defaultZoom={zoom}
          options={mapOptions}
          yesIWantToUseGoogleMapApiInternals={true}
          onGoogleApiLoaded={({ map, maps }) => this.renderMap(map, maps)}
          />
      </div>
    );
  }
  
  renderMap(map, maps) {
    this.setState({map: map, maps: maps});
    // const infoWindow = new maps.InfoWindow({
    //   content: '<div class="map-label">Pierpont<div>'
    // });
    // const marker = new maps.Marker({
    //   map: map,
    //   position: new maps.LatLng(42.2911535, -83.7174913),
    // });
    // marker.addListener('click', function() {
    //   infoWindow.open(map, marker);
    // });
  }
}

export default GoogleMap;