import React from 'react';
import {ScrollView,View,Text,StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors,type} from '../theme';
export default function Screen({title,subtitle,right,children,eyebrow='EDZI / ASCENSION'}){
  const inset=useSafeAreaInsets();
  return <View style={styles.root}>
    <LinearGradient colors={['#11182C',colors.bg,colors.bg]}
      locations={[0,.43,1]} style={StyleSheet.absoluteFill} pointerEvents="none"/>
    <View pointerEvents="none" style={styles.aura}/>
    <ScrollView style={{flex:1}}
      contentContainerStyle={[styles.content,{paddingTop:inset.top+20,paddingBottom:inset.bottom+46}]}
      keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {title?<View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          {subtitle?<Text style={styles.subtitle}>{subtitle}</Text>:null}
        </View>{right}
      </View>:null}
      {children}
    </ScrollView>
  </View>;
}
const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.bg,overflow:'hidden'},
  aura:{position:'absolute',width:300,height:300,borderRadius:150,backgroundColor:'#343D78',opacity:.10,right:-142,top:-162},
  content:{width:'100%',maxWidth:640,alignSelf:'center',paddingHorizontal:18,gap:19},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:5},
  headerText:{flex:1,gap:7},
  eyebrow:type.eyebrow,
  title:type.h1,
  subtitle:{...type.body,fontSize:13,lineHeight:19}
});
