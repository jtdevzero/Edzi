import React, {useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Screen from '../components/Screen';
import {CLASSES} from '../game/characters';
import {useGame} from '../game/GameContext';
import {colors,card} from '../theme';
export default function OnboardingScreen(){
  const {createCharacter}=useGame();
  const [name,setName]=useState('');
  const [classId,setClassId]=useState(null);
  const canStart=Boolean(name.trim()&&classId);
  return <Screen title="Ébredj fel, harcos" eyebrow="ASCENSION / ORIGIN STORY"
    subtitle="A következő szinted nem magától jön el.">
    <LinearGradient colors={['#292662','#121B39']} style={s.hero}>
      <Text style={s.eyebrow}>YOUR STORY BEGINS HERE</Text>
      <Text style={s.heroTitle}>LÉGY A SAJÁT TÖRTÉNETED HŐSE.</Text>
      <Text style={s.heroSub}>Valódi edzések. Valódi fejlődés. Minden perc XP-vé válik.</Text>
      <Text style={s.star}>✦</Text>
    </LinearGradient>
    <View style={[card,{gap:10}]}><Text style={s.label}>01  /  KARAKTER NEVE</Text>
      <TextInput style={s.input} placeholder="pl. Jozsi" placeholderTextColor={colors.textMuted}
        maxLength={24} autoCapitalize="words" value={name} onChangeText={setName} accessibilityLabel="Karakter neve"/></View>
    <Text style={s.label}>02  /  VÁLASSZ OSZTÁLYT</Text>
    {CLASSES.map(c=>{
      const chosen=c.id===classId;
      return <Pressable key={c.id} accessibilityRole="radio" accessibilityState={{checked:chosen}}
        onPress={()=>setClassId(c.id)} style={[card,s.classCard,chosen&&{borderColor:c.color,backgroundColor:'#25264B'}]}>
        <View style={[s.avatar,{borderColor:chosen?c.color:colors.cardBorder}]}><Text style={s.emoji}>{c.emoji}</Text></View>
        <View style={{flex:1,gap:4}}><Text style={s.name}>{c.name}{chosen?'  ✓':''}</Text>
          <Text style={s.anime}>{c.anime}</Text><Text style={s.desc}>{c.description}</Text></View>
        <Text style={s.radio}>{chosen?'◉':'○'}</Text>
      </Pressable>;
    })}
    <Pressable disabled={!canStart} onPress={()=>createCharacter(name.trim(),classId)}
      style={[s.button,!canStart&&{opacity:.45}]}>
      <LinearGradient colors={['#815DFF','#4D54E4']} style={s.gradient}>
        <Text style={s.buttonText}>Kaland indítása</Text><Text style={s.arrow}>↗</Text>
      </LinearGradient>
    </Pressable>
    <Text style={s.footer}>A fejlődésed helyben mentődik; később exportálhatod.</Text>
  </Screen>;
}
const s=StyleSheet.create({
  hero:{padding:24,borderRadius:27,borderWidth:1,borderColor:'#5854A5',gap:9,overflow:'hidden'},
  eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:2,color:colors.cyan},
  heroTitle:{fontSize:25,lineHeight:30,fontWeight:'900',color:colors.text,letterSpacing:-.5,maxWidth:'90%',marginTop:7},
  heroSub:{fontSize:12,lineHeight:20,color:colors.textSoft,maxWidth:'87%'},
  star:{position:'absolute',top:4,right:16,fontSize:52,color:colors.cyan,opacity:.36},
  label:{fontSize:11,color:colors.cyan,letterSpacing:1.6,fontWeight:'900'},
  input:{backgroundColor:colors.input,borderColor:'#344569',borderWidth:1,borderRadius:13,color:colors.text,height:53,paddingHorizontal:15,fontSize:16},
  classCard:{flexDirection:'row',alignItems:'center',gap:12,padding:13},
  avatar:{width:61,height:61,borderRadius:19,borderWidth:1,backgroundColor:'#101D33',alignItems:'center',justifyContent:'center'},
  emoji:{fontSize:31},name:{color:colors.text,fontSize:16,fontWeight:'900'},anime:{color:colors.primarySoft,fontSize:11,fontWeight:'700'},
  desc:{color:colors.textMuted,fontSize:12,lineHeight:17},radio:{fontSize:23,color:colors.cyan},
  button:{borderRadius:18,overflow:'hidden'},gradient:{height:58,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:19},
  buttonText:{color:'white',fontSize:17,fontWeight:'900'},arrow:{fontSize:25,color:'white'},
  footer:{color:colors.textMuted,fontSize:11,textAlign:'center'}
});
