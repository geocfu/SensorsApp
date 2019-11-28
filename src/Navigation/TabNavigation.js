import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import {
  Provider as PaperProvider,
  DarkTheme
} from 'react-native-paper';

import { RecordSensors } from '../Screens/RecordSensors';
import { RecordingsScreen} from '../Screens/RecordingsScreen';

const TabNavigation = () => {

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

  const Navigation = createAppContainer(
    createBottomTabNavigator({
      Home: RecordSensors,
      Recordings: RecordingsScreen,
    })
  );

  return (
    <PaperProvider theme={theme}>
      <Navigation theme="dark" />
    </PaperProvider>
  )
}

export default TabNavigation;