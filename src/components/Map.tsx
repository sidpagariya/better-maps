import React from 'react';
import GoogleMapReact from 'google-map-react';
import './Map.css';

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
    console.log("Component mounted!");
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
      // console.log(result);
      console.log("Updated buses!");
      const buses = result['bustime-response']['vehicle'].map(vh => {
        if (mbuses) {
          if (mbuses.get(vh.vid)) {
            mbuses.get(vh.vid).setPosition(new maps.LatLng(vh.lat, vh.lon));
            mbuses.get(vh.vid).setIcon({
              path: google.maps.SymbolPath.CIRCLE,
              scale: 4,
              fillColor: routes.get(vh.rt)[1],
              fillOpacity: 1.0,
              rotation: (parseFloat(vh.hdg) + 180) % 360,
              strokeColor: routes.get(vh.rt)[1],
              strokeOpacity: 1.0,
              strokeWeight: 2
            });
          } else {
            const marker = new SlidingMarker({
              position: new maps.LatLng(vh.lat, vh.lon),
              map: map,
              title: vh.rt,
              duration: 500,
              easing: "linear",
              icon: {
                path: "M3606 9262 c-3 -5 1 -33 9 -63 8 -30 15 -55 15 -56 0 -1 -786 -3 -1747 -3 -1640 0 -1748 -1 -1776 -18 -47 -27 -67 -63 -82 -148 -16 -87 -20 -257 -6 -236 5 8 9 39 10 70 2 87 21 213 37 244 31 60 61 68 244 67 105 0 157 -3 143 -9 -27 -11 -43 -40 -43 -77 1 -30 20 -63 39 -63 6 0 11 -4 11 -9 0 -6 450 -9 1153 -9 991 0 1156 2 1184 15 60 28 56 121 -7 146 -8 3 41 6 110 6 118 0 123 -1 86 -14 -49 -17 -56 -25 -59 -60 -4 -50 24 -56 222 -50 98 3 179 10 186 15 7 6 25 8 39 4 22 -5 24 -9 15 -25 -5 -11 -8 -39 -4 -62 30 -222 38 -578 17 -752 -21 -165 -23 -207 -12 -220 15 -18 -26 -28 -54 -13 -13 7 -90 12 -209 12 -196 1 -206 -1 -207 -44 0 -25 44 -68 75 -73 17 -2 -22 -5 -85 -5 -63 -1 -110 2 -104 6 39 26 43 90 8 123 l-26 24 -1166 0 -1167 1 -28 -27 c-30 -31 -36 -79 -12 -99 8 -7 15 -16 15 -21 0 -12 -263 -11 -295 1 -68 26 -90 81 -101 265 -14 214 -23 241 -19 60 4 -189 17 -268 51 -307 45 -50 -41 -48 1824 -48 957 0 1740 -1 1740 -2 0 -2 -7 -27 -15 -57 -15 -57 -13 -71 10 -71 25 0 54 42 61 86 l6 44 222 1 c287 2 310 3 381 28 112 39 138 72 165 201 54 260 47 723 -15 936 -19 66 -62 105 -148 133 -81 27 -139 32 -399 34 l-206 1 -7 44 c-3 24 -15 52 -26 63 -20 20 -44 25 -53 11z m55 -77 c6 -25 16 -49 23 -54 6 -5 117 -11 254 -12 195 -2 242 -5 242 -16 0 -7 -4 -13 -9 -13 -25 0 -34 -84 -14 -128 14 -30 98 -110 133 -126 8 -4 26 -13 40 -21 34 -20 67 -19 79 3 12 22 -4 114 -29 162 -10 20 -32 51 -48 68 -17 18 -26 32 -21 32 27 0 108 -68 110 -92 0 -7 2 -20 4 -28 25 -98 28 -118 45 -320 15 -188 1 -465 -31 -608 -18 -81 -36 -110 -86 -141 -26 -16 -49 -28 -51 -26 -2 2 10 16 26 32 39 37 87 144 85 191 -2 68 0 65 -41 59 -21 -2 -56 -16 -78 -29 -21 -14 -42 -25 -45 -24 -10 2 -97 -102 -104 -124 -10 -32 3 -87 26 -109 19 -18 19 -18 -33 -24 -29 -4 -141 -7 -249 -7 -145 0 -199 -3 -206 -12 -5 -7 -15 -32 -22 -55 -6 -23 -16 -45 -22 -49 -7 -4 -9 1 -5 14 4 11 8 35 10 54 2 18 7 41 11 51 4 10 2 30 -4 44 l-11 25 52 -8 c131 -20 193 -1 226 69 22 48 26 60 47 173 48 256 36 588 -30 806 -35 116 -80 137 -250 112 -45 -6 -48 -5 -36 10 13 16 8 66 -16 155 -4 17 -3 22 5 17 7 -4 17 -27 23 -51z m-18 -86 c7 -26 -18 -36 -148 -55 -55 -8 -106 -17 -112 -19 -17 -6 -17 -5 7 49 l19 46 114 0 c107 0 115 -1 120 -21z m-275 4 c-2 -5 -9 -24 -17 -44 -14 -36 -15 -37 -80 -43 -86 -8 -301 -7 -322 2 -22 9 -8 46 23 63 33 18 404 38 396 22z m-2292 -68 l0 -65 -302 0 c-276 0 -304 2 -324 18 -27 22 -29 65 -5 92 17 19 33 20 324 20 l306 0 1 -65z m309 0 l0 -65 -145 0 -145 0 0 65 0 65 145 0 145 0 0 -65z m307 0 l-4 -65 -144 0 -144 0 0 65 0 65 148 0 147 0 -3 -65z m318 0 l0 -65 -150 0 -150 0 0 65 0 65 150 0 150 0 0 -65z m300 0 l0 -65 -142 0 -143 0 0 65 0 65 143 0 142 0 0 -65z m310 0 l0 -65 -144 0 -144 0 -4 65 -3 65 148 0 147 0 0 -65z m182 48 c21 -19 24 -62 4 -88 -11 -16 -29 -20 -89 -23 l-75 -4 -4 66 -3 66 74 0 c55 0 79 -4 93 -17z m1474 -12 c40 -24 80 -76 97 -127 17 -46 31 -134 22 -134 -24 0 -129 64 -175 106 -51 48 -55 55 -55 96 0 25 6 52 14 61 18 22 59 21 97 -2z m-408 -47 c30 -20 48 -64 72 -177 49 -229 49 -505 1 -739 -37 -179 -59 -204 -176 -201 -38 0 -126 13 -194 27 -68 14 -134 26 -147 26 -29 0 -29 1 -8 175 21 171 21 505 0 688 -20 178 -21 167 13 167 15 0 82 11 147 24 192 40 244 41 292 10z m526 -926 c-14 -101 -51 -172 -111 -213 -60 -40 -108 -29 -118 29 -9 44 12 82 69 133 38 34 137 92 159 93 4 0 5 -19 1 -42z m-3319 -193 l0 -65 -305 0 c-343 0 -350 1 -350 65 0 64 7 65 350 65 l305 0 0 -65z m310 0 l0 -65 -145 0 -145 0 0 65 0 65 145 0 145 0 0 -65z m307 0 l-4 -65 -144 0 -144 0 0 65 0 65 148 0 147 0 -3 -65z m318 0 l0 -65 -150 0 -150 0 0 65 0 65 150 0 150 0 0 -65z m300 0 l0 -65 -142 0 -143 0 0 65 0 65 143 0 142 0 0 -65z m310 0 l0 -65 -147 0 -148 0 3 65 4 65 144 0 144 0 0 -65z m178 49 c15 -10 22 -25 22 -49 0 -49 -28 -65 -115 -65 l-70 0 0 65 0 65 70 0 c48 0 78 -5 93 -16z m478 -20 c58 -6 60 -7 77 -47 9 -22 15 -42 12 -45 -9 -9 -373 16 -394 28 -31 16 -44 53 -22 62 21 9 250 10 327 2z m231 -30 c120 -17 148 -29 137 -57 -5 -15 -21 -17 -120 -17 l-113 0 -21 46 c-24 55 -24 55 -7 49 6 -2 62 -11 124 -21z M4034 8798 c3 -24 11 -95 16 -158 6 -63 12 -115 14 -117 1 -1 19 0 40 4 l38 6 -5 51 c-4 28 -9 93 -13 144 -6 87 -9 94 -31 103 -13 5 -33 9 -44 9 -18 0 -20 -5 -15 -42z m60 -15 c3 -16 8 -59 11 -98 3 -38 8 -85 10 -102 3 -27 1 -33 -15 -33 -15 0 -20 10 -26 45 -3 25 -4 58 -2 74 2 17 1 28 -4 25 -4 -3 -8 22 -8 55 0 46 3 61 14 61 8 0 17 -12 20 -27z M4373 8775 c3 -11 8 -29 11 -40 3 -11 10 -62 15 -114 8 -69 7 -100 -2 -115 -12 -23 -11 -40 4 -72 8 -15 6 -54 -6 -139 -9 -66 -18 -123 -21 -127 -3 -4 -1 -8 5 -8 19 0 31 38 41 137 6 54 15 116 20 139 5 24 5 55 0 75 -5 19 -14 81 -20 139 -8 84 -14 109 -31 125 -21 20 -21 20 -16 0z m57 -305 c0 -22 -4 -40 -10 -40 -5 0 -10 18 -10 40 0 22 5 40 10 40 6 0 10 -18 10 -40z M257 8943 c-40 -79 -52 -519 -22 -863 6 -72 28 -100 79 -100 45 0 54 21 48 107 -8 102 -9 631 -1 755 7 110 -1 128 -59 128 -24 0 -35 -6 -45 -27z m83 -118 c-3 -66 -5 -219 -5 -340 0 -121 2 -278 5 -350 l5 -130 -31 -3 c-18 -2 -36 3 -43 12 -43 52 -43 870 0 922 7 9 25 14 43 12 l31 -3 -5 -120z",
                scale: 1,
                fillColor: routes.get(vh.rt)[1],
                fillOpacity: 1.0,
                rotation: (parseFloat(vh.hdg) + 180) % 360,
                strokeColor: routes.get(vh.rt)[1],
                strokeOpacity: 1.0,
                strokeWeight: 2
              }
            });
            marker.setDuration(5000);
            mbuses.set(vh.vid, marker);
          }
        } else {
          mbuses = new Map();
          const marker = new SlidingMarker({
            position: new maps.LatLng(vh.lat, vh.lon),
            map: map,
            title: vh.rt,
            duration: 500,
            easing: "linear",
            icon: {
              path: "M3606 9262 c-3 -5 1 -33 9 -63 8 -30 15 -55 15 -56 0 -1 -786 -3 -1747 -3 -1640 0 -1748 -1 -1776 -18 -47 -27 -67 -63 -82 -148 -16 -87 -20 -257 -6 -236 5 8 9 39 10 70 2 87 21 213 37 244 31 60 61 68 244 67 105 0 157 -3 143 -9 -27 -11 -43 -40 -43 -77 1 -30 20 -63 39 -63 6 0 11 -4 11 -9 0 -6 450 -9 1153 -9 991 0 1156 2 1184 15 60 28 56 121 -7 146 -8 3 41 6 110 6 118 0 123 -1 86 -14 -49 -17 -56 -25 -59 -60 -4 -50 24 -56 222 -50 98 3 179 10 186 15 7 6 25 8 39 4 22 -5 24 -9 15 -25 -5 -11 -8 -39 -4 -62 30 -222 38 -578 17 -752 -21 -165 -23 -207 -12 -220 15 -18 -26 -28 -54 -13 -13 7 -90 12 -209 12 -196 1 -206 -1 -207 -44 0 -25 44 -68 75 -73 17 -2 -22 -5 -85 -5 -63 -1 -110 2 -104 6 39 26 43 90 8 123 l-26 24 -1166 0 -1167 1 -28 -27 c-30 -31 -36 -79 -12 -99 8 -7 15 -16 15 -21 0 -12 -263 -11 -295 1 -68 26 -90 81 -101 265 -14 214 -23 241 -19 60 4 -189 17 -268 51 -307 45 -50 -41 -48 1824 -48 957 0 1740 -1 1740 -2 0 -2 -7 -27 -15 -57 -15 -57 -13 -71 10 -71 25 0 54 42 61 86 l6 44 222 1 c287 2 310 3 381 28 112 39 138 72 165 201 54 260 47 723 -15 936 -19 66 -62 105 -148 133 -81 27 -139 32 -399 34 l-206 1 -7 44 c-3 24 -15 52 -26 63 -20 20 -44 25 -53 11z m55 -77 c6 -25 16 -49 23 -54 6 -5 117 -11 254 -12 195 -2 242 -5 242 -16 0 -7 -4 -13 -9 -13 -25 0 -34 -84 -14 -128 14 -30 98 -110 133 -126 8 -4 26 -13 40 -21 34 -20 67 -19 79 3 12 22 -4 114 -29 162 -10 20 -32 51 -48 68 -17 18 -26 32 -21 32 27 0 108 -68 110 -92 0 -7 2 -20 4 -28 25 -98 28 -118 45 -320 15 -188 1 -465 -31 -608 -18 -81 -36 -110 -86 -141 -26 -16 -49 -28 -51 -26 -2 2 10 16 26 32 39 37 87 144 85 191 -2 68 0 65 -41 59 -21 -2 -56 -16 -78 -29 -21 -14 -42 -25 -45 -24 -10 2 -97 -102 -104 -124 -10 -32 3 -87 26 -109 19 -18 19 -18 -33 -24 -29 -4 -141 -7 -249 -7 -145 0 -199 -3 -206 -12 -5 -7 -15 -32 -22 -55 -6 -23 -16 -45 -22 -49 -7 -4 -9 1 -5 14 4 11 8 35 10 54 2 18 7 41 11 51 4 10 2 30 -4 44 l-11 25 52 -8 c131 -20 193 -1 226 69 22 48 26 60 47 173 48 256 36 588 -30 806 -35 116 -80 137 -250 112 -45 -6 -48 -5 -36 10 13 16 8 66 -16 155 -4 17 -3 22 5 17 7 -4 17 -27 23 -51z m-18 -86 c7 -26 -18 -36 -148 -55 -55 -8 -106 -17 -112 -19 -17 -6 -17 -5 7 49 l19 46 114 0 c107 0 115 -1 120 -21z m-275 4 c-2 -5 -9 -24 -17 -44 -14 -36 -15 -37 -80 -43 -86 -8 -301 -7 -322 2 -22 9 -8 46 23 63 33 18 404 38 396 22z m-2292 -68 l0 -65 -302 0 c-276 0 -304 2 -324 18 -27 22 -29 65 -5 92 17 19 33 20 324 20 l306 0 1 -65z m309 0 l0 -65 -145 0 -145 0 0 65 0 65 145 0 145 0 0 -65z m307 0 l-4 -65 -144 0 -144 0 0 65 0 65 148 0 147 0 -3 -65z m318 0 l0 -65 -150 0 -150 0 0 65 0 65 150 0 150 0 0 -65z m300 0 l0 -65 -142 0 -143 0 0 65 0 65 143 0 142 0 0 -65z m310 0 l0 -65 -144 0 -144 0 -4 65 -3 65 148 0 147 0 0 -65z m182 48 c21 -19 24 -62 4 -88 -11 -16 -29 -20 -89 -23 l-75 -4 -4 66 -3 66 74 0 c55 0 79 -4 93 -17z m1474 -12 c40 -24 80 -76 97 -127 17 -46 31 -134 22 -134 -24 0 -129 64 -175 106 -51 48 -55 55 -55 96 0 25 6 52 14 61 18 22 59 21 97 -2z m-408 -47 c30 -20 48 -64 72 -177 49 -229 49 -505 1 -739 -37 -179 -59 -204 -176 -201 -38 0 -126 13 -194 27 -68 14 -134 26 -147 26 -29 0 -29 1 -8 175 21 171 21 505 0 688 -20 178 -21 167 13 167 15 0 82 11 147 24 192 40 244 41 292 10z m526 -926 c-14 -101 -51 -172 -111 -213 -60 -40 -108 -29 -118 29 -9 44 12 82 69 133 38 34 137 92 159 93 4 0 5 -19 1 -42z m-3319 -193 l0 -65 -305 0 c-343 0 -350 1 -350 65 0 64 7 65 350 65 l305 0 0 -65z m310 0 l0 -65 -145 0 -145 0 0 65 0 65 145 0 145 0 0 -65z m307 0 l-4 -65 -144 0 -144 0 0 65 0 65 148 0 147 0 -3 -65z m318 0 l0 -65 -150 0 -150 0 0 65 0 65 150 0 150 0 0 -65z m300 0 l0 -65 -142 0 -143 0 0 65 0 65 143 0 142 0 0 -65z m310 0 l0 -65 -147 0 -148 0 3 65 4 65 144 0 144 0 0 -65z m178 49 c15 -10 22 -25 22 -49 0 -49 -28 -65 -115 -65 l-70 0 0 65 0 65 70 0 c48 0 78 -5 93 -16z m478 -20 c58 -6 60 -7 77 -47 9 -22 15 -42 12 -45 -9 -9 -373 16 -394 28 -31 16 -44 53 -22 62 21 9 250 10 327 2z m231 -30 c120 -17 148 -29 137 -57 -5 -15 -21 -17 -120 -17 l-113 0 -21 46 c-24 55 -24 55 -7 49 6 -2 62 -11 124 -21z M4034 8798 c3 -24 11 -95 16 -158 6 -63 12 -115 14 -117 1 -1 19 0 40 4 l38 6 -5 51 c-4 28 -9 93 -13 144 -6 87 -9 94 -31 103 -13 5 -33 9 -44 9 -18 0 -20 -5 -15 -42z m60 -15 c3 -16 8 -59 11 -98 3 -38 8 -85 10 -102 3 -27 1 -33 -15 -33 -15 0 -20 10 -26 45 -3 25 -4 58 -2 74 2 17 1 28 -4 25 -4 -3 -8 22 -8 55 0 46 3 61 14 61 8 0 17 -12 20 -27z M4373 8775 c3 -11 8 -29 11 -40 3 -11 10 -62 15 -114 8 -69 7 -100 -2 -115 -12 -23 -11 -40 4 -72 8 -15 6 -54 -6 -139 -9 -66 -18 -123 -21 -127 -3 -4 -1 -8 5 -8 19 0 31 38 41 137 6 54 15 116 20 139 5 24 5 55 0 75 -5 19 -14 81 -20 139 -8 84 -14 109 -31 125 -21 20 -21 20 -16 0z m57 -305 c0 -22 -4 -40 -10 -40 -5 0 -10 18 -10 40 0 22 5 40 10 40 6 0 10 -18 10 -40z M257 8943 c-40 -79 -52 -519 -22 -863 6 -72 28 -100 79 -100 45 0 54 21 48 107 -8 102 -9 631 -1 755 7 110 -1 128 -59 128 -24 0 -35 -6 -45 -27z m83 -118 c-3 -66 -5 -219 -5 -340 0 -121 2 -278 5 -350 l5 -130 -31 -3 c-18 -2 -36 3 -43 12 -43 52 -43 870 0 922 7 9 25 14 43 12 l31 -3 -5 -120z",
              scale: 1,
              fillColor: routes.get(vh.rt)[1],
              fillOpacity: 0.7,
              rotation: (parseFloat(vh.hdg) + 180) % 360,
              strokeColor: routes.get(vh.rt)[1],
              strokeOpacity: 1.0,
              strokeWeight: 2
            }
          });
          marker.setDuration(5000);
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