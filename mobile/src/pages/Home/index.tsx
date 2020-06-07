import React, { useState, useEffect, ChangeEvent } from 'react'
import { View,Text, ImageBackground ,StyleSheet, Image, TextInput, Picker, KeyboardAvoidingView, Platform  } from 'react-native'
import { Feather as Icon } from '@expo/vector-icons'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import SelectInput from 'react-native-select-input-ios'
import axios from 'axios'

interface IBGEUFResponse{
  sigla: string;
}

interface IBGECityResponse{
  nome: string
}
const Home = () => {
  const [city, setCity] = useState('')
  const [uf, setUf] = useState('')

  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  const navigation = useNavigation()

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(res => {
      const ufInitials = res.data.map(uf => uf.sigla)
      setUfs(ufInitials)
    })
  }, [])

  useEffect(() => {
    if(uf === ''){
      return
    }

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
          .then(res => {
            const cityNames = res.data.map(city => city.nome )
            setCities(cityNames)
    })

  }, [handleSelectUF])

  function handleSelectUF(event: string){
    setUf(event)
  }

  function handleSelectCity(event: string){
    setCity(event)
  }

  function handleNavigateToPoints(){
    navigation.navigate('Points', {  
      uf,
      city
    })
  }

  return (
   <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding': undefined}>
    <ImageBackground 
      source={require('../../assets/home-background.png')} 
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}>

      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <View>
          <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
          <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
        </View>
      </View>

  
      <View style={styles.footer}>
        <Picker
         selectedValue={uf}
         style={styles.select}
         onValueChange={(itemValue, itemIndex) => handleSelectUF(itemValue) }
         >
          {ufs.map(uf => (
            (
              <Picker.Item key={uf} label={uf} value={uf} />
            )
          ))}

         </Picker>
          
         <Picker
          selectedValue={city}
          style={styles.select}
          onValueChange={(itemValue, itemIndex) => handleSelectCity(itemValue) }
          >
            {cities.map(city => (
              (
                <Picker.Item key={city} label={city} value={city} />
              )
            ))}

         </Picker>
        
        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name="arrow-right" color="#FFF" size={24}/>
            </Text>
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>

    </ImageBackground>
  </KeyboardAvoidingView>   
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },
  
  footer: {},

  select: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    paddingVertical: 5
    },

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

export default Home