import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  StatusBar,
} from 'react-native';

import {
  Button,
  Appbar,
  ProgressBar,
  withTheme,
} from 'react-native-paper';

import RNFetchBlob from 'rn-fetch-blob';
import AsyncStorage from '@react-native-community/async-storage';

import APIKey from "../env";

import CustomDialog from "../components/CustomDialog";
import CustomModal from "../components/CustomModal";
import CustomListSection from "../components/CustomListSection";
import CustomSnackbar from "../components/CustomSnackbar";

const Recordings = props => {

  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [snackbarIsVisible, setSnackbarIsVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [uuid, setUuid] = useState(null);

  const { colors } = props.theme;

  useEffect(() => {
    buildFileDirectoryStructure();
    readUuidFromStorage();
  }, []);

  const halfHeight = "50%"

  //Custom styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      marginTop: halfHeight,
      marginBottom: 10,
      marginLeft: 10,
      marginRight: 10,
    },
    button: {
      marginTop: 30,
      marginBottom: 10,
    },
  });

  const readUuidFromStorage = () => {
    AsyncStorage.getItem("@uuid")
      .then(value => {
        if (value) {
          setUuid(value);
        } else {
          writeUuidToStorage(generateUuid());
        }
      });
  };

  const writeUuidToStorage = newUuid => {
    AsyncStorage.setItem("@uuid", newUuid)
      .then(() => {
        setUuid(newUuid)
      });
  };

  const generateUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const buildFileDirectoryStructure = () => {
    RNFetchBlob.fs.isDir(RNFetchBlob.fs.dirs.DownloadDir + "/sensorsApp/")
      .then((isDir) => {
        if (isDir) {
          return;
        }
        RNFetchBlob.fs.mkdir(RNFetchBlob.fs.dirs.DownloadDir + "/sensorsApp/")
          .then(() => { })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      })
  };

  const initiateUploading = () => {
    if (uuid) {
      scanAndUploadFileDirectoryStructure();
    }
  };

  const scanAndUploadFileDirectoryStructure = () => {
    RNFetchBlob.fs.lstat(RNFetchBlob.fs.dirs.DownloadDir + "/sensorsApp/")
      .then(
        (stats) => {
          if (stats.length > 0) {
            setModalIsVisible(true);
            stats.forEach((value, index) => {
              uploadRecording(value.path, index, stats.length);
            });
          } else {
            setSnackbarText("No recordings found.")
            setSnackbarIsVisible(true);
          }
        }
      )
      .catch(
        (err) => {
          //raise a warning dialog
          console.log(err)
        }
      )
  };

  const uploadRecording = (pathToFile, index, length) => {
    RNFetchBlob.fetch('POST', 'https://content.dropboxapi.com/2/files/upload', {
      //add the token to an env file 
      Authorization: "Bearer " + APIKey,
      'Dropbox-API-Arg': JSON.stringify({
        path: "/sensorsApp/" + uuid + "/" + pathToFile.slice(pathToFile.lastIndexOf("/") + 1),
        mode: "add",
        autorename: true,
        mute: false,
        //needs confirmation
        strict_conflict: true,
      }),
      'Content-Type': "application/octet-stream",
    }, RNFetchBlob.wrap(pathToFile))
      .then(() => {
        if (index + 1 == length) {
          setModalIsVisible(false);
        }
        RNFetchBlob.fs.unlink(pathToFile)
          .then(() => { })
          .catch((err) => { })
      })
      .catch((err) => {
        console.log(err)
      })
  };

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
        contentInsetAdjustmentBehavior="automatic">
        <View
          style={styles.content}>
          <Button
            style={styles.button}
            icon="file-upload"
            mode="contained"
            onPress={() => { initiateUploading() }}>
            Upload Recordings
          </Button>
          <CustomModal
            isVisible={modalIsVisible}
            title="Uploading" />
        </View>
      </ScrollView>
      <CustomSnackbar
        isVisible={snackbarIsVisible}
        onClose={value => { setSnackbarIsVisible(value) }}
        text={snackbarText} />
    </SafeAreaView>
  );
};

export default withTheme(Recordings);