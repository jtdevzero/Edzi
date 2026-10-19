import React,{useEffect,useState} from 'react';
import {Platform,View,Text,StyleSheet} from 'react-native';
import {colors} from '../theme';
export default function OfflineStatus() {
  const [offline,setOffline]=useState(false);
  useEffect(()=>{
    if(Platform.OS!=='web'||typeof window==='undefined')return;
    const sync=()=>setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online',sync);
    window.addEventListener('offline',sync);
    return ()=>{window.removeEventListener('online',sync);window.removeEventListener('offline',sync);};
  },[]);
  return offline?<View pointerEvents="none" style={styles.banner} accessibilityRole="alert">
    <Text style={styles.text}>◇  OFFLINE MÓD · A helyben mentett adataid elérhetők</Text>
  </View>:null;
}
const styles=StyleSheet.create({
  banner:{position:'absolute',bottom:77,left:15,right:15,borderRadius:12,paddingVertical:10,
    paddingHorizontal:12,backgroundColor:'#2F253F',borderWidth:1,borderColor:colors.gold,zIndex:140,elevation:20},
  text:{color:colors.gold,fontWeight:'800',fontSize:11,textAlign:'center'}
});
