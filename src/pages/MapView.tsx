import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import { Location } from '../models/Location';
import GoogleMap from '../components/Map';
import './MapView.css';

interface OwnProps { }

const MapView = () => {
  //let locations : Location[] = [{id: 0, lat: 42.2911535, lng: -83.7174913, name: 'LOL'}]
  let mapCenter : Location = {id: 0, lat: 42.2852842, lng: -83.7276201}
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Map</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Map</IonTitle>
          </IonToolbar>
        </IonHeader>
        <GoogleMap mapCenter={mapCenter} />
      </IonContent>
    </IonPage>
  );
};

export default MapView;