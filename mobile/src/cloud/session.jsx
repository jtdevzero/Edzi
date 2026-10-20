import React,{createContext,useContext,useMemo,useState} from 'react';
// Ephemeral JWT only: no AsyncStorage, persistent cookies or automatic token forwarding.
const Context=createContext(null);
export function CloudSessionProvider({children}){
  const [session,setSession]=useState(null);
  const value=useMemo(()=>({session,setSession,signOut:()=>setSession(null)}),[session]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCloudSession(){
  const value=useContext(Context);
  if(!value)throw new Error('Missing CloudSessionProvider');
  return value;
}
