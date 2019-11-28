import * as React from 'react';
import { AppRegistry } from 'react-native';
import {
  Provider as PaperProvider,
  DarkTheme
} from 'react-native-paper';
import App from './App';
import { name as appName } from './app.json';

const theme = {
  ...DarkTheme,
  mode: 'adaptive',
  roundness: 4,
  colors: {
    ...DarkTheme.colors,
    primary: '#2F3A94',
    accent: '#6979D1',
  },
};

export default function Main() {
  return (
    <PaperProvider theme={theme}>
      <App />
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
