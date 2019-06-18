import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Slider,
  TimerMixin,
  Button,
  KeyboardAvoidingView,
  TextInput,
  AsyncStorage,
  Alert,
} from 'react-native';
import {configData} from './../gaconfig';
import Amplify, {PubSub, Auth, Storage} from 'aws-amplify';
import {AWSIoTProvider} from '@aws-amplify/pubsub/lib/Providers';

export default class HomeScreen extends React.Component {
  state = {
    value: 0,
    needsSettings: false,
    userShow: false,
    serverSettings: {
      idPool: null,
      pubsub: null,
      region: 'us-east-1',
      bucket: null,
    },
    id: null,
    phone: null,
    name: null,
    drphone: null,
    dr: null,
  };
  constructor(props) {
    super(props);
    this.saveUser = this.saveUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async getServerSettings() {
    var tempvals = {};
    var needs = false;
    for (var key in this.state.serverSettings) {
      try {
        await AsyncStorage.getItem('@GuardianAngel:' + key).then(value => {
          tempvals[key] = value;
          if (value === null) {
            needs = true;
          }
        });
      } catch (error) {
        console.log('Error retrieving data' + error);
      }
    }
    this.setState({needsSettings: needs});
    return this.setState({serverSettings: tempvals});
  }

  async awsBootstrap() {
    Amplify.configure({
      Auth: {
        identityPoolId: this.state.serverSettings.idPool,
        region: this.state.serverSettings.region,
        mandatorySignIn: false,
      },
      Storage: {
        AWSS3: {
          bucket: this.state.serverSettings.bucket,
          //region: this.state.serverSettings.region,
        },
      },
    });

    await Auth.currentCredentials().then(info => {
      this.setState({id: info._identityId});
    });

    Amplify.addPluggable(
      new AWSIoTProvider({
        aws_pubsub_region: this.state.serverSettings.region,
        aws_pubsub_endpoint: this.state.serverSettings.pubsub,
      }),
    );
    this.getUser();
  }

  async componentDidMount() {
    await this.checkSettings();
  }
  async checkSettings() {
    await this.getServerSettings().then(() => {
      if (!this.state.needsSettings) {
        this.awsBootstrap();
      }
      let timer = setInterval(this.tick, 1000);
      this.setState({timer})
    });
  }

  componentWillUnmount() {
    this.clearInterval(this.state.timer);
  }
  tick = () => {
    value = this.state.value;
    message = {
      PatientId: this.state.id,
      Timestamp: new Date(),
      Value: value,
      Type: 'sugar',
      Unit: 'sugar',
      GeoData: 'none',
    };
    PubSub.publish('slider', message);
  };
  static navigationOptions = {
    title: 'Guardian Angel',
  };

  handleChange(value) {
    this.setState(value);
  }
  getUser() {
    Storage.get('config.json', {level: 'private'})
      .then(result =>
        fetch(result)
          .then(response => response.json())
          .then(responseJson => {
            this.setState({name: responseJson.Name});
            this.setState({phone: responseJson['Patient#']});
            this.setState({drname: responseJson.Doctor});
            this.setState({drphone: responseJson['Doctor#']});
          })
          .catch(err => console.log(err)),
      )
      .catch(err => console.log(err));
  }
  saveUser() {
    var config = {
      Name: this.state.name,
      Doctor: this.state.drname,
      'Patient#': this.state.phone,
      'Doctor#': this.state.drphone,
    };
    Storage.put('config.json', JSON.stringify(config), {level: 'private'})
      .then(
        Alert.alert(
          'Settings',
          'Saved',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: true},
        ),
      )
      .catch(err => console.log(err));
  }
  ShowHideComponent = () => {
    if (this.state.userShow == true) {
      this.setState({userShow: false});
    } else {
      this.setState({userShow: true});
    }
  };

  render() {
    this.props.navigation.addListener('willFocus', payload => {
      this.checkSettings();
    });
    const {navigate} = this.props.navigation;
    if (this.state.needsSettings) {
      return (
        <View style={styles.container}>
          <Text>You need to set the application Server Settings first</Text>

          <Button
            title="Server Settings"
            onPress={() => navigate('ServerSettings')}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <React.Fragment>
            <Text>Move the slider to simulate changes in glucose level</Text>
            <Slider
              value={this.state.value}
              style={{width: 200, height: 40}}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              onValueChange={value => this.setState({value})}
            />
          </React.Fragment>
          <View style={styles.controlButton}>
            <Button title="User Settings" onPress={this.ShowHideComponent} />
          </View>
          {this.state.userShow ? (
            <React.Fragment>
              <View>
                <Text>User Settings</Text>
              </View>

              <KeyboardAvoidingView style={styles.container} behavior="padding">
                <Text style={styles.formLabel}>Name</Text>
                <TextInput
                  selectTextOnFocus={true}
                  style={styles.formInput}
                  value={this.state.name}
                  onChangeText={value => this.handleChange({name: value})}
                />
                <Text style={styles.formLabel}>Phone Number</Text>
                <TextInput
                  selectTextOnFocus={true}
                  style={styles.formInput}
                  value={this.state.phone}
                  onChangeText={value => this.handleChange({phone: value})}
                />
                <Text style={styles.formLabel}>Doctor Name</Text>
                <TextInput
                  selectTextOnFocus={true}
                  style={styles.formInput}
                  value={this.state.drname}
                  onChangeText={value => this.handleChange({drname: value})}
                />
                <Text style={styles.formLabel}>Dr Phone</Text>
                <TextInput
                  selectTextOnFocus={true}
                  style={styles.formInput}
                  value={this.state.drphone}
                  onChangeText={value => this.handleChange({drphone: value})}
                />
                <View style={styles.controlButton}>
                  <Button title="Save" onPress={() => this.saveUser()} />
                </View>
              </KeyboardAvoidingView>
            </React.Fragment>
          ) : null}
          <View style={styles.controlButton}>
            <Button
              title="Server Settings"
              onPress={() => navigate('ServerSettings')}
            />
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    padding: 10,
  },
  formInput: {
    padding: 10,
    height: 50,
    borderWidth: 1,
    borderColor: '#808080',
    borderRadius: 5,
  },
  formLabel: {
    padding: 5,
  },
});
