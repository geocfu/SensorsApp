import React, { useState } from "react";

import { View } from "react-native";
import {
  Portal,
  Modal,
  Title,
  Text,
  ActivityIndicator,
  withTheme,
} from 'react-native-paper';

const CustomModal = props => {

  return (
    <View>
      <Portal>
        <Modal
          visible={props.isVisible}
          dismissable={false}>
          <Title
            style={{ textAlign: "center" }}>
            {props.title}
            {"\n"}
          </Title>
          <ActivityIndicator
            animating={true}
            size="large" />
        </Modal>
      </Portal>
    </View>
  );
}

export default withTheme(CustomModal);