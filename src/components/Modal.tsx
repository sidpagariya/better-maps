import React from 'react'
import {
  IonModal,
  IonContent,
  IonLabel,
  IonItem,
  IonList,
  IonChip,
  IonTitle,
  IonToolbar,
  IonHeader,
} from '@ionic/react'

interface PredictionsModalProps {
  data: any
  show: boolean
  hideModalCallback: () => void
}

export const PredictionsModal: React.FC<PredictionsModalProps> = (props) => {
  const { data, show, hideModalCallback } = props
  if (show && data) {
    return (
      <IonContent>
        <IonModal
          isOpen={show}
          swipeToClose={true}
          onDidDismiss={() => hideModalCallback()}
          cssClass="my-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>
                {data.stpid}: {data.stpnm}
              </IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList id="pred-list">
              <IonItem lines="none">
                <IonLabel color="primary">Bursley Baits</IonLabel>
                <IonChip color="primary">
                  <IonLabel>3 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>7 min</IonLabel>
                </IonChip>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="primary">Northwood</IonLabel>
                <IonChip color="primary">
                  <IonLabel>19 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>37 min</IonLabel>
                </IonChip>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="primary">Northwood</IonLabel>
                <IonChip color="primary">
                  <IonLabel>19 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>37 min</IonLabel>
                </IonChip>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="primary">Northwood</IonLabel>
                <IonChip color="primary">
                  <IonLabel>19 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>37 min</IonLabel>
                </IonChip>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="primary">Northwood</IonLabel>
                <IonChip color="primary">
                  <IonLabel>19 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>37 min</IonLabel>
                </IonChip>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="primary">Northwood</IonLabel>
                <IonChip color="primary">
                  <IonLabel>19 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>37 min</IonLabel>
                </IonChip>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="primary">Northwood</IonLabel>
                <IonChip color="primary">
                  <IonLabel>19 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>37 min</IonLabel>
                </IonChip>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="primary">Northwood</IonLabel>
                <IonChip color="primary">
                  <IonLabel>19 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>37 min</IonLabel>
                </IonChip>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="primary">Northwood</IonLabel>
                <IonChip color="primary">
                  <IonLabel>19 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>37 min</IonLabel>
                </IonChip>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="primary">Northwood</IonLabel>
                <IonChip color="primary">
                  <IonLabel>19 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>37 min</IonLabel>
                </IonChip>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="primary">Northwood</IonLabel>
                <IonChip color="primary">
                  <IonLabel>19 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>37 min</IonLabel>
                </IonChip>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="primary">Northwood</IonLabel>
                <IonChip color="primary">
                  <IonLabel>19 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>37 min</IonLabel>
                </IonChip>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="primary">Northwood</IonLabel>
                <IonChip color="primary">
                  <IonLabel>19 min</IonLabel>
                </IonChip>
                <IonChip color="primary">
                  <IonLabel>37 min</IonLabel>
                </IonChip>
              </IonItem>
            </IonList>
          </IonContent>
        </IonModal>
      </IonContent>
    )
  } else {
    return null
  }
}
