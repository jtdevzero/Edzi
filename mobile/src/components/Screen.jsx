import React from 'react';
import {ScrollView,View,Text,StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg,{Circle,Path} from 'react-native-svg';
import {colors,nightfall,type} from '../theme';
export default function Screen({title,subtitle,right,children,eyebrow='EDZI / NIGHTFALL'}){
  const inset=useSafeAreaInsets();
  return <View style={styles.root}>
    <LinearGradient colors={['#102128','#080E14',colors.bg]} locations={[0,.45,1]}
      style={StyleSheet.absoluteFill} pointerEvents="none"/>
    <View style={styles.horizon} pointerEvents="none"/>
    <Svg width="260" height="260" viewBox="0 0 260 260"
      style={styles.orbit} pointerEvents="none">
      <Circle cx="130" cy="130" r="110" fill="none" stroke={colors.cyan} strokeOpacity=".11" strokeWidth=".9"/>
      <Circle cx="130" cy="130" r="83" fill="none" stroke={colors.gold} strokeOpacity=".08" strokeWidth=".9" strokeDasharray="3 11"/>
      <Path d="M130 4 V48 M130 213 V256 M4 130 H48 M213 130 H256" stroke={colors.cyan} strokeOpacity=".15"/>
    </Svg>
    <ScrollView style={{flex:1}}
      contentContainerStyle={[styles.content,{paddingTop:inset.top+14,paddingBottom:inset.bottom+125}]}
      keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.brandLine}>
        <View style={styles.brandSymbol}><Text style={styles.symbol}>✦</Text></View>
        <Text style={styles.brand}>EDZI<Text style={styles.brandSlash}> / </Text>NIGHTFALL</Text>
        <View style={styles.signal}><View style={styles.dot}/><Text style={styles.signalText}>SYSTEM ONLINE</Text></View>
      </View>
      {title?<View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          {subtitle?<Text style={styles.subtitle}>{subtitle}</Text>:null}
        </View>{right}
      </View>:null}
      {children}
      <View style={styles.foot}><View style={styles.footRule}/>
        <Text style={styles.footText}>YOUR JOURNEY IS THE GAME.</Text><Text style={styles.footIndex}>◈ 04</Text>
      </View>
    </ScrollView>
  </View>;
}
const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.bg,overflow:'hidden'},
  horizon:{position:'absolute',top:-230,right:-185,width:450,height:450,borderRadius:225,
    backgroundColor:'#1C4447',opacity:.22},
  orbit:{position:'absolute',right:-110,top:30,opacity:.85},
  content:{width:'100%',maxWidth:600,alignSelf:'center',paddingHorizontal:17,gap:20},
  brandLine:{flexDirection:'row',alignItems:'center',gap:7,paddingBottom:13,
    borderBottomColor:'#335058',borderBottomWidth:1,marginBottom:1},
  brandSymbol:{width:26,height:26,borderRadius:8,backgroundColor:colors.gold,
    alignItems:'center',justifyContent:'center'},
  symbol:{color:'#1B211C',fontSize:15,fontWeight:'900'},
  brand:{fontSize:11,letterSpacing:2.5,color:colors.text,fontWeight:'900',flex:1},
  brandSlash:{color:colors.gold},signal:{flexDirection:'row',alignItems:'center',gap:5},
  dot:{width:5,height:5,borderRadius:4,backgroundColor:colors.green},
  signalText:{fontSize:8,fontWeight:'900',color:colors.textMuted,letterSpacing:1},
  header:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',gap:9,marginBottom:1},
  headerText:{flex:1,gap:6},eyebrow:{...type.eyebrow,fontSize:9,color:colors.cyan},
  title:{...type.h1,fontSize:34,letterSpacing:-1.3},
  subtitle:{...type.body,fontSize:12,lineHeight:18},
  foot:{flexDirection:'row',alignItems:'center',gap:9,marginTop:10,opacity:.55},
  footRule:{height:1,backgroundColor:colors.cardBorder,flex:1},
  footText:{fontSize:8,fontWeight:'900',letterSpacing:1.6,color:colors.textMuted},
  footIndex:{color:colors.gold,fontSize:10,fontWeight:'900'}
});
