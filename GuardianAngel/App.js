import React from 'react';
import { StyleSheet, Text, View, Slider, TimerMixin } from 'react-native';
import Amplify, { PubSub, Auth } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';

Amplify.configure({
	Auth: {
		identityPoolId: 'eu-west-1:1a960834-5dba-4133-9e79-28ec53c7327e',
		region: 'eu-west-1',
		mandatorySignIn: false,
	}
});


Auth.currentCredentials().then((info) => {
      console.log(info);
      const cognitoIdentityId = info._identityId;
});

Auth.currentUserInfo().then((info) => {
	console.log(info);
});


Amplify.addPluggable(new AWSIoTProvider({
     aws_pubsub_region: 'eu-west-1',
     aws_pubsub_endpoint: 'wss://a2wo5aphjz787n-ats.iot.eu-west-1.amazonaws.com/mqtt'
}));



export default class App extends React.Component {
  state = {
    value: 0.2
  };
  componentDidMount() {
	  let timer = setInterval(this.tick, 1000);
	  this.setState({timer});
  }
  componentWillUnmount() {
	  this.clearInterval(this.state.timer);
  }
  tick = () => {
    value = this.state.value
    message = {
	    PatientId: "test",
	    DeviceId: "123",
	    Timestamp: new Date(),
	    Value: value,
	    Type: "sugar",
	    Unit: "sugar",
	    GeoData: "none",
    }
    PubSub.publish('slider', message );
  }
  render() {
    return (
      <View style={styles.container}>
        <Text>Hello, Open up App.js to start working on your app!</Text>
	<Slider
	        value={this.state.value}
		style={{width: 200, height: 40}}
		minimumValue={0}
		maximumValue={1}
		minimumTrackTintColor="#FFFFFF"
		maximumTrackTintColor="#000000"
	        onValueChange={value => this.setState({ value })}
	      />
      </View>
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
});
