import React, { useState } from "react";

import {
  List,
  withTheme,
} from 'react-native-paper';

const CustomListSection = props => {

  const {colors} = props.theme;

  return (
    <List.Section>
      <List.Subheader>
        {props.title}
      </List.Subheader>
      <List.Item
        title={props.numberOfRecordings + " recordings found"}
        left={() => <List.Icon color={colors.accent} icon="folder" />}
      />
    </List.Section>
  );
}

export default withTheme(CustomListSection);