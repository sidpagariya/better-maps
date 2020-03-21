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
                <IonLabel>Bursley Baits</IonLabel>
                <IonToggle color="bb"></IonToggle>
            </IonItem>
            <IonItem>
                <IonLabel>Northwood</IonLabel>
                <IonToggle color="nw"></IonToggle>
            </IonItem>
            <IonItem>
                <IonLabel>Commuter North</IonLabel>
                <IonToggle color="cn"></IonToggle>
            </IonItem>
            <IonItem>
                <IonLabel>Commuter South</IonLabel>
                <IonToggle color="cs"></IonToggle>
            </IonItem>
            <IonItem>
                <IonLabel>Northwood Express</IonLabel>
                <IonToggle color="nx"></IonToggle>
            </IonItem>
            <IonItem>
                <IonLabel>Diag-to-Diag</IonLabel>
                <IonToggle color="dd"></IonToggle>
            </IonItem>
            <IonItem>
                <IonLabel>MedExpress</IonLabel>
                <IonToggle color="mx"></IonToggle>
            </IonItem>
            <IonItem>
                <IonLabel>Oxford Shuttle</IonLabel>
                <IonToggle color="os"></IonToggle>
            </IonItem>
            <IonItem>
                <IonLabel>Wall Street-NIB</IonLabel>
                <IonToggle color="ws"></IonToggle>
            </IonItem>
            <IonItem>
                <IonLabel>Wall Street Express</IonLabel>
                <IonToggle color="wx"></IonToggle>
            </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Routes;
