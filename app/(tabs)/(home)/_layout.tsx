import { createMaterialTopTabNavigator, MaterialTopTabBar } from '@react-navigation/material-top-tabs';
import { Link, withLayoutContext } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from "react-native-svg";

const { Navigator } = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Navigator);

export default function HomeTopLayout() {
  const showFilterIcon = true; 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F0F' }} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <TopTabs
        tabBar={(props) => (
          <View style={styles.headerContainer}>
            
            <View style={{ flex: 1 }}>
              <MaterialTopTabBar
                {...props}
                />
            </View>
            
              <Link href="/filtrarP" asChild>
                  <TouchableOpacity  style={styles.filterButton}>
                    <Svg width={23} height={23} viewBox="0 0 20 23" fill="none">
                                            <Path d="M1.06396 3.28613H14.3981" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
                                            <Path d="M1.06396 11.0642H7.73104" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
                                            <Path d="M12.1758 11.0642H18.8429" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
                                            <Path d="M5.50977 18.8413H18.8439" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
                                            <Path d="M16.6203 5.5085C17.8477 5.5085 18.8427 4.51361 18.8427 3.28635C18.8427 2.0591 17.8477 1.06421 16.6203 1.06421C15.3929 1.06421 14.3979 2.0591 14.3979 3.28635C14.3979 4.51361 15.3929 5.5085 16.6203 5.5085Z" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
                                            <Path d="M9.95429 13.2866C11.1817 13.2866 12.1766 12.2917 12.1766 11.0644C12.1766 9.83717 11.1817 8.84229 9.95429 8.84229C8.72692 8.84229 7.73193 9.83717 7.73193 11.0644C7.73193 12.2917 8.72692 13.2866 9.95429 13.2866Z" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
                                            <Path d="M3.28632 21.0642C4.5137 21.0642 5.50868 20.0693 5.50868 18.842C5.50868 17.6148 4.5137 16.6199 3.28632 16.6199C2.05895 16.6199 1.06396 17.6148 1.06396 18.842C1.06396 20.0693 2.05895 21.0642 3.28632 21.0642Z" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
                                        </Svg>
                  </TouchableOpacity>
                  </Link>

          </View>
        )}
        
        screenOptions={{
          swipeEnabled: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#888',
          tabBarIndicatorStyle: { backgroundColor: 'white', height: 3},
          tabBarLabelStyle: {
            textTransform: 'none',
            fontSize: 16,
            fontWeight: 'bold',
          },
          tabBarStyle: { 
            backgroundColor:"#0F0F0F",
            shadowOpacity: 0,
            elevation: 0,
            borderWidth: 0,
            borderBottomWidth: 0,
            borderTopWidth: 0
          } 
        }}
      >
        <TopTabs.Screen name="principal" options={{ title: 'Explorar' }} />
        <TopTabs.Screen name="tendencias" options={{ title: 'Tendências' }} />
        <TopTabs.Screen name="seguindo" options={{ title: 'Seguindo' }} />
      </TopTabs>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 5,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
  },
  filterButton: {
    backgroundColor:"#313131",
    borderRadius:50,
    padding: 9,
  },
});