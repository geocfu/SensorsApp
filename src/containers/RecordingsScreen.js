import React, { Component } from "react";
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
  Dialog,
  Title,
  Portal,
  ActivityIndicator,
  Paragraph,
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
    this.state = this.getInitialState();
  }

  getInitialState = () => {
    const initialState = {
      uploadButtonIsDissabled: false,
      recordingsInfoText: "Number of files: ",
      totalNumberOfFilesToUpload: 0,
      totalNumberOfFilesUploaded: 0,
      activityIndicatorModalIsVisible: false,
      uploadButtonIsDissabled: false,

    };
    return initialState;
  }

  componentDidMount() {
    //console.log("componentDidMount on RecordingsScreen")
    //this.scanTheDataDir();
  }

  scanTheDataDir() {
    RNFetchBlob.fs.lstat(RNFetchBlob.fs.dirs.DownloadDir + "/sensorsApp/")
      .then(
        (stats) => {
          if (stats.length > 0) {
            this.setState({
              totalNumberOfFilesToUpload: stats.length,
              uploadButtonIsDissabled: true,
              uploadButtonIsDissabled: true,
            });
            stats.forEach((value, index) => {
              this.uploadFile(value.path, index, this.state.totalNumberOfFilesToUpload);
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

  uploadFile(pathToFile, currentIndex) {
    RNFetchBlob.fetch('POST', 'https://content.dropboxapi.com/2/files/upload', {
      //add the token to an env file 
      Authorization: "Bearer VLdlTEdk_2EAAAAAAAAAZNfq1VXNWL98q_jPXFHrFQJJ_4vymJQVogZLiOSDbU-9",
      'Dropbox-API-Arg': JSON.stringify({
        path: '/sensorsApp/' + pathToFile.slice(pathToFile.lastIndexOf("/") + 1),
        mode: 'add',
        autorename: true,
        mute: false,
        //needs confirmation
        strict_conflict: true,
      }),
      'Content-Type': 'application/octet-stream',
    }, RNFetchBlob.wrap(pathToFile))
      .then((res) => {
        this.setState({
          totalNumberOfFilesUploaded: this.state.totalNumberOfFilesUploaded + 1
        })
        //need fixing
        if (currentIndex == this.state.totalNumberOfFilesToUpload - 1) {
          this.setState({
            totalNumberOfFilesToUpload: 0,
            totalNumberOfFilesUploaded: 0,
            uploadButtonIsDissabled: false,
          })
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

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
            <Button
              icon="file-upload"
              mode="contained"
              onPress={() => this.scanTheDataDir()}
              disabled={this.state.uploadButtonIsDissabled}>
              Upload recordings
            </Button>
            <Portal>
              <Dialog
                visible={this.state.uploadDiaologIsVisible}
                onDismiss={() => this.setState({ uploadDiaologIsVisible: false })}>
                <Dialog.Title>Error</Dialog.Title>
                <Dialog.Content>
                  <Paragraph>
                    {"Uploaded: "}
                    {this.state.totalNumberOfFilesUploaded}
                    {" of "}
                    {this.state.totalNumberOfFilesToUpload}
                  </Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    onPress={() => {
                      this.setState({
                        uploadButtonIsDissabled: false
                      })
                    }}>
                    Ok
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
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