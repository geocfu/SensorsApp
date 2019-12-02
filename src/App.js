import React from 'react';

import {
  Provider as PaperProvider,
  DarkTheme
} from 'react-native-paper';

import TabNavigation from './navigation/TabNavigation';

const App = () => {

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

  return (
    <PaperProvider theme={theme}>
      <TabNavigation/>
    </PaperProvider>
  );
};

export default App;