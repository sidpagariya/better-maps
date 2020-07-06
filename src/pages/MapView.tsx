import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import React, { useState } from 'react'
import GoogleMap from '../components/Map'
import './MapView.css'
import { PredictionsModal } from '../components/Modal'

const MapView: React.FC = () => {
  let mapCenter = { lat: 42.2852842, lng: -83.7276201 }
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState(null)

  const modalCallback = (data: any) => {
    setShowModal(true)
    setModalData(data)
  }

  const hideModal = () => {
    setShowModal(false)
    setModalData(null)
  }

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
        <GoogleMap mapCenter={mapCenter} callbackModal={modalCallback} />
        <PredictionsModal
          show={showModal}
          data={modalData}
          hideModalCallback={hideModal}
        />
      </IonContent>
    </IonPage>
  )
}

export default MapView
