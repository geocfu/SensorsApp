import React, { useState } from "react";

import { View } from "react-native";
import {
  Portal,
  Dialog,
  Paragraph,
  Button,
  withTheme,
} from 'react-native-paper';

const CustomDialog = props => {
  return (
    <View>
      <Portal>
        <Dialog
          visible={props.isVisible}
          onDismiss={() => { props.onClose(false) }}>
          <Dialog.Title>{props.title}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              {props.text}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => { props.onClose(false) }}
              >
              Ok
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

export default withTheme(CustomDialog);