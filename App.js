import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // Definição dos estados utilizados no componente
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState(null);
  const [load, setLoad] = useState(false);
  const [erro, setErro] = useState("");
  const [enderecosSalvos, setEnderecosSalvos] = useState([]);
  const [exibirBuscarEndereco, setExibirBuscarEndereco] = useState(true);

  // Função para salvar o endereço atual
  const salvarEndereco = async () => {
    if (!endereco) {
      return;
    }

    // Verificar se o endereço já existe na lista de endereços salvos
    const enderecoJaSalvo = enderecosSalvos.find(
      (enderecoSalvo) => enderecoSalvo.cep === endereco.cep
    );

    if (enderecoJaSalvo) {
      console.log('Endereço já foi salvo anteriormente:', endereco);
      return;
    }

    try {
      // Salva o endereço atual no AsyncStorage do dispositivo
      await AsyncStorage.setItem(
        `endereco-${new Date().getTime()}`,
        JSON.stringify(endereco)
      );
      console.log('Endereço salvo com sucesso!');
      setEnderecosSalvos([...enderecosSalvos, endereco]);
    } catch (error) {
      console.log('Erro ao salvar o endereço:', error);
    }
  };

  useEffect(() => {
    // Função executada ao carregar o componente para carregar os endereços salvos anteriormente
    const carregarEnderecosSalvos = async () => {
      try {
        // Obtém todas as chaves salvas no AsyncStorage
        const chaves = await AsyncStorage.getAllKeys();
        // Obtém os valores salvos no AsyncStorage com base nas chaves obtidas
        const enderecosSalvos = await AsyncStorage.multiGet(chaves);
        // Converte os valores de string JSON para objetos JavaScript
        const parsedEnderecos = enderecosSalvos.map(([key, value]) => JSON.parse(value));
        // Atualiza o estado com os endereços salvos
        setEnderecosSalvos(parsedEnderecos);
        setExibirBuscarEndereco(false); // Define para exibir os endereços salvos ao carregar
      } catch (error) {
        console.log('Erro ao carregar os endereços salvos:', error);
      }
    };

    carregarEnderecosSalvos();
  }, []);

  // Função para buscar o CEP digitado pelo usuário
  const buscarCep = () => {
    if (cep.replace(/\D/g, "").length !== 8) {
      alert("Cep Inválido");
      return;
    }

    setLoad(true);

    // Faz uma requisição HTTP para a API do ViaCEP para obter o endereço correspondente ao CEP
    fetch(`https://viacep.com.br/ws/${cep.replace("-", "")}/json/`)
      .then(response => response.json())
      .then(objeto => {
        if (objeto.erro) {
          setErro("Cep não encontrado!");
          return;
        }

        // Atualiza o estado com o endereço obtido
        setEndereco(objeto);
        setErro("");
        setExibirBuscarEndereco(false);
      })
      .catch(() => {
        setErro("Ocorreu um erro ao buscar o endereço!");
      })
      .finally(() => {
        setLoad(false);
      });
  };

  // Função auxiliar para exibir um endereço salvo
  const exibirEnderecoSalvo = enderecoSalvo => {
    if (enderecoSalvo && enderecoSalvo.cep) {
      // Renderiza as informações do endereço
      return (
        <View style={styles.addressContainer} key={enderecoSalvo.cep}>
          <Text style={styles.addressText}>CEP: {enderecoSalvo.cep}</Text>
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

  // Função para exibir todos os endereços salvos
  const exibirEnderecosSalvos = () => {
    return (
      <ScrollView style={styles.savedAddressesContainer}>
        <Text style={styles.savedAddressTitle}>Endereços Salvos:</Text>
        {enderecosSalvos.map(enderecoSalvo => exibirEnderecoSalvo(enderecoSalvo))}
      </ScrollView>
    );
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
          <Text style={styles.savedAddressTitle}>Endereço Buscado:</Text>
          {exibirEnderecoSalvo(endereco)}
          <Button style={styles.button} title="Salvar Endereço" onPress={salvarEndereco} />
          <Button style={styles.button} title="Buscar outro endereço" onPress={() => setExibirBuscarEndereco(true)} />
          {enderecosSalvos.length > 0 && exibirEnderecosSalvos()}
        </>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

// Definição dos estilos utilizados no componente
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
    marginBottom: 10,
  },
  savedAddressTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  addressContainer: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  addressText: {
    fontSize: 16,
    marginBottom: 5,
  },
  savedAddressesContainer: {
    marginTop: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
});
