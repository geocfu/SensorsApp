import React, { useState } from "react";

import { StyleSheet, View } from "react-native";
import {
  Title,
  Paragraph,
  RadioButton,
  withTheme,
} from 'react-native-paper';
import {
  materialColors,
  material,
  systemWeights
} from 'react-native-typography';

const CustomActivity = props => {

  const [activity, setActivity] = useState("walk")

  //Custom styles
  const styles = StyleSheet.create({
    title: {
      ...material.subheading,
      ...systemWeights.semibold,
      color: materialColors.whiteSecondary,
    },
    activity: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
  });

  return (
    <View>
      <Title style={styles.title}>
        Select Activity
      </Title>
      <RadioButton.Group
        onValueChange={value => {
          setActivity(value);
          props.value(value);
        }}
        value={activity}>
        <View style={styles.activity}>
          <RadioButton
            value="walk"
            disabled={props.isDisabled} />
          <Paragraph>Walking</Paragraph>
        </View>
        <View style={styles.activity}>
          <RadioButton
            value="run"
            disabled={props.isDisabled} />
          <Paragraph>Running</Paragraph>
        </View>
        <View style={styles.activity}>
          <RadioButton
            value="bicycling"
            disabled={props.isDisabled} />
          <Paragraph>Cycling</Paragraph>
        </View>
        <View style={styles.activity}>
          <RadioButton
            value="motorbikeRide"
            disabled={props.isDisabled} />
          <Paragraph>Motorbike ride</Paragraph>
        </View>
        <View style={styles.activity}>
          <RadioButton
            value="carRide"
            disabled={props.isDisabled} />
          <Paragraph>Car ride</Paragraph>
        </View>
        <View style={styles.activity}>
          <RadioButton
            value="busRide"
            disabled={props.isDisabled} />
          <Paragraph>Bus ride</Paragraph>
        </View>
        <View style={styles.activity}>
          <RadioButton
            value="trainRide"
            disabled={props.isDisabled} />
          <Paragraph>Train ride</Paragraph>
        </View>
      </RadioButton.Group>
    </View>
  );
}

export default withTheme(CustomActivity);