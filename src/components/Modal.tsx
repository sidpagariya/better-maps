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
              {data.prds ? Object.entries(data.prds).map(([key, value]: [string, any]) => (
                <IonItem lines="none" key={key}>
                  <IonLabel color="primary">{key}</IonLabel>
                  <IonLabel>To {value.des}</IonLabel>
                  {
                    value.times.map((time) => (
                      <IonChip color="primary" key={time}>
                        <IonLabel>{time==='DUE'?'NOW':`${time} min`}</IonLabel>
                      </IonChip>
                    ))
                  }
                </IonItem>
              )) : 
                <IonItem lines="none">
                  <IonLabel>{`No predictions found.`}</IonLabel>
                </IonItem>
              }
            </IonList>
          </IonContent>
        </IonModal>
      </IonContent>
    )
  } else {
    return null
  }
}
