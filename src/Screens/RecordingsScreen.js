import React, {Component} from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  StatusBar,
} from 'react-native';

import {
  Avatar,
  Button,
  Card,
  Title,
  Paragraph,
  Snackbar,
  Appbar,
  RadioButton,
  Dialog,
  Portal,
  ActivityIndicator,
  Modal,
} from 'react-native-paper';
import {
  materialColors,
  material,
  systemWeights
} from 'react-native-typography';

import RNFetchBlob from 'rn-fetch-blob';


export class RecordingsScreen extends Component {
  constructor(props) {
    super(props);
    
  }
  
  //Custom styles
  
  render() {
    return (
      <SafeAreaView
        style={styles.container}>
        <StatusBar
          backgroundColor="#6979D1"
          barStyle="light-content" />
        <Appbar.Header>
          <Appbar.Content
            title="SensorsApp"
            subtitle="Record your activities"
          />
        </Appbar.Header>
        <ScrollView
          showsVerticalScrollIndicator={false}>
          <View
            style={styles.content}>

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  title: {
    ...material.subheading,
    ...systemWeights.semibold,
    color: materialColors.whiteSecondary,
  },
  card: {
    marginTop: 2,
    marginBottom: 2,
  },
  button: {
    marginTop: 30,
    marginBottom: 10,
  },
  surface: {
    elevation: 6,
  },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalText: {
    textAlign: 'center',
  }
});