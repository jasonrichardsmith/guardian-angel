import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  KeyboardAvoidingView,
  AsyncStorage,
} from 'react-native';

export default class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      idPool: null,
      pubsub: null,
      region: 'us-east-1',
      bucket: null,
      isLoading: true,
    };
    this.handleChange = this.handleChange.bind(this);
    this.saveKeys = this.saveKeys.bind(this);
  }
  async getKeys() {
    for (var key in this.state) {
      try {
        await AsyncStorage.getItem('@GuardianAngel:' + key).then(value => {
          this.setState({[key]: value});
        });
      } catch (error) {
        console.log('Error retrieving data' + error);
      }
    }
  }

  async saveKeys() {
    const entries = Object.entries(this.state);
    for (const [key, val] of entries) {
      if (key != 'isLoading') {
        if (this.validateSettings(key, val)) {
          try {
            await AsyncStorage.setItem('@GuardianAngel:' + key, val);
          } catch (error) {
            console.log('Error saving data' + error);
          }
        } else {
          return;
        }
      }
    }
    Alert.alert(
      'Settings',
      'Saved',
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: true},
    );
  }

  validateSettings(key, val) {
    const regex = {
      region: new RegExp(/^(?:ap|cn|eu|us)-[a-z]*-[0-9]{1}/g),
      idPool: new RegExp(
        /^(?:ap|cn|eu|us)-[a-z]*-[0-9]{1}\:[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/g,
      ),
      pubsub: new RegExp(
        /^[a-z0-9]{14}-ats\.iot\.(?:ap|cn|eu|us)-[a-z]*-[0-9]{1}\.amazonaws.com/g,
      ),
      bucket: new RegExp(
        /(?=^.{3,63}$)(?!^(\d+\.)+\d+$)(^(([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])$)/,
      ),
    };

    res = regex[key].exec(val);
    if (res === null || val === null || res[0] !== val) {
      this.invalidSetting(key, val);
      return false;
    }
    return true;
  }

  invalidSetting(key, value) {
    Alert.alert(
      key,
      value + ' is an inavlid value',
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: true},
    );
  }

  async deleteKeys() {
    const entries = Object.entries(this.state);
    for (const [key, val] of entries) {
      if (key != 'isLoading') {
        try {
          await AsyncStorage.removeItem('@GuardianAngel:' + key);
          obj = {};
          obj[key] = null;
          this.setState(obj);
        } catch (error) {
          console.log('Error clearing data' + error);
        }
      }
    }
  }

  handleChange(value) {
    this.setState(value);
  }
  static navigationOptions = {
    title: 'Guardian Angel Settings',
  };
  async componentDidMount() {
    await this.getKeys();
    this.setState({isLoading: false});
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    }
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <Text style={styles.formLabel}>Region</Text>
        <TextInput
          selectTextOnFocus={true}
          style={styles.formInput}
          value={this.state.region}
          onChangeText={value => this.handleChange({region: value})}
        />
        <Text style={styles.formLabel}>IdPool</Text>
        <TextInput
          selectTextOnFocus={true}
          style={styles.formInput}
          value={this.state.idPool}
          onChangeText={value => this.handleChange({idPool: value})}
        />
        <Text style={styles.formLabel}>PubSub</Text>
        <TextInput
          selectTextOnFocus={true}
          style={styles.formInput}
          value={this.state.pubsub}
          onChangeText={value => this.handleChange({pubsub: value})}
        />
        <Text style={styles.formLabel}>User Bucket</Text>
        <TextInput
          selectTextOnFocus={true}
          style={styles.formInput}
          value={this.state.bucket}
          onChangeText={value => this.handleChange({bucket: value})}
        />
        <View style={styles.controlButton}>
          <Button
            title="Save"
            style={styles.controlButton}
            onPress={() => this.saveKeys()}
          />
        </View>
        <View style={styles.controlButton}>
          <Button title="Clear" onPress={() => this.deleteKeys()} />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formInput: {
    padding: 10,
    height: 50,
    borderWidth: 1,
    borderColor: '#808080',
    borderRadius: 5,
  },
  controlButton: {
    padding: 10,
  },
  formLabel: {
    padding: 5,
  },
});
