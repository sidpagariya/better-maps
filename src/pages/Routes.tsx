import { IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import React from 'react';
import './Routes.css';

interface RoutesProps {

}
const Routes: React.FC<RoutesProps> = () => {
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
            <IonItem>
                <IonToggle color="bb"></IonToggle>
                <IonLabel>Bursley Baits</IonLabel>
            </IonItem>
            <IonItem>
                <IonToggle color="nw"></IonToggle>
                <IonLabel>Northwood</IonLabel>
            </IonItem>
            <IonItem>
                <IonToggle color="cn"></IonToggle>
                <IonLabel>Commuter North</IonLabel>
            </IonItem>
            <IonItem>
                <IonToggle color="cs"></IonToggle>
                <IonLabel>Commuter South</IonLabel>
            </IonItem>
            <IonItem>
                <IonToggle color="nx"></IonToggle>
                <IonLabel>Northwood Express</IonLabel>
            </IonItem>
            <IonItem>
                <IonToggle color="dd"></IonToggle>
                <IonLabel>Diag-to-Diag</IonLabel>
            </IonItem>
            <IonItem>
                <IonToggle color="mx"></IonToggle>
                <IonLabel>MedExpress</IonLabel>
            </IonItem>
            <IonItem>
                <IonToggle color="os"></IonToggle>
                <IonLabel>Oxford Shuttle</IonLabel>
            </IonItem>
            <IonItem>
                <IonToggle color="ws"></IonToggle>
                <IonLabel>Wall Street-NIB</IonLabel>
            </IonItem>
            <IonItem>
                <IonToggle color="wx"></IonToggle>
                <IonLabel>Wall Street Express</IonLabel>
            </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Routes;
