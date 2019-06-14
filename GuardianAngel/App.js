import React from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import HomeScreen from './screens/HomeScreen';
import ServerSettingsScreen from './screens/ServerSettingsScreen';

const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  ServerSettings: {screen: ServerSettingsScreen},
});

const App = createAppContainer(MainNavigator);

export default App;
