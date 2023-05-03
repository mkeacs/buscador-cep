import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View} from 'react-native';
//componentes
export default function App() {
  const [cep,setCep] = useState("")
  const [endereco, setEndereco] = useState(null) //se possuir um endereço vai mostrar, caso contrário, não
  const [load, setLoad] = useState(false)
  const [erro, setErro] = useState()
  const buscarCep = () => {

    if(cep.replace("-","",".",",","!","@","'","#","$","%","%","¨","&","*","(",")","-","+","=",">","<",";",":","/","?","´","`","^","~","[","]","{","}","").length != 8){
      alert("Cep Inválido")
      return
    }

    
    setLoad(true)
    fetch(`https://viacep.com.br/ws/${cep.replace("-","")}/json/`)
    .then(response => response.json())
    .then(objeto => {
      if(objeto.erro){
        setErro("Cep não encontrado!")
        return
      }

      setEndereco(objeto)
      setErro("")
    })
    .catch(() => {
      setErro("Ocorreu um erro ao buscar o endereço!")
    })
    .finally(() => {
      setLoad(false)
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscador de endereço</Text>
      <Text style={styles.text}>Digite o CEP</Text>
      <TextInput placeholder="Digite aqui" style={styles.input}  value={cep} onChangeText={input => setCep(input)}/>

      <Button style={styles.button} title="Buscar endereço" onPress={buscarCep}/>
      {load && <Text style={styles.text}>Carregando...</Text>}
      {endereco != null && !load && erro == "" && (
         <View>
         <Text style={styles.text}>Cep: {endereco.cep}</Text>
         <Text style={styles.text}>Rua: {endereco.logradouro}</Text>
         <Text style={styles.text}>Complemento: {endereco.complemento}</Text>
         <Text style={styles.text}>Bairro: {endereco.bairro}</Text>
         <Text style={styles.text}>Cidade: {endereco.localidade}</Text>
         <Text style={styles.text}>UF: {endereco.uf}</Text>
         <Text style={styles.text}>DDD: {endereco.ddd}</Text>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

//estilos
const styles = StyleSheet.create({
  button:{
    marginHorizontal:20,
    borderRadius:20,
    color: 'red',
    marginBottom:30,

  },
  input: {
    marginVertical:20,
    height:40,
    width:200,
    borderColor:'gray',
    borderWidth: 1},
  title:{
    fontSize:25,
    color: '#264653',
    marginBottom:20
  },
  text:{
    fontSize:18,
    color:'black'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
