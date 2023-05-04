
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View} from 'react-native';

// componente principal
export default function App() {

  // useState é um hook do React que adiciona estado a um componente funcional.
  // Aqui temos três estados, o primeiro (cep) armazena o cep digitado pelo usuário.
  // O segundo (endereco) armazena o objeto de endereço retornado pela API.
  // O terceiro (load) é um booleano que indica se a aplicação está carregando dados.
  const [cep,setCep] = useState("")
  const [endereco, setEndereco] = useState(null)
  const [load, setLoad] = useState(false)

  // O estado erro armazena uma mensagem de erro que pode ser exibida na tela.
  const [erro, setErro] = useState()

  // A função buscarCep é chamada quando o botão é pressionado.
  const buscarCep = () => {

    // Validando se o cep é válido.
    if(cep.replace("-","",".",",","!","@","'","#","$","%","%","¨","&","*","(",")","-","+","=",">","<",";",":","/","?","´","`","^","~","[","]","{","}","").length != 8){
      alert("Cep Inválido")
      return
    }

    // Se o cep for válido, o estado load é atualizado para true,
    // indicando que a aplicação está carregando dados.
    setLoad(true)

    // Utilizando fetch para fazer uma requisição para a API do ViaCEP.
    fetch(`https://viacep.com.br/ws/${cep.replace("-","")}/json/`)
      .then(response => response.json())
      .then(objeto => {
        if(objeto.erro){
          // Se a API retornar um objeto com a propriedade erro,
          // o estado erro é atualizado com uma mensagem de erro.
          setErro("Cep não encontrado!")
          return
        }

        // Se a API retornar um objeto de endereço válido, 
        // o estado endereco é atualizado com esse objeto.
        setEndereco(objeto)
        setErro("")
      })
      .catch(() => {
        // Se ocorrer um erro durante a busca pelo endereço,
        // o estado erro é atualizado com uma mensagem de erro.
        setErro("Ocorreu um erro ao buscar o endereço!")
      })
      .finally(() => {
        // Após a requisição, o estado load é atualizado para false,
        // indicando que a aplicação terminou de carregar os dados.
        setLoad(false)
      })
  }

  // Renderização do componente
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscador de endereço</Text>

      {/* Input para o usuário digitar o cep */}
      <Text style={styles.text}>Digite o CEP</Text>
      <TextInput placeholder="Digite aqui" style={styles.input}  value={cep} onChangeText={input => setCep(input)}/>

      {/* Botão para buscar o endereço */}
      <Button style={styles.button} title="Buscar endereço" onPress={buscarCep}/>

        {/* Renderiza o texto "Carregando..." enquanto a requisição está em andamento */}
  {load && <Text style={styles.loading}>Carregando...</Text>}

{/* Renderiza os dados do endereço se a requisição foi concluída com sucesso */}
{endereco != null && !load && erro == "" && (
  <View style={styles.result}>
    <Text style={styles.resultText}>Cep: {endereco.cep}</Text>
    <Text style={styles.resultText}>Rua: {endereco.logradouro}</Text>
    <Text style={styles.resultText}>Complemento: {endereco.complemento}</Text>
    <Text style={styles.resultText}>Bairro: {endereco.bairro}</Text>
    <Text style={styles.resultText}>Cidade: {endereco.localidade}</Text>
    <Text style={styles.resultText}>UF: {endereco.uf}</Text>
    <Text style={styles.resultText}>DDD: {endereco.ddd}</Text>
  </View>
)}

{/* Renderiza a mensagem de erro caso a requisição falhe */}
{erro && <Text style={styles.error}>{erro}</Text>}

{/* StatusBar para configurar a barra de status do aplicativo */}
<StatusBar style="auto" />
</View>
);

}

// Estilos
const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "#fff",
alignItems: "center",
justifyContent: "center",
},
title: {
fontSize: 25,
color: "#264653",
marginBottom: 20,
},
text: {
fontSize: 18,
color: "black",
},
input: {
marginVertical: 20,
height: 40,
width: 200,
borderColor: "gray",
borderWidth: 1,
paddingHorizontal: 10,
},
loading: {
fontSize: 20,
marginVertical: 10,
},
result: {
marginTop: 20,
backgroundColor: "#e5e5e5",
borderRadius: 5,
padding: 10,
width: "90%",
},
resultText: {
fontSize: 16,
color: "#666",
marginVertical: 2,
},
error: {
color: "red",
marginTop: 10,
fontSize: 18,
},
button: {
marginHorizontal: 20,
borderRadius: 20,
color: "red",
marginBottom: 30,
},
});