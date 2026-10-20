import React,{useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Screen from '../components/Screen';
import {CLASSES} from '../game/characters';
import {useGame} from '../game/GameContext';
import ClassArtwork from '../components/ClassArtwork';
import CinematicArt from '../components/CinematicArt';
import {MythicIcon,Sigil} from '../components/MythicIcon';
import {colors,card} from '../theme';
export default function OnboardingScreen(){
  const {createCharacter}=useGame();
  const [name,setName]=useState('');
  const [classId,setClassId]=useState(null);
  const canStart=Boolean(name.trim()&&classId);
  return <Screen title="Ébredj fel, harcos" eyebrow="EDZI NIGHTFALL / ORIGIN PROTOCOL"
    subtitle="Három fejezet. Egy döntés. A fejlődésed most kezdődik.">
    <LinearGradient colors={['#405250','#17252C','#0B151D']} style={s.hero}>
      <View style={s.top}><Text style={s.eyebrow}>CHAPTER 00 / THE AWAKENING</Text>
        <View style={s.sign}><MythicIcon name="star" size={19} color={colors.gold}/></View></View>
      <CinematicArt scene="origin" height={191} style={s.chapterArtwork}/>
      <View style={s.heroArt}><Sigil name="hero" size={69} rarity="legendary"/></View>
      <Text style={s.heroTitle}>LÉGY A SAJÁT TÖRTÉNETED HŐSE.</Text>
      <Text style={s.heroSub}>Valódi edzések. Valódi fejlődés. Minden perc XP-vé válik.</Text>
      <Text style={s.heroIndex}>001 — THE ORIGIN</Text>
    </LinearGradient>
    <View style={[card,s.identity]}>
      <View style={s.chapter}><View style={s.smallIcon}><MythicIcon name="shield" size={22}/></View>
        <View style={{flex:1}}><Text style={s.eyebrow}>CHAPTER 01 / IDENTITY</Text>
          <Text style={s.chapterTitle}>Mi a vadászneved?</Text></View></View>
      <Text style={s.label}>01  /  KARAKTER NEVE</Text>
      <TextInput style={s.input} placeholder="pl. Jozsi" placeholderTextColor={colors.textMuted}
        maxLength={24} autoCapitalize="words" value={name} onChangeText={setName} accessibilityLabel="Karakter neve"/>
    </View>
    <View style={s.chapter}><View style={s.smallIcon}><MythicIcon name="quest" size={22}/></View>
      <View style={{flex:1}}><Text style={s.eyebrow}>CHAPTER 02 / THE PATH</Text>
        <Text style={s.chapterTitle}>Válaszd az utad.</Text>
        <Text style={s.chapterDesc}>Öt egyedi stílus. Ugyanaz a valódi, megdolgozott fejlődés.</Text></View></View>
    <Text style={s.label}>02  /  VÁLASSZ OSZTÁLYT</Text>
    {CLASSES.map((c,i)=>{
      const chosen=c.id===classId;
      return <Pressable key={c.id} accessibilityRole="radio" accessibilityState={{checked:chosen}}
        onPress={()=>setClassId(c.id)} style={[s.classCard,chosen&&{borderColor:colors.gold,backgroundColor:'#23352F'}]}>
        <ClassArtwork classId={c.id} selected={chosen}/>
        <View style={s.classInfo}>
          <Text style={s.classIndex}>CLASS {String(i+1).padStart(2,'0')} / {chosen?'SELECTED':'AVAILABLE'}</Text>
          <Text style={s.name}>{c.name}</Text>
          <Text style={s.anime}>{c.anime}</Text>
          <Text style={s.desc}>{c.description}</Text>
          <View style={s.choice}><MythicIcon name={chosen?'complete':'quest'} size={16}
            color={chosen?colors.gold:colors.textMuted}/>
            <Text style={[s.choiceText,chosen&&{color:colors.gold}]}>
              {chosen?'KIVÁLASZTVA':'OSZTÁLY KIVÁLASZTÁSA'}</Text></View>
        </View>
      </Pressable>;
    })}
    <View style={[card,s.final]}>
      <View style={s.chapter}><View style={s.smallIcon}><MythicIcon name="unlock" size={22}/></View>
        <View style={{flex:1}}><Text style={s.eyebrow}>CHAPTER 03 / THE CONTRACT</Text>
          <Text style={s.chapterTitle}>A történeted itt indul.</Text></View></View>
      <Text style={s.heroSub}>A karaktered és a fejlődésed csak ezen az eszközön mentődik. A felhő és a közösségi megosztás nem automatikus.</Text>
      <Pressable disabled={!canStart} onPress={()=>createCharacter(name.trim(),classId)}
        accessibilityRole="button" style={[s.button,!canStart&&{opacity:.45}]}>
        <LinearGradient colors={['#F8D79A','#CB9855']} style={s.gradient}>
          <MythicIcon name="unlock" size={23} color="#1A2423"/>
          <Text style={s.buttonText}>Kaland indítása</Text>
          <MythicIcon name="arrow" size={20} color="#1A2423"/>
        </LinearGradient>
      </Pressable>
    </View>
    <Text style={s.footer}>EDZI NIGHTFALL · A FEJLŐDÉS NEM VÉLETLEN</Text>
  </Screen>;
}
const s=StyleSheet.create({
 chapterArtwork:{borderColor:'#75938B',borderWidth:1,marginVertical:3},
  hero:{borderRadius:25,borderWidth:1,borderColor:'#779188',padding:22,gap:10,overflow:'hidden'},
  top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  eyebrow:{fontSize:9,letterSpacing:1.7,fontWeight:'900',color:colors.gold},
  sign:{padding:9,backgroundColor:'#233B3B',borderRadius:11,borderWidth:1,borderColor:'#8A7C5D'},
  heroArt:{alignSelf:'flex-end',marginVertical:2},
  heroTitle:{fontSize:28,lineHeight:34,fontWeight:'900',letterSpacing:-.9,color:colors.text,maxWidth:'93%'},
  heroSub:{fontSize:12,lineHeight:20,color:colors.textSoft},
  heroIndex:{fontSize:9,letterSpacing:2,color:colors.cyan,fontWeight:'900',marginTop:4},
  identity:{gap:13,backgroundColor:'#13242B'},chapter:{flexDirection:'row',alignItems:'center',gap:12},
  smallIcon:{width:49,height:49,borderWidth:1,borderColor:'#6A766B',borderRadius:15,
    backgroundColor:'#23342F',alignItems:'center',justifyContent:'center'},
  chapterTitle:{fontSize:19,color:colors.text,fontWeight:'900',letterSpacing:-.5,marginTop:4},
  chapterDesc:{fontSize:11,color:colors.textMuted,marginTop:4,lineHeight:17},
  label:{fontSize:10,letterSpacing:1.6,fontWeight:'900',color:colors.cyan},
  input:{minHeight:53,backgroundColor:colors.input,borderWidth:1,borderColor:'#55776D',color:colors.text,
    paddingHorizontal:15,borderRadius:13,fontSize:16},
  classCard:{flexDirection:'row',gap:12,padding:10,alignItems:'center',borderWidth:1,borderColor:'#344E54',
    borderRadius:19,backgroundColor:'#112029'},
  classInfo:{flex:1,gap:5,minWidth:0},classIndex:{color:colors.gold,fontSize:9,letterSpacing:1,fontWeight:'900'},
  name:{color:colors.text,fontWeight:'900',fontSize:17},
  anime:{fontSize:10,fontWeight:'800',color:colors.cyan},
  desc:{fontSize:11,lineHeight:16,color:colors.textMuted},
  choice:{flexDirection:'row',alignItems:'center',gap:5,marginTop:3},
  choiceText:{fontSize:9,letterSpacing:.6,fontWeight:'900',color:colors.textMuted},
  final:{gap:14,borderColor:'#6D6750',backgroundColor:'#1C2428'},
  button:{borderRadius:15,overflow:'hidden'},
  gradient:{height:57,paddingHorizontal:15,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
  buttonText:{color:'#1A2423',fontSize:16,fontWeight:'900',flex:1},
  footer:{color:colors.textMuted,fontSize:9,textAlign:'center',letterSpacing:1.2,fontWeight:'900'}
});
