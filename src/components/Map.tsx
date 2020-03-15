import React from 'react';
import GoogleMapReact from 'google-map-react';
import './Map.css';

// const AnyReactComponent = ({text}: any) => <div>{text}</div>;

interface MapProps {
  mapCenter: {}
}
interface MapState {
  zoom: number,
  patterns: any,
  map: any,
  maps: any,
  polylines: any,
  routes: any
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
      routes: []
    }
  }
  componentDidMount() {
    const mbusRoutes = "https://cors-anywhere.herokuapp.com/https://mbus.ltp.umich.edu/bustime/api/v3/getroutes?requestType=getroutes&locale=en&key=NztS3ptaAMhC2tsS3rUKFfqPW&format=json"
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
      //console.log(result['bustime-response']['ptr']);
      //patterns['BB'] = result['bustime-response']['ptr'].map(rt => { return rt.pt }).flat(1);
      //patterns['BB'] = result['bustime-response']['ptr'].map(rt => { return rt.pt }).flat(1).map(pt => {return (pt.typ !== 'S')?{lat: pt.lat, lon: pt.lon}:{lat: pt.lat, lon: pt.lon, stpid: pt.stpid, stpnm: pt.stpnm}})
      const routesMap = new Map(result['bustime-response']['routes'].map(rt => [rt.rt, [rt.rtnm, rt.rtclr]]))
      this.setState({routes: routesMap});
      //this.setState({routes: result['bustime-response']['routes'].reduce((map, obj) => {map[obj.rt] = {rtnm: obj.rtnm, rtclr: obj.rtclr};return map;},{})});
      //this.setState({patterns: [...[{'BB': result['bustime-response']['ptr']}]]})
    })
    .catch(error => console.log('error', error));
    const mbusPatterns = "https://cors-anywhere.herokuapp.com/https://mbus.ltp.umich.edu/bustime/api/v3/getpatterns?requestType=getpatterns&rtpidatafeed=bustime&locale=en&key=NztS3ptaAMhC2tsS3rUKFfqPW&format=json";
    
    /*fetch(mbusPatterns + "&rt=BB",
    {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Origin': 'mbus.ltp.umich.edu'
      }
    })
    .then(response => response.json())
    .then(result => {
      //console.log(result['bustime-response']['ptr']);
      //patterns['BB'] = result['bustime-response']['ptr'].map(rt => { return rt.pt }).flat(1);
      //patterns['BB'] = result['bustime-response']['ptr'].map(rt => { return rt.pt }).flat(1).map(pt => {return (pt.typ !== 'S')?{lat: pt.lat, lon: pt.lon}:{lat: pt.lat, lon: pt.lon, stpid: pt.stpid, stpnm: pt.stpnm}})
      patterns['BB'] = result['bustime-response']['ptr'].map(rt => { return rt.pt }).flat(1).map(pt => {return (pt.typ !== 'S')?{lat: pt.lat, lng: pt.lon}:{lat: pt.lat, lng: pt.lon, stpid: pt.stpid, stpnm: pt.stpnm}})
      this.setState({patterns});
      //this.setState({patterns: [...[{'BB': result['bustime-response']['ptr']}]]})
    })
    .catch(error => console.log('error', error));*/
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
      // console.log(vals)
      // console.log(vals.map(val => {
      //   return val['bustime-response']['ptr']
      //   .map(rt => {
      //     return rt.pt.map(pt => {
      //       return (pt.typ !== 'S') 
      //       ? {lat: pt.lat, lng: pt.lon}
      //       : {lat: pt.lat, lng: pt.lon, stpid: pt.stpid, stpnm: pt.stpnm}
      //     });
      //   });
      // }));
      // const patterns = new Map(vals.map(val => {
      //   return val['bustime-response']['ptr'].sort( (a, b) => {
      //     return a.pid - b.pid
      //   }).map(rt => { 
      //     return rt.pt
      //   }).flat(1).map(pt => {
      //     return (pt.typ !== 'S') 
      //     ? {lat: pt.lat, lng: pt.lon}
      //     : {lat: pt.lat, lng: pt.lon, stpid: pt.stpid, stpnm: pt.stpnm}
      //   })
      // }).map((rt, ind) => [selectedRoutes[ind], rt]))
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
      // console.log(patterns);
      // patterns.forEach((rt, pattern) => {console.log(rt); console.log(pattern)})
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
      // patterns.forEach( (pattern, rt) => {
      //   // console.log(pattern);
      //   pattern.forEach(pt => {
      //     const gMap = new google.maps.Polyline({
      //       path: pt,
      //       geodesic: true,
      //       strokeColor: routes.get(rt)[1],
      //       strokeOpacity: 1.0,
      //       strokeWeight: 2
      //     });
      //     gMap.setMap(map);
      //   })
      // })
      // Object.keys(patterns).map(pattern => {
      //   console.log(patterns[pattern]);
      //   console.log(routes.get(pattern)[1]);
      //   new google.maps.Polyline({
      //     path: patterns[pattern],
      //     geodesic: true,
      //     strokeColor: routes.get(pattern)[1],
      //     strokeOpacity: 1.0,
      //     strokeWeight: 2
      //   }).setMap(map);
      // })
    }
    if (polylines) {
      polylines.forEach((plines, rt) => {
        //polyline.setMap(map);
        // console.log(plines);
        plines.forEach(polyline => {
          polyline.setMap(map);
        })
      })
    }
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
      styles: mapStyles
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