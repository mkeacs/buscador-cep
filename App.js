import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // Definição dos estados usando o useState
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState(null);
  const [load, setLoad] = useState(false);
  const [erro, setErro] = useState();
  const [enderecoSalvo, setEnderecoSalvo] = useState(null);
  const [exibirBuscarEndereco, setExibirBuscarEndereco] = useState(true);

  // Função para salvar o endereço no AsyncStorage
  const salvarEndereco = async () => {
    try {
      await AsyncStorage.setItem('endereco', JSON.stringify(endereco));
      console.log('Endereço salvo com sucesso!');
    } catch (error) {
      console.log('Erro ao salvar o endereço:', error);
    }
  };

  // Carrega o endereço salvo ao iniciar o aplicativo
  useEffect(() => {
    const carregarEnderecoSalvo = async () => {
      try {
        const enderecoSalvo = await AsyncStorage.getItem('endereco');
        if (enderecoSalvo !== null) {
          setEnderecoSalvo(JSON.parse(enderecoSalvo));
        }
      } catch (error) {
        console.log('Erro ao carregar o endereço salvo:', error);
      }
    };

    carregarEnderecoSalvo();
  }, []);

  // Função para buscar o CEP digitado
  const buscarCep = () => {
    // Verifica se o CEP possui o formato válido
    if(cep.replace("-","",".",",","!","@","'","#","$","%","%","¨","&","*","(",")","-","+","=",">","<",";",":","/","?","´","`","^","~","[","]","{","}","").length != 8){
      alert("Cep Inválido")
      return
    }

    setLoad(true);

    // Faz uma requisição para a API de CEPs
    fetch(`https://viacep.com.br/ws/${cep.replace("-", "")}/json/`)
      .then(response => response.json())
      .then(objeto => {
        if (objeto.erro) {
          setErro("Cep não encontrado!");
          return;
        }

        return salvarEndereco() // Salva o endereço no AsyncStorage
          .then(() => {
            setEndereco(objeto);
            setErro("");
            setExibirBuscarEndereco(false);
          })
          .catch(error => {
            console.log('Erro ao salvar o endereço:', error);
          })
          .finally(() => {
            setLoad(false);
          });
      })
      .catch(() => {
        setErro("Ocorreu um erro ao buscar o endereço!");
        setLoad(false);
      });
  };

  // Função para exibir o endereço salvo
  const exibirEnderecoSalvo = () => {
    if (enderecoSalvo) {
      return (
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>Cep: {enderecoSalvo.cep}</Text>
          <Text style={styles.addressText}>Rua: {enderecoSalvo.logradouro}</Text>
          <Text style={styles.addressText}>Complemento: {enderecoSalvo.complemento}</Text>
          <Text style={styles.addressText}>Bairro: {enderecoSalvo.bairro}</Text>
          <Text style={styles.addressText}>Cidade: {enderecoSalvo.localidade}</Text>
          <Text style={styles.addressText}>UF: {enderecoSalvo.uf}</Text>
          <Text style={styles.addressText}>DDD: {enderecoSalvo.ddd}</Text>
        </View>
      );
    } else {
      return <Text style={styles.noAddressText}>Nenhum endereço salvo encontrado.</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscador de endereço</Text>

      {exibirBuscarEndereco && (
        <>
          <Text style={styles.text}>Digite o CEP</Text>
          <TextInput
            placeholder="Digite aqui"
            style={styles.input}
            value={cep}
            onChangeText={input => setCep(input)}
          />
          {load && <Text style={styles.loading}>Carregando...</Text>}
          {erro && <Text style={styles.error}>{erro}</Text>}
          <Button style={styles.button} title="Buscar endereço" onPress={buscarCep} />
        </>
      )}

      {!exibirBuscarEndereco && (
        <>
          <Text style={styles.savedAddressTitle}>Endereço Salvo:</Text>
          {exibirEnderecoSalvo()}
          <Button style={styles.button} title="Exibir endereço salvo" onPress={() => setExibirBuscarEndereco(true)} />
        </>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

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
  savedAddressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  addressContainer: {
    marginTop: 10,
  },
  addressText: {
    fontSize: 16,
    color: "#666",
    marginVertical: 2,
  },
  noAddressText: {
    fontSize: 16,
    color: "#666",
    marginVertical: 10,
    textAlign: "center",
  },
});
