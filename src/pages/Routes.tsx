import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react'
import React from 'react'
import { Plugins } from '@capacitor/core'
import Color from 'color';
import './Routes.css'

const { Storage } = Plugins

interface RoutesProps {}

interface RoutesState {
  routes: any
  routesStor: Object
}

export default class Routes extends React.Component<RoutesProps, RoutesState> {
  constructor(props) {
    super(props)
    this.state = {
      routes: null,
      routesStor: null,
    }

    this.updateToggle = this.updateToggle.bind(this)
  }

  async updateRoutesStor() {
    const { routesStor } = this.state
    await Storage.set({
      key: 'routesStor',
      value: JSON.stringify(routesStor),
    })
  }

  async getRoutesStor() {
    const ret = await Storage.get({ key: 'routesStor' })
    const routesStor = JSON.parse(ret.value)
    if (routesStor) {
      this.setState({ routesStor: routesStor })
    } else {
      this.setState({ routesStor: {} })
    }
  }

  componentDidMount() {
    const mbusRoutes =
      'https://mbus-cors.herokuapp.com/https://mbus.ltp.umich.edu/bustime/api/v3/getroutes?requestType=getroutes&locale=en&key=8TYWA9FMumRW5JgFXRzkj2Upk&format=json'
    fetch(mbusRoutes, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Origin: 'mbus.ltp.umich.edu',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        var routesMap = new Map(
          result['bustime-response']['routes'].map((rt) => [
            rt.rt,
            [rt.rtnm, rt.rtclr, false],
          ])
        )
        this.getRoutesStor().then(() => {
          var { routesStor } = this.state
          routesMap.forEach((_value, key: string) => {
            if (key in routesStor) {
              routesMap.get(key)[2] = routesStor[key]
            } else {
              routesStor[key] = routesMap.get(key)[2]
            }
          })
          this.setState({ routes: routesMap })
        })
      })
      .catch((error) => console.log('error', error))
  }

  updateToggle(e) {
    var { routesStor } = this.state
    if ('checked' in e.detail && 'value' in e.detail) {
      routesStor[e.detail.value] = e.detail.checked
      this.updateRoutesStor()
    }
  }

  render() {
    const { routes, routesStor } = this.state
    if (routes && routesStor) {
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonMenuButton />
              </IonButtons>
              <IonTitle>Routes</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            <IonHeader collapse="condense">
              <IonToolbar>
                <IonTitle size="large">Routes</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonList lines="none">
              {Array.from(routes).map(([key, value]) => (
                <React.Fragment key={key.toLowerCase()}>
                  <style key={key.toLowerCase()} dangerouslySetInnerHTML={{__html: `
                    :root {
                      --ion-color-`+key.toLowerCase()+`: `+value[1]+`;
                      --ion-color-`+key.toLowerCase()+`-rgb: `+Color(value[1]).rgb().toString().slice(4, -1)+`;
                      --ion-color-`+key.toLowerCase()+`-contrast: #ffffff;
                      --ion-color-`+key.toLowerCase()+`-contrast-rgb: 255, 255, 255;
                      --ion-color-`+key.toLowerCase()+`-shade: `+Color(value[1]).darken(0.1).hex()+`;
                      --ion-color-`+key.toLowerCase()+`-tint: `+Color(value[1]).lighten(0.1).hex()+`;
                    }
                    
                    .ion-color-`+key.toLowerCase()+` {
                      --ion-color-base: var(--ion-color-`+key.toLowerCase()+`);
                      --ion-color-base-rgb: var(--ion-color-`+key.toLowerCase()+`-rgb);
                      --ion-color-contrast: var(--ion-color-`+key.toLowerCase()+`-contrast);
                      --ion-color-contrast-rgb: var(--ion-color-`+key.toLowerCase()+`-contrast-rgb);
                      --ion-color-shade: var(--ion-color-`+key.toLowerCase()+`-shade);
                      --ion-color-tint: var(--ion-color-`+key.toLowerCase()+`-tint);
                    }
                  `}} />
                  <IonItem key={key}>
                    <IonLabel color={key.toLowerCase()}>{value[0]}</IonLabel>
                    <IonToggle
                      color={key.toLowerCase()}
                      checked={routesStor[key]}
                      onIonChange={this.updateToggle}
                      value={key}
                    ></IonToggle>
                  </IonItem>
                </React.Fragment>
              ))}
            </IonList>
          </IonContent>
        </IonPage>
      )
      // console.log(Array.from(routes, ([key, value]) => value));
    } else {
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonMenuButton />
              </IonButtons>
              <IonTitle>Routes</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            <IonHeader collapse="condense">
              <IonToolbar>
                <IonTitle size="large">Routes</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonList lines="none"></IonList>
          </IonContent>
        </IonPage>
      )
    }
  }
}
