import Menu from './components/Menu';
import Page from './pages/Page';
import React from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { Plugins } from '@capacitor/core';
import MapView from './pages/MapView';
import Routes from './pages/Routes';
import Settings from './pages/Settings';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

const { Storage } = Plugins;

interface AppProps {
}
interface AppState {
  selectedPage: string,
  darkModeOn: any
}
export default class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      selectedPage: '',
      darkModeOn: false
    }
  }

  async updateDarkModeStor() {
    const { darkModeOn } = this.state;
    await Storage.set({
      key: 'darkModeOn',
      value: JSON.stringify(darkModeOn)
    });
    document.body.classList.toggle('dark', darkModeOn);
  }

  async getDarkModeStor() {
    const ret = await Storage.get({ key: 'darkModeOn' });
    const darkModeOn = JSON.parse(ret.value);
    if (darkModeOn !== null) {
      this.setState({ darkModeOn: darkModeOn});
    } else {
      this.setState({ darkModeOn: false }, this.updateDarkModeStor);
    }
  }

  componentDidMount() {
    this.getDarkModeStor();
    // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    // prefersDark.addListener((mediaQuery) => {
    //   var shouldAdd = mediaQuery.matches;
      
    //   if (window.navigator.userAgent.includes('AndroidDarkMode')){
    //     shouldAdd = true
    //   }
      // document.body.classList.toggle('dark', shouldAdd);
    // });
  }

  componentDidUpdate() {
    const { darkModeOn } = this.state;
    document.body.classList.toggle('dark', darkModeOn);
  }

  extCall(darkModeOn) {
    document.body.classList.toggle('dark', darkModeOn);
  }

  render() {
    const { selectedPage } = this.state;
    return (
      <IonApp>
        <IonReactRouter>
          <IonSplitPane contentId="main">
          <Menu selectedPage={selectedPage} />
          <IonRouterOutlet id="main">
            <Route path="/page/:name" render={(props) => {
            // setSelectedPage(props.match.params.name);
            return <Page {...props} />;
            }} exact={true} />
            <Route path="/" render={() => <Redirect to="/Map" />} exact={true} />
            <Route path="/Map" component={MapView} />
            <Route path="/Routes" component={Routes} />
            <Route path="/Settings" render={(props) => <Settings {...props} extCall={this.extCall} />} />
          </IonRouterOutlet>
          </IonSplitPane>
        </IonReactRouter>
      </IonApp>
    )
  }
}