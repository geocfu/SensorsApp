import React, { useState } from "react";

import { View } from "react-native";
import {
  Snackbar,
  withTheme,
} from 'react-native-paper';

const CustomSnackbar = props => {
  return (
    <View>
      <Snackbar
        visible={props.isVisible}
        onDismiss={() => {
          props.onClose(false);
        }}
        duration={3000}
        action={{
          label: 'Dissmiss',
          onPress: () => {
            props.onClose(false);
          },
        }}>
        {props.text}
      </Snackbar>
    </View>
  );
}

export default withTheme(CustomSnackbar);