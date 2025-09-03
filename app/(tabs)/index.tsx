import { StyleSheet, View, Text } from 'react-native'

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} />
      <Text>Hello World</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    color: 'white',
    height: 1,
    width: '80%',
  },
})
