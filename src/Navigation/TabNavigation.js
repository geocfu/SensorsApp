import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import {
  Provider as PaperProvider,
  DarkTheme
} from 'react-native-paper';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { RecordSensors } from '../Screens/RecordSensors';
import { RecordingsScreen } from '../Screens/RecordingsScreen';

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
    createBottomTabNavigator(
      {
        Home: RecordSensors,
        Recordings: RecordingsScreen,
      },
      {
        defaultNavigationOptions: ({ navigation }) => ({
          tabBarIcon: ({ focused, horizontal, tintColor }) => {
            const { routeName } = navigation.state;
            let IconComponent = MaterialCommunityIcons;
            let iconName;
            if (routeName === 'Home') {
              iconName = "home";
            } else if (routeName === 'Recordings') {
              iconName = `folder`;
            }
            // You can return any component that you like here!
            return <IconComponent name={iconName} size={25} color={tintColor} />;
          },
        }),
        tabBarOptions: {
          activeTintColor: theme.colors.accent,
          inactiveTintColor: 'gray',
        },
      }
    )
  );

  return (
    <PaperProvider theme={theme}>
      <Navigation theme="dark" />
    </PaperProvider>
  )
}

export default TabNavigation;