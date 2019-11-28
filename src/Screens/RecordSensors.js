import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  PermissionsAndroid,
  StatusBar,
  AppState,
} from 'react-native';
import {
  materialColors,
  material,
  systemWeights
} from 'react-native-typography';
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
import RNFetchBlob from 'rn-fetch-blob';
import {
  accelerometer,
  gyroscope,
  magnetometer,
  setUpdateIntervalForType,
  SensorTypes,
} from "react-native-sensors"
import { takeUntil } from "rxjs/operators";
import { timer } from 'rxjs';
import BackgroundJob from 'react-native-background-job';
import RNDisableBatteryOptimizationsAndroid from 'react-native-disable-battery-optimizations-android';

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
          RNFetchBlob.fs.appendFile(pathToWriteSensorsData, lineToAppend, 'utf8');
        }
      });
    gyroscope
      .pipe(takeUntil(timer(5000)))
      .subscribe(({ x, y, z, timestamp }) => {
        if (x != 0 && x !== currentGyroscopeX) {
          currentGyroscopeX = x;
          let lineToAppend = '\nG,' + x + ',' + y + ',' + z + ',' + timestamp;
          RNFetchBlob.fs.appendFile(pathToWriteSensorsData, lineToAppend, 'utf8');
        }
      });
    magnetometer
      .pipe(takeUntil(timer(5000)))
      .subscribe(({ x, y, z, timestamp }) => {
        if (x != 0 && x !== currentMangetometerX) {
          currentMangetometerX = x;
          let lineToAppend = '\nM,' + x + ',' + y + ',' + z + ',' + timestamp;
          RNFetchBlob.fs.appendFile(pathToWriteSensorsData, lineToAppend, 'utf8');
        }
      });
  }
});

export class RecordSensors extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();

    // Save the data from the sensors every 400ms
    setUpdateIntervalForType(SensorTypes.accelerometer, 400);
    setUpdateIntervalForType(SensorTypes.gyroscope, 400);
    setUpdateIntervalForType(SensorTypes.magnetometer, 400);
  }

  //Initial app layout
  getInitialState = () => {
    const initialState = {
      recording: false,
      sensorIcon: "play-arrow",
      sensorSubtitleText: "Idle",

      snackbarIsVisible: false,
      recordButtonText: "Start Recording",

      activityValue: 'walk',
      activityIsDisabled: false,

      permissionDialogIsVisible: false,
      permissionDialogText: "null",

      activityIndicatorModalIsVisible: false,
    };
    return initialState;
  }

  componentDidMount() {
    this.requestStoragePermission();
  }

  //Get persmission to access devices's storage
  async requestStoragePermission() {
    try {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
    } catch (err) {
      console.warn(err);
    }
  }

  //Create the file structure hierarchy needed for saving the recordings
  buildFileDirectoryStructure() {
    RNFetchBlob.fs.ls(RNFetchBlob.fs.dirs.DownloadDir)
      .then((files) => {
        if (!files.includes("sensorsApp")) {
          RNFetchBlob.fs.mkdir(
            RNFetchBlob.fs.dirs.DownloadDir +
            "/sensorsApp/");
        }
      })
      .catch((err) => {
        console.warn(err);
      });
  }

  //Iniate the recording logic
  startRecording() {
    //A recording is already taking place, so, we stop it gracefully
    if (this.state.recording) {
      //Stop the background job
      BackgroundJob.cancel({ jobKey: everRunningJobKey });

      this.setState({
        //Display an indicator while the recording is being stopped
        activityIndicatorModalIsVisible: true,

        //Catch special occasion where user started the recording and stopped it immediately
        snackbarIsVisible: false,
      });

      //We must wait for a bit in order to allow the background js thread to stop
      setTimeout(() => {
        //Return to the initial state
        this.setState(this.getInitialState());

        //Also, display a snackbar to inform user
        this.setState({
          //hide the previously shown indicator
          activityIndicatorModalIsVisible: false,

          snackbarIsVisible: true,
          snackbarText: "The recording has stopped!",
        });

      }, 4000);
      return;
    }

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

                //ensure that the structure hierarchy is present
                this.buildFileDirectoryStructure();

                //Create the name of the file that will be used to save this recording's data
                // File name structure: date - activity . txt
                let pathToWrite =
                  RNFetchBlob.fs.dirs.DownloadDir +
                  "/sensorsApp/" +
                  new Date().toISOString().substring(0, 19).replace(/[^0-9\.]+/g, "") +
                  "-" +
                  this.state.activityValue +
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
                });

                //Change the layout so that the user can understand if a recording is taking place
                this.setState({
                  recording: true,
                  snackbarIsVisible: true,
                  sensorIcon: "pause",
                  sensorSubtitleText: "Recording",
                  activityIsDisabled: true,
                  recordButtonText: "Stop Recording",
                  snackbarText: "The recording has started!",
                  firstRun: false,
                });
              } else {
                //App is not yet allowed to run in the background; prompt the user
                RNDisableBatteryOptimizationsAndroid.openBatteryModal();
              }
            }
          );
        } else {
          //No storage permission has been granted; prompt the user
          this.setState({
            permissionDialogIsVisible: true,
            permissionDialogText: "This app cannot function properly " +
              "if it does not have propper storage permissions." +
              "Please, manually allow the storage permission and retry.",
          })
        }
      })
      .catch((err) => {
        console.warn(err);
      });
  }
  
  //The actual app
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
            <Title style={styles.title}>
              Sensors
            </Title>
            <Card
              style={styles.surface, styles.card}>
              <Card.Title
                title="Accelerometer"
                subtitle={this.state.sensorSubtitleText}
                left={(props) =>
                  <Avatar.Icon {...props}
                    icon={this.state.sensorIcon} />
                }
              />
            </Card>
            <Card
              style={styles.surface, styles.card}>
              <Card.Title
                title="Gyroscope"
                subtitle={this.state.sensorSubtitleText}
                left={(props) =>
                  <Avatar.Icon {...props}
                    icon={this.state.sensorIcon} />
                }
              />
            </Card>
            <Card
              style={styles.surface, styles.card}>
              <Card.Title
                title="Magnetometer"
                subtitle={this.state.sensorSubtitleText}
                left={(props) =>
                  <Avatar.Icon {...props}
                    icon={this.state.sensorIcon} />
                }
              />
            </Card>
            <Title style={styles.title}>
              Activity
            </Title>
            <RadioButton.Group
              onValueChange={activityValue => this.setState({ activityValue })}
              value={this.state.activityValue}>
              <View style={styles.activity}>
                <RadioButton
                  value="walk"
                  disabled={this.state.activityIsDisabled} />
                <Paragraph>Walk</Paragraph>
              </View>
              <View style={styles.activity}>
                <RadioButton
                  value="run"
                  disabled={this.state.activityIsDisabled} />
                <Paragraph>Run</Paragraph>
              </View>
              <View style={styles.activity}>
                <RadioButton
                  value="bicycling"
                  disabled={this.state.activityIsDisabled} />
                <Paragraph>Bicycling</Paragraph>
              </View>
              <View style={styles.activity}>
                <RadioButton
                  value="motorbikeRide"
                  disabled={this.state.activityIsDisabled} />
                <Paragraph>Motorbike ride</Paragraph>
              </View>
              <View style={styles.activity}>
                <RadioButton
                  value="carRide"
                  disabled={this.state.activityIsDisabled} />
                <Paragraph>Car ride</Paragraph>
              </View>
              <View style={styles.activity}>
                <RadioButton
                  value="busRide"
                  disabled={this.state.activityIsDisabled} />
                <Paragraph>Bus ride</Paragraph>
              </View>
              <View style={styles.activity}>
                <RadioButton
                  value="trainRide"
                  disabled={this.state.activityIsDisabled} />
                <Paragraph>Train ride</Paragraph>
              </View>
            </RadioButton.Group>
            <Button
              style={styles.button}
              mode="contained"
              onPress={() => this.startRecording()}>
              {this.state.recordButtonText}
            </Button>
            <Portal>
              <Dialog
                visible={this.state.permissionDialogIsVisible}
                onDismiss={() => this.setState({ permissionDialogIsVisible: false })}>
                <Dialog.Title>Error</Dialog.Title>
                <Dialog.Content>
                  <Paragraph>
                    {this.state.permissionDialogText}
                  </Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    onPress={() => {
                      this.setState({
                        permissionDialogIsVisible: false
                      })
                    }}>
                    Ok
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
            <Portal>
              <Modal
                visible={this.state.activityIndicatorModalIsVisible}
                dismissable={false}>
                <Title
                  style={styles.modalText}>
                  Please Wait...
                  {"\n"}
                </Title>
                <ActivityIndicator
                  animating={true}
                  size="large" />
              </Modal>
            </Portal>
          </View>
        </ScrollView>
        <Snackbar
          visible={this.state.snackbarIsVisible}
          onDismiss={() => this.setState({ snackbarIsVisible: false })}
          duration={3000}
          action={{
            label: 'Dissmiss',
            onPress: () => {
              this.setState({ snackbarVisible: false })
            },
          }}>
          {this.state.snackbarText}
        </Snackbar>
      </SafeAreaView>
    );
  }
}

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
