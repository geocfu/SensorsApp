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

  const [uploadButtonText, setUploadButtonText] = useState("Upload Recordings");
  const [uploadButtonIcon, setUploadButtonIcon] = useState("file-upload");
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [modalText, setModalText] = useState("Recordings");
  const [uuid, setUuid] = useState(null);

  const [numberOfRecordings, setNumberOfRecordings] = useState(0);
  const [numberOfUploads, setNumberOfUploads] = useState(0);

  const { colors } = props.theme;

  useEffect(() => {
    readUuidFromStorage()
  }, []);

  //Custom styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      marginTop: 10,
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
  }

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
  }

  const initiateUploading = () => {
    if (uuid) {
      //already exists
      //move on uploading
      scanFileDirectoryStructure();
    }
  }

  const scanFileDirectoryStructure = () => {
    RNFetchBlob.fs.lstat(RNFetchBlob.fs.dirs.DownloadDir + "/sensorsApp/")
      .then(
        (stats) => {
          if (stats.length > 0) {
            writeUuidToStorage(generateUuid());
            stats.forEach((value, index) => {
              uploadRecording(value.path);
            });
          } else {
            console.log("folder is empty")
            //snackbar to inform for folder emptinnes
          }
        }
      )
      .catch(
        (err) => {
          //raise a warning dialog
          console.log(err)
        }
      )
  }

  const uploadRecording = (pathToFile) => {
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
      .then((res) => {
        console.log(res.text())
      })
      .catch((err) => {
        console.log(err)
      })
  }

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
          <CustomListSection
            title={modalText}
            numberOfRecordings={numberOfRecordings}
            numberOfUploads={numberOfUploads} />
          <Button
            style={styles.button}
            icon={uploadButtonIcon}
            mode="contained"
            onPress={() => { initiateUploading() }}>
            {uploadButtonText}
          </Button>
          <Button
            style={styles.button}
            icon="delete"
            mode="contained"
            onPress={() => { AsyncStorage.clear().then(); setUuid(null) }}>
            Clear AsyncStorage
          </Button>
          <CustomModal isVisible={modalIsVisible} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default withTheme(Recordings);