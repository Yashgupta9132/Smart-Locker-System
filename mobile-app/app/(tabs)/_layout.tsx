import { Ionicons, } from "@expo/vector-icons"
import { Tabs } from 'expo-router'
import React from 'react'

const TabsLayout = () => {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#888',
            tabBarInactiveTintColor: 'black',
            tabBarStyle: {
                backgroundColor: '#fff',
                borderTopWidth:1,
                borderTopColor: '#000',
                height:90,
                paddingBottom:30,
                paddingTop:10,
            },
            tabBarLabelStyle:{
                fontSize:12,
                fontWeight:"600",
            },
            headerShown:false,
        }}>
            <Tabs.Screen
                name='index' options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name='home' size={size} color={color}/>
                    )
                }} />
            <Tabs.Screen
                name='settings' options={{
                    title: "Settings",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name='settings' size={size} color={color}/>
                    )
                }} />
        </Tabs>
    )
}

export default TabsLayout





