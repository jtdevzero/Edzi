import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import Svg,{Path,Circle,Rect,Line} from 'react-native-svg';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import LogScreen from '../screens/LogScreen';
import QuestsScreen from '../screens/QuestsScreen';
import CharacterScreen from '../screens/CharacterScreen';
import StatsScreen from '../screens/StatsScreen';
import {colors} from '../theme';
import {MythicIcon} from '../components/MythicIcon';
const Tab=createBottomTabNavigator();
function Icon({name,focused}){
  const selected=focused?colors.gold:'#93A4AA';
  if(name==='Log')return <View style={[styles.central,focused&&styles.centralFocused]}>
    <MythicIcon name="energy" size={26} color="#111B21"/></View>;
  return <View style={[styles.iconBox,focused&&styles.iconFocused]}>
    {focused&&<View style={styles.activeDot}/>}
    <MythicIcon name={name==='Dashboard'?'shield':name==='Quests'?'quest':name==='Stats'?'stats':'armor'} size={25} color={selected}/>
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
    tabBarStyle:{position:'absolute',left:10,right:10,bottom:9,height:73,paddingTop:8,
      paddingBottom:8,backgroundColor:'#0D171D',borderWidth:1,borderColor:'#456068',
      borderRadius:24,shadowColor:'#000',shadowOpacity:.65,shadowRadius:20,elevation:18},
    tabBarActiveTintColor:colors.gold,tabBarInactiveTintColor:'#9CAEB5',
    tabBarLabelStyle:{fontSize:9,fontWeight:'900',letterSpacing:.1,marginTop:1},
    tabBarItemStyle:{minHeight:54}
  }}>
    {screens.map(([name,label,component])=><Tab.Screen key={name} name={name} component={component}
      options={{tabBarLabel:label,tabBarIcon:({focused})=><Icon name={name} focused={focused}/>}}/>)}
  </Tab.Navigator>;
}
const styles=StyleSheet.create({
  central:{width:46,height:46,borderRadius:15,backgroundColor:colors.gold,
    alignItems:'center',justifyContent:'center',marginTop:-14,borderWidth:2,borderColor:'#E9D5B4',
    shadowColor:colors.gold,shadowOpacity:.23,shadowRadius:12,elevation:7},
  centralFocused:{backgroundColor:'#FFDA98'},
  iconBox:{width:35,height:33,borderRadius:11,alignItems:'center',justifyContent:'center'},
  iconFocused:{backgroundColor:'#233034'},activeDot:{height:2,width:12,position:'absolute',top:-5,
    borderRadius:2,backgroundColor:colors.gold}
});
