import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';

import {
  Button,
  Appbar,
  withTheme,
} from 'react-native-paper';

import {
  accelerometer,
  gyroscope,
  magnetometer,
  setUpdateIntervalForType,
  SensorTypes,
} from "react-native-sensors"
import { takeUntil } from "rxjs/operators";
import { timer } from 'rxjs';

import RNFetchBlob from 'rn-fetch-blob';
import BackgroundJob from 'react-native-background-job';
import RNDisableBatteryOptimizationsAndroid from 'react-native-disable-battery-optimizations-android';

import CustomActivity from "../components/CustomActivity";
import CustomDialog from "../components/CustomDialog";
import CustomModal from "../components/CustomModal";
import CustomSnackbar from "../components/CustomSnackbar";

setUpdateIntervalForType(SensorTypes.accelerometer, 400);
setUpdateIntervalForType(SensorTypes.gyroscope, 400);
setUpdateIntervalForType(SensorTypes.magnetometer, 400);

const everRunningJobKey = "backgroundSensorsJobKey";
var currentAccelerometerX = null;
var currentGyroscopeX = null;
var currentMangetometerX = null;
var pathToWriteSensorsData = "null";


//Recording of the sensors and saving the data
BackgroundJob.register({
  jobKey: everRunningJobKey,
  job: () => {
    accelerometer
      .pipe(takeUntil(timer(5000)))//terminate the current recording after 5secs
      .subscribe(({ x, y, z, timestamp }) => {
        if (x != 0 && x !== currentAccelerometerX) {
          currentAccelerometerX = x;
          //Data to save
          let lineToAppend = '\nA,' + x + ',' + y + ',' + z + ',' + timestamp;
          //Append the data to the file
          RNFetchBlob.fs.appendFile(pathToWriteSensorsData, lineToAppend, 'utf8')
            .then(() => { })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    gyroscope
      .pipe(takeUntil(timer(5000)))
      .subscribe(({ x, y, z, timestamp }) => {
        if (x != 0 && x !== currentGyroscopeX) {
          currentGyroscopeX = x;
          let lineToAppend = '\nG,' + x + ',' + y + ',' + z + ',' + timestamp;
          RNFetchBlob.fs.appendFile(pathToWriteSensorsData, lineToAppend, 'utf8')
            .then(() => { })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    magnetometer
      .pipe(takeUntil(timer(5000)))
      .subscribe(({ x, y, z, timestamp }) => {
        if (x != 0 && x !== currentMangetometerX) {
          currentMangetometerX = x;
          let lineToAppend = '\nM,' + x + ',' + y + ',' + z + ',' + timestamp;
          RNFetchBlob.fs.appendFile(pathToWriteSensorsData, lineToAppend, 'utf8')
            .then(() => { })
            .catch((err) => {
              console.log(err);
            });
        }
      });
  }
});

const Home = props => {

  //Initial app layout
  const [recordButtonText, setRecordButtonText] = useState("Start Recording");
  const [isRecording, setIsRecording] = useState(false);
  const [activityIsDisabled, setActivityIsDisabled] = useState(false);
  const [activity, setActivity] = useState("walk");
  const [snackbarIsVisible, setSnackbarIsVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [dialogIsVisible, setDialogIsVisible] = useState(false);
  const [dialogText, setDialogText] = useState("");
  const [modalIsVisible, setModalIsVisible] = useState(false);

  useEffect(() => {
    requestStoragePermission();
    buildFileDirectoryStructure();
  }, [isRecording]);

  //Custom styles
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
    button: {
      marginTop: 30,
      marginBottom: 10,
    },
  });

  const requestStoragePermission = () => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
      .then(() => { })
      .catch((err) => {
        console.log(err);
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
      });
  }

  const startRecording = () => {
    //A recording is already taking place, so, we stop it gracefully
    if (isRecording) {
      BackgroundJob.cancel({ jobKey: everRunningJobKey });

      //Display an indicator while the recording is being stopped
      setModalIsVisible(true);
      //Catch special occasion where user started the recording and stopped it immediately
      setSnackbarIsVisible(false);

      //We must wait for a bit in order to allow the background js thread to stop
      setTimeout(() => {
        //Return to the initial state
        setIsRecording(false);
        setRecordButtonText("Start Recording")

        setSnackbarIsVisible(true);
        setSnackbarText("The recording has stopped.")

        setActivityIsDisabled(false);
        setModalIsVisible(false);
      }, 4000);
      return;
    }
    //ensure that the structure hierarchy is present
    buildFileDirectoryStructure();

    //No recording is taking place currently, so, we start to record
    //
    //Check if storage permission has been granted, if not, redirect accordingly
    PermissionsAndroid
      .check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
      .then(result => {
        if (result) {
          //Check if app is allowed to run in the background, if not, redirect accordingly
          BackgroundJob.isAppIgnoringBatteryOptimization(
            (error, ignoringOptimization) => {
              if (ignoringOptimization) {
                setIsRecording(true);
                //ensure that the structure hierarchy is present
                //buildFileDirectoryStructure();

                //Create the name of the file that will be used to save this recording's data
                // File name structure: date - activity . txt
                let pathToWrite =
                  RNFetchBlob.fs.dirs.DownloadDir +
                  "/sensorsApp/" +
                  new Date().toISOString().substring(0, 19).replace(/[^0-9\.]+/g, "") +
                  "-" +
                  activity +
                  ".txt";

                //Create the csv file structure
                let activityToAppendOnBegginingOfFile = "sensor,x,y,z,timestamp";

                //Create the file
                RNFetchBlob.fs.createFile(
                  pathToWrite, activityToAppendOnBegginingOfFile, 'utf8'
                );

                //Pass the location of the file to the background js thread
                pathToWriteSensorsData = pathToWrite;

                //Start the background js thread
                //The thread will start as soon as the app is in the background.
                //If the user will return to the app, the background engine will autopause
                BackgroundJob.schedule({
                  jobKey: everRunningJobKey,
                  period: 5000,
                  exact: true,
                  allowWhileIdle: true,
                  notificationTitle: "sensorsApp",
                  notificationText: "Recording",
                });

                //Change the layout so that the user can understand if a recording is taking place
                //setIsRecording(true);
                setRecordButtonText("Stop Recording");
                setSnackbarIsVisible(true);
                setSnackbarText("The recording has started.")
                setActivityIsDisabled(true);
              } else {
                //App is not yet allowed to run in the background; prompt the user
                RNDisableBatteryOptimizationsAndroid.openBatteryModal();
              }
            }
          );
        } else {
          //No storage permission has been granted; prompt the user
          setDialogText("This app cannot function properly " +
            "if it does not have propper storage permissions. " +
            "Please, manually allow the storage permission and retry.");
          setDialogIsVisible(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
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
          <CustomActivity
            value={value => { setActivity(value) }}
            isDisabled={activityIsDisabled} />
          <Button
            style={styles.button}
            mode="contained"
            onPress={() => startRecording()}>
            {recordButtonText}
          </Button>
          <CustomDialog
            isVisible={dialogIsVisible}
            onClose={value => { setDialogIsVisible(value) }}
            title="Error"
            text={dialogText} />
          <CustomModal isVisible={modalIsVisible} />
        </View>
      </ScrollView>
      <CustomSnackbar
        isVisible={snackbarIsVisible}
        onClose={value => { setSnackbarIsVisible(value) }}
        text={snackbarText} />
    </SafeAreaView>
  );
}

export default withTheme(Home);