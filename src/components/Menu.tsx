import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react'
import React from 'react'
import { useLocation, withRouter } from 'react-router-dom'
import {
  warningSharp,
  warning,
  mapSharp,
  map,
  bus,
  busSharp,
  settings,
  settingsSharp,
} from 'ionicons/icons'
import './Menu.css'

interface AppPage {
  url: string
  iosIcon: string
  mdIcon: string
  title: string
}

const appPages: AppPage[] = [
  {
    title: 'Map',
    url: '/Map',
    iosIcon: map,
    mdIcon: mapSharp,
  },
  {
    title: 'Alerts',
    url: '/page/Alerts',
    iosIcon: warning,
    mdIcon: warningSharp,
  },
  {
    title: 'Routes',
    url: '/Routes',
    iosIcon: bus,
    mdIcon: busSharp,
  },
  {
    title: 'Settings',
    url: '/Settings',
    iosIcon: settings,
    mdIcon: settingsSharp,
  },
]

const Menu: React.FC = () => {
  let location = useLocation()
  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="menu-list" lines="none">
          <IonListHeader>
            <span className="color-highlighted">Better</span>
            <span>Maps</span>
          </IonListHeader>
          <IonNote>the better one</IonNote>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={
                    location.pathname === appPage.url ? 'selected' : ''
                  }
                  routerLink={appPage.url}
                  routerDirection="none"
                  lines="none"
                  detail={false}
                >
                  <IonIcon slot="start" icon={appPage.iosIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            )
          })}
        </IonList>
      </IonContent>
    </IonMenu>
  )
}

export default withRouter(Menu)
