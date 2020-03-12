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
} from '@ionic/react';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { warningSharp, warning, mapSharp, map, bus, busSharp, settings, settingsSharp } from 'ionicons/icons';
import './Menu.css';

interface MenuProps extends RouteComponentProps {
  selectedPage: string;
}

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Map',
    url: '/Map',
    iosIcon: map,
    mdIcon: mapSharp
  },
  {
    title: 'Alerts',
    url: '/page/Alerts',
    iosIcon: warning,
    mdIcon: warningSharp
  },
  {
    title: 'Routes',
    url: '/page/Routes',
    iosIcon: bus,
    mdIcon: busSharp,
  },
  {
    title: 'Settings',
    url: '/page/Settings',
    iosIcon: settings,
    mdIcon: settingsSharp
  }
];

const Menu: React.FunctionComponent<MenuProps> = ({ selectedPage }) => {

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list" lines="none">
          <IonListHeader><span className="color-highlighted">Better</span><span>Maps</span></IonListHeader>
          <IonNote>the better one</IonNote>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={selectedPage === appPage.title ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon slot="start" icon={appPage.iosIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default withRouter(Menu);
