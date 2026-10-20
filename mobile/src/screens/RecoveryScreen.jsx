import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import {pickBackupFile} from '../game/backup';
import {notify,confirm} from '../utils/notify';
import {colors,card} from '../theme';
export default function RecoveryScreen() {
  const {importState,resetAll}=useGame();
  const [busy,setBusy]=useState(false);
  async function recover(){
    setBusy(true);
    try{
      const restored=await pickBackupFile();
      if(!restored)return;
      confirm('Mentés visszaállítása',
        'A sérült helyi tárolót a kiválasztott mentés váltja fel. Folytatod?',
        ()=>importState(restored));
    }catch(e){notify('Nem sikerült a visszaállítás',e.message);}
    finally{setBusy(false);}
  }
  return <View style={styles.root}>
    <View style={[card,styles.box]}>
      <Text style={styles.tag}>EDZI / DATA RECOVERY</Text>
      <Text style={styles.title}>A mentésed nem olvasható.</Text>
      <Text style={styles.note}>Az alkalmazás leállította az automatikus írást, hogy a sérült tárolót ne írja felül üres adatokkal.</Text>
      <Pressable disabled={busy} onPress={recover} style={styles.primary}>
        <Text style={styles.primaryText}>Korábbi JSON-mentés visszaállítása</Text>
      </Pressable>
      <Pressable onPress={()=>confirm('Minden helyi adat törlése',
        'A sérült helyi adatokat végleg felülírod, és nulláról kezdesz. Ez nem visszavonható. Biztos?',
        resetAll)} style={styles.secondary}><Text style={styles.secondaryText}>Újrakezdés (adatok törlése)</Text></Pressable>
      <Text style={styles.foot}>Felhőből visszaállításhoz előbb helyre kell állítani az alkalmazást, majd a Karakter menüben bejelentkezni.</Text>
    </View>
  </View>;
}
const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.bg,justifyContent:'center',padding:18},
  box:{gap:17,padding:23,borderColor:colors.gold},
  tag:{fontSize:10,color:colors.gold,fontWeight:'900',letterSpacing:2},
  title:{fontSize:26,fontWeight:'900',color:colors.text},
  note:{color:colors.textSoft,fontSize:14,lineHeight:22},
  primary:{backgroundColor:colors.primary,minHeight:51,borderRadius:14,alignItems:'center',justifyContent:'center'},
  primaryText:{color:'white',fontWeight:'900',fontSize:12},
  secondary:{borderWidth:1,borderColor:colors.red,minHeight:49,borderRadius:14,alignItems:'center',justifyContent:'center'},
  secondaryText:{color:colors.red,fontWeight:'800',fontSize:12},
  foot:{fontSize:11,color:colors.textMuted,lineHeight:18}
});
