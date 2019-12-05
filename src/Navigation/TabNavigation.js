import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import {
  withTheme
} from 'react-native-paper';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import Home from "../containers/Home";
import Recordings from "../containers/Recordings";

const TabNavigation = props => {

  const { colors } = props.theme;

  const Navigation = createAppContainer(
    createBottomTabNavigator(
      {
        Home: Home,
        Recordings: Recordings,
      },
      {
        // TODO: move icon to a component
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
          activeTintColor: colors.accent,
          inactiveTintColor: 'gray',
        },
      }
    )
  );

  return (
    <Navigation theme="dark" />
  )
}

export default withTheme(TabNavigation);