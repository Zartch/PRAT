import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../utils/config';

export default function Header({ subtitle }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/prat_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Forn i Pastisseria Prat</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
