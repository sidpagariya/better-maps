import { IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import React from 'react';
import { Plugins } from '@capacitor/core';
import './Routes.css';

const { Storage } = Plugins;

interface SettingsProps {
  extCall: any
}

interface SettingsState {
  darkModeOn: any
}

export default class Settings extends React.Component<SettingsProps, SettingsState> {
  constructor(props) {
    super(props);
    this.state = {
      darkModeOn: null
    };

    this.updateToggle = this.updateToggle.bind(this);
  }

  async updateDarkModeStor() {
    const { darkModeOn } = this.state;
    await Storage.set({
      key: 'darkModeOn',
      value: JSON.stringify(darkModeOn)
    });
  }

  async getDarkModeStor() {
    const ret = await Storage.get({ key: 'darkModeOn' });
    const darkModeOn = JSON.parse(ret.value);
    if (darkModeOn !== null) {
      this.setState({ darkModeOn: darkModeOn });
    } else {
      this.setState({ darkModeOn: false }, this.updateDarkModeStor);
    }
  }
  
  componentDidMount() {
    this.getDarkModeStor();
  }

  updateToggle(e) {
    if ('checked' in e.detail) {
      this.setState({ darkModeOn: e.detail.checked });
      this.updateDarkModeStor().then(() => {
        this.props.extCall(e.detail.checked);
      });
    }
  }

  render() {
    // console.log(this.props.darkModeOn);
    const { darkModeOn } = this.state;
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Settings</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonList lines="none">
            <IonItem key={'darkMode'}>
              <IonLabel>Dark Mode</IonLabel>
              <IonToggle checked={darkModeOn} onIonChange={this.updateToggle}></IonToggle>
            </IonItem>
          </IonList>
        </IonContent>
      </IonPage>
    );
  }
};