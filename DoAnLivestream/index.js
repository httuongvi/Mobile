/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

LogBox.ignoreLogs(['This method is deprecated', 'React Native Firebase']);

AppRegistry.registerComponent(appName, () => App);
