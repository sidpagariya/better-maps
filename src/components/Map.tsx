import React from 'react'
import GoogleMapReact from 'google-map-react'
import { withIonLifeCycle } from '@ionic/react'
import { Plugins } from '@capacitor/core'
import * as _ from 'lodash'
import './Map.css'
import {
  getBusMarkerIcon,
  stopPng,
  mapStyles,
  getColoredMarkerIcon,
} from '../const'

const { Storage } = Plugins

const API_URL =
  'https://mbus-cors.herokuapp.com/https://mbus.ltp.umich.edu/bustime/api/v3/'

interface MapProps {
  mapCenter: {}
  callbackModal: (data: any) => void
}
interface MapState {
  zoom: number
  map: any
  maps: any
  options: any
  routes: any
  patterns: any
  stops: any
  polylines: any
  buses: any
  mbuses: any
  renderBusT: any
  selectedRoutes: any
  showStop: any
}

class GoogleMap extends React.Component<MapProps, MapState> {
  ionViewWillEnter() {
    const { renderBusT } = this.state
    if (renderBusT === false) {
      this.updateSelectedRoutes()
    }
    this.getDarkModeStor()
  }

  ionViewWillLeave() {
    this.setState({ renderBusT: false })
  }

  constructor(props: MapProps) {
    super(props)
    this.state = {
      zoom: 14,
      patterns: null,
      stops: null,
      map: null,
      maps: null,
      options: {
        styles: mapStyles,
      },
      polylines: null,
      routes: null,
      buses: null,
      mbuses: null,
      renderBusT: null,
      selectedRoutes: null,
      showStop: null,
    }
    this.toggleDarkTheme = this.toggleDarkTheme.bind(this)
  }

  componentDidMount() {
    // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    // this.toggleDarkTheme(prefersDark.matches);
    // prefersDark.addListener((mediaQuery) => this.toggleDarkTheme(mediaQuery.matches));
    this.getDarkModeStor()
  }

  componentDidUpdate(_prevProps, prevState) {
    const { callbackModal } = this.props
    if (prevState.showStop === null && this.state.showStop !== null) {
      console.log('Stop clicked! Stop: ' + this.state.showStop)
      this.setState({ showStop: null })
      this.fetchPredictions(callbackModal)
    }
  }

  fetchPredictions(callback: (data: any) => void) {
    const { selectedRoutes } = this.state
    var predResult = {
      prds: null,
    }
    const mbusStop =
      API_URL +
      `getstops?key=NztS3ptaAMhC2tsS3rUKFfqPW&format=json&stpid=${this.state.showStop}`
    const mbusPreds =
      API_URL +
      `getpredictions?key=NztS3ptaAMhC2tsS3rUKFfqPW&format=json&rt=${selectedRoutes.join(
        ','
      )}&stpid=${this.state.showStop}`
    return fetch(mbusStop, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Origin: 'mbus.ltp.umich.edu',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        const stopInfo = result['bustime-response']['stops'][0]
        predResult = { ...predResult, ...stopInfo }
        fetch(mbusPreds, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            Origin: 'mbus.ltp.umich.edu',
          },
        })
          .then((response) => response.json())
          .then((result) => {
            if (result['bustime-response']['prd']) {
              predResult.prds = result['bustime-response']['prd'].map(
                (prd) => ({
                  rt: prd.rt,
                  des: prd.des,
                  time: prd.prdctdn,
                })
              )
              // predResult.prds = _.chain(predResult.prds)
              //   .groupBy('rt')
              //   .mapValues((v) => {
              //     return _.chain(v).pluck('time').flattenDeep()
              //   })
              //   .value()
            }
            console.log(predResult)
            callback(predResult)
          })
      })
  }

  fetchRoutes() {
    const mbusRoutes =
      API_URL +
      'getroutes?requestType=getroutes&locale=en&key=NztS3ptaAMhC2tsS3rUKFfqPW&format=json'
    fetch(mbusRoutes, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Origin: 'mbus.ltp.umich.edu',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        const routesMap = new Map(
          result['bustime-response']['routes'].map((rt) => [
            rt.rt,
            [rt.rtnm, rt.rtclr],
          ])
        )
        this.setState({ routes: routesMap }, this.updateSelectedRoutes)
      })
      .catch((error) => console.log('error', error))
  }

  updateSelectedRoutes() {
    const { renderBusT } = this.state
    this.getRoutesStor().then(() => {
      if (!renderBusT) {
        this.setState({ renderBusT: true }, this.renderBuses)
      }
      this.fetchPatterns()
    })
  }

  fetchPatterns() {
    const { selectedRoutes } = this.state
    // const selectedRoutes = ['NW', 'CN', 'DD', 'NX', 'CS', 'NE', 'OS'];
    const mbusPatterns =
      API_URL +
      'getpatterns?requestType=getpatterns&rtpidatafeed=bustime&locale=en&key=NztS3ptaAMhC2tsS3rUKFfqPW&format=json'
    const promises = selectedRoutes.map((rt) => {
      return fetch(mbusPatterns + '&rt=' + rt, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          Origin: 'mbus.ltp.umich.edu',
        },
      }).then((response) => response.json())
    })
    Promise.all(promises).then((vals) => {
      const patterns = new Map(
        vals
          .map((val) => {
            return val['bustime-response']['ptr'].map((rt) => {
              return rt.pt.map((pt) => {
                return pt.typ !== 'S'
                  ? { lat: pt.lat, lng: pt.lon }
                  : {
                      lat: pt.lat,
                      lng: pt.lon,
                      stpid: pt.stpid,
                      stpnm: pt.stpnm,
                    }
              })
            })
          })
          .map((rt, ind) => [selectedRoutes[ind], rt])
      )
      this.setState({ patterns: patterns }, this.initMapPolyLines)
    })
  }

  initMapPolyLines() {
    const { patterns, routes, stops, maps, polylines } = this.state
    if (polylines) {
      polylines.forEach((plines, rt) => {
        plines.forEach((polyline) => {
          polyline.setMap(null)
        })
      })
    }
    if (stops) {
      stops.forEach((stopAll, rt) => {
        stopAll[1].forEach((stopA) => {
          stopA.forEach((stop) => {
            stop.setMap(null)
          })
        })
      })
    }
    const stopsV = Array.from(patterns, ([k, v]) => [
      k,
      v.map((pt) =>
        pt.reduce((arr, stop) => {
          if ('stpid' in stop) {
            var m = new maps.Marker({
              position: new maps.LatLng(stop.lat, stop.lng),
              title: stop.stpnm,
              icon: {
                url: stopPng,
                scaledSize: new google.maps.Size(8, 8),
              },
              url: stop.stpid,
              zIndex: 2,
            })
            maps.event.addListener(m, 'click', this.stopClicked(m, this))
            arr.push(m)
          }
          return arr
        }, [])
      ),
    ])
    this.setState(
      {
        polylines: new Map(
          Array.from(patterns, ([k, v]) => [
            k,
            v.map(
              (pt) =>
                new maps.Polyline({
                  path: pt,
                  geodesic: true,
                  strokeColor: routes.get(k)[1],
                  strokeOpacity: 1.0,
                  strokeWeight: 2,
                })
            ),
          ])
        ),
        stops: stopsV,
      },
      this.renderPolylines
    )
  }

  async getRoutesStor() {
    const ret = await Storage.get({ key: 'routesStor' })
    const routesStor = JSON.parse(ret.value)
    if (routesStor) {
      this.setState({
        selectedRoutes: Object.keys(routesStor).filter(
          (key) => routesStor[key] === true
        ),
      })
    } else {
      this.setState({ selectedRoutes: [] })
    }
  }

  toggleDarkTheme(shouldAdd) {
    if (window.navigator.userAgent.includes('AndroidDarkMode')) {
      shouldAdd = true
    }
    document.body.classList.toggle('dark', shouldAdd)
    this.setState({ options: { styles: shouldAdd ? mapStyles : null } })
  }

  async getDarkModeStor() {
    const ret = await Storage.get({ key: 'darkModeOn' })
    const darkModeOn = JSON.parse(ret.value)
    this.setState({ options: { styles: darkModeOn ? mapStyles : null } })
  }

  renderPolylines() {
    const { map, stops, polylines } = this.state
    polylines.forEach((plines, rt) => {
      plines.forEach((polyline) => {
        polyline.setMap(map)
      })
    })
    stops.forEach((stopAll, rt) => {
      stopAll[1].forEach((stopA) => {
        stopA.forEach((stop) => {
          stop.setMap(map)
        })
      })
    })
  }

  stopClicked(target, mapthis) {
    return function () {
      mapthis.setState({ showStop: target.url })
    }
  }

  renderBuses() {
    const { map, maps, routes, selectedRoutes, renderBusT } = this.state
    var { mbuses } = this.state
    if (renderBusT === null) {
      this.setState({ renderBusT: true })
    } else if (renderBusT === false) {
      return
    }
    if (selectedRoutes && selectedRoutes.length <= 0) {
      setTimeout(this.renderBuses.bind(this), 5000)
      return
    }
    var SlidingMarker = require('marker-animate-unobtrusive')
    const mbusVehicles =
      API_URL +
      'getvehicles?requestType=getvehicles&key=NztS3ptaAMhC2tsS3rUKFfqPW&format=json'
    const routesStr = selectedRoutes.join('%2C')
    fetch(mbusVehicles + '&rt=' + routesStr, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Origin: 'mbus.ltp.umich.edu',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        if (!result['bustime-response']['vehicle']) {
          return
        }
        var vids = result['bustime-response']['vehicle'].map((vh) => vh.vid)
        if (mbuses) {
          mbuses.forEach((mbus, vid) => {
            if (vid.indexOf('-mark') === -1) {
              if (
                !selectedRoutes.includes(mbus.getTitle()) &&
                !vids.includes(vid)
              ) {
                mbus.setMap(null)
                mbuses.get(vid + '-mark').setMap(null)
                mbuses.delete(vid)
                mbuses.delete(vid + '-mark')
              }
            }
          })
        }
        const buses = result['bustime-response']['vehicle'].map((vh) => {
          if (mbuses) {
            if (mbuses.get(vh.vid)) {
              mbuses.get(vh.vid).setMap(map)
              mbuses.get(vh.vid).setPosition(new maps.LatLng(vh.lat, vh.lon))
              mbuses
                .get(vh.vid)
                .setIcon(getBusMarkerIcon(routes.get(vh.rt)[1], vh.hdg))
              mbuses
                .get(vh.vid + '-mark')
                .setPosition(new maps.LatLng(vh.lat, vh.lon))
              mbuses
                .get(vh.vid + '-mark')
                .setIcon(
                  getColoredMarkerIcon(routes.get(vh.rt)[1].slice(1), vh.rt)
                )
            } else {
              const marker = new SlidingMarker({
                position: new maps.LatLng(vh.lat, vh.lon),
                map: map,
                title: vh.rt,
                duration: 5000,
                easing: 'linear',
                icon: getBusMarkerIcon(routes.get(vh.rt)[1], vh.hdg),
                optimized: false,
                zIndex: 3,
              })
              const marker2 = new SlidingMarker({
                position: new maps.LatLng(vh.lat, vh.lon),
                map: map,
                title: vh.rt,
                duration: 5000,
                easing: 'linear',
                icon: getColoredMarkerIcon(
                  routes.get(vh.rt)[1].slice(1),
                  vh.rt
                ),
                optimized: false,
                zIndex: 4,
              })
              mbuses.set(vh.vid + '-mark', marker2)
              mbuses.set(vh.vid, marker)
            }
          } else {
            mbuses = new Map()
            const marker = new SlidingMarker({
              position: new maps.LatLng(vh.lat, vh.lon),
              map: map,
              title: vh.rt,
              duration: 5000,
              easing: 'linear',
              icon: getBusMarkerIcon(routes.get(vh.rt)[1], vh.hdg),
              optimized: false,
              zIndex: 3,
            })
            const marker2 = new SlidingMarker({
              position: new maps.LatLng(vh.lat, vh.lon),
              map: map,
              title: vh.rt,
              duration: 5000,
              easing: 'linear',
              icon: getColoredMarkerIcon(routes.get(vh.rt)[1].slice(1), vh.rt),
              optimized: false,
              zIndex: 4,
            })
            mbuses.set(vh.vid, marker)
            mbuses.set(vh.vid + '-mark', marker2)
          }
          return {
            vid: vh.vid,
            lat: vh.lat,
            lng: vh.lon,
            hdg: vh.hdg,
            rt: vh.rt,
            spd: vh.spd,
            id: vh.tablockid,
          }
        })
        this.setState({ buses: buses, mbuses: mbuses })
      })
      .catch((error) => console.log('error', error))
    setTimeout(this.renderBuses.bind(this), 5000)
  }

  render() {
    const { mapCenter } = this.props
    const { zoom, options } = this.state
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyCW48Rz9hIFEuNdeYKx2sHSz8cQ1z53hI0' }}
          defaultCenter={mapCenter}
          defaultZoom={zoom}
          options={options}
          yesIWantToUseGoogleMapApiInternals={true}
          onGoogleApiLoaded={({ map, maps }) => this.renderMap(map, maps)}
        />
      </div>
    )
  }

  renderMap(map, maps) {
    this.setState({ map: map, maps: maps }, this.fetchRoutes)
  }
}
export default withIonLifeCycle(GoogleMap)
