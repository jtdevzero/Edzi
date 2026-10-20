import React from 'react';
import { View, Text } from 'react-native';
import Svg, {Path, Circle, Rect, Line} from 'react-native-svg';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import LogScreen from '../screens/LogScreen';
import QuestsScreen from '../screens/QuestsScreen';
import CharacterScreen from '../screens/CharacterScreen';
import StatsScreen from '../screens/StatsScreen';
import {colors} from '../theme';
const Tab=createBottomTabNavigator();
function Icon({name,focused}){
  const selected=focused?colors.gold:colors.textMuted;
  if(name==='Log')return <View style={{width:46,height:46,borderRadius:15,backgroundColor:colors.primary,
    borderWidth:1,borderColor:'#B2A7FF',alignItems:'center',justifyContent:'center',marginTop:-9}}>
    <Svg width={24} height={24} viewBox="0 0 24 24"><Path d="M12 5 V19 M5 12 H19" stroke="white" strokeWidth="2.6" strokeLinecap="round"/></Svg>
  </View>;
  return <View style={{height:32,width:36,alignItems:'center',justifyContent:'center',
    backgroundColor:focused?'#1E2843':'transparent',borderRadius:12}}>
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={selected} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {name==='Dashboard'?<><Path d="M3 10.4 L12 3 L21 10.4 V21 H14.8 V14.8 H9.2 V21 H3 Z"/></>:
       name==='Quests'?<><Path d="M12 2 L17 9.1 L22 12 L17 14.9 L12 22 L7 14.9 L2 12 L7 9.1 Z"/><Circle cx="12" cy="12" r="2.3"/></>:
       name==='Stats'?<><Rect x="3" y="11" width="4" height="10" rx="1"/><Rect x="10" y="6" width="4" height="15" rx="1"/><Rect x="17" y="2.5" width="4" height="18.5" rx="1"/></>:
       <><Path d="M12 2 L19.5 5 V11.5 C19.5 16.2 16.3 19.4 12 22 C7.7 19.4 4.5 16.2 4.5 11.5 V5 Z"/><Path d="M9 12 L11 14 L15.5 9.5"/></>}
    </Svg>
  </View>;
}
export default function TabNavigator(){
  const screens=[
    ['Dashboard','Főoldal',DashboardScreen],
    ['Log','Naplózás',LogScreen],
    ['Quests','Questek',QuestsScreen],
    ['Stats','Statisztika',StatsScreen],
    ['Character','Karakter',CharacterScreen]
  ];
  return <Tab.Navigator screenOptions={{
    headerShown:false,tabBarHideOnKeyboard:true,
    tabBarStyle:{backgroundColor:colors.surface,borderTopWidth:1,borderTopColor:'#39415C',
      height:75,paddingTop:10,paddingBottom:8,shadowColor:'#000',shadowOpacity:.45,shadowRadius:24,elevation:12},
    tabBarActiveTintColor:colors.gold,tabBarInactiveTintColor:colors.textMuted,
    tabBarLabelStyle:{fontSize:10,fontWeight:'800',letterSpacing:.1,marginTop:3},
    tabBarItemStyle:{minHeight:50}
  }}>
    {screens.map(([name,label,component])=><Tab.Screen key={name} name={name} component={component}
      options={{tabBarLabel:label,tabBarIcon:({focused})=><Icon name={name} focused={focused}/>}}/>)}
  </Tab.Navigator>;
}
