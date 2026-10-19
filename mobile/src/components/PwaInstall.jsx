import React,{useEffect,useState} from 'react';
import {Platform,View,Text,Pressable,StyleSheet} from 'react-native';
import {colors,card} from '../theme';
export default function PwaInstall(){
  const [prompt,setPrompt]=useState(null);
  const [installed,setInstalled]=useState(false);
  useEffect(()=>{
    if(Platform.OS!=='web'||typeof window==='undefined')return;
    const isStandalone=()=>window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone;
    setInstalled(!!isStandalone());
    const ready=e=>{e.preventDefault();setPrompt(e);};
    const done=()=>{setInstalled(true);setPrompt(null);};
    window.addEventListener('beforeinstallprompt',ready);
    window.addEventListener('appinstalled',done);
    return ()=>{window.removeEventListener('beforeinstallprompt',ready);window.removeEventListener('appinstalled',done);};
  },[]);
  if(Platform.OS!=='web'||installed)return null;
  return <View style={[card,styles.box]}>
    <Text style={styles.eyebrow}>◈  TAKE EDZI WITH YOU</Text>
    <Text style={styles.title}>Telepítés a telefonodra</Text>
    <Text style={styles.copy}>Gyors indítás a főképernyőről. A jelenlegi adataid továbbra is helyben maradnak.</Text>
    {prompt?<Pressable style={styles.button} onPress={async()=>{
      await prompt.prompt();const choice=await prompt.userChoice;
      if(choice?.outcome==='accepted')setInstalled(true);
      setPrompt(null);
    }}><Text style={styles.buttonText}>Edzi telepítése ↗</Text></Pressable>:
      <Text style={styles.hint}>iPhone Safari: Megosztás → Főképernyőhöz adás. Androidon: böngészőmenü → Telepítés.</Text>}
  </View>;
}
const styles=StyleSheet.create({
  box:{gap:8,borderColor:'#4B4F87'},
  eyebrow:{fontWeight:'900',fontSize:10,letterSpacing:1.8,color:colors.cyan},
  title:{color:colors.text,fontWeight:'900',fontSize:16},copy:{color:colors.textMuted,fontSize:12,lineHeight:18},
  button:{backgroundColor:colors.primary,borderRadius:13,height:48,alignItems:'center',justifyContent:'center'},
  buttonText:{color:'white',fontWeight:'900'},hint:{color:colors.gold,fontSize:11,lineHeight:18}
});
