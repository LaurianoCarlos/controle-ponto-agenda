import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Ponto } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';

export const PontoScreen: React.FC = () => {
  const [registroPonto, setRegistroPonto] = useState<{
    entrada?: Date;
    saida?: Date;
    entradaAlmoco?: Date;
    saidaAlmoco?: Date;
  }>({});

  const [registroTemporario, setRegistroTemporario] = useState<{
    entrada?: Date;
    saida?: Date;
    entradaAlmoco?: Date;
    saidaAlmoco?: Date;
  }>({});

  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [mostrarSeletorData, setMostrarSeletorData] = useState<boolean>(false);

  const formatarDataParaString = (data: Date): string => {
    return data.toISOString().split('T')[0]; // Converte para YYYY-MM-DD
  };

  const formatarDataParaExibicao = (data: Date): string => {
    return data.toLocaleDateString('pt-BR');
  };

  const verificarRegistroExistente = async () => {
    const dataFormatada = formatarDataParaString(dataSelecionada);
    const pontos = await StorageService.getPontos();
    const pontoExistente = pontos.find(p => p.data === dataFormatada);

    if (pontoExistente) {
      setRegistroPonto({
        entrada: new Date(pontoExistente.entrada),
        saida: pontoExistente.saida ? new Date(pontoExistente.saida) : undefined,
        entradaAlmoco: pontoExistente.entradaAlmoco ? new Date(pontoExistente.entradaAlmoco) : undefined,
        saidaAlmoco: pontoExistente.saidaAlmoco ? new Date(pontoExistente.saidaAlmoco) : undefined,
      });
      setRegistroTemporario({});
    } else {
      setRegistroPonto({});
      setRegistroTemporario({});
    }
  };

  // Verifica registros existentes quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      verificarRegistroExistente();
    }, [dataSelecionada])
  );

  const onDataChange = (event: any, data?: Date) => {
    setMostrarSeletorData(false);
    if (data) {
      setDataSelecionada(data);
    }
  };

  const registrarEntrada = () => {
    setRegistroTemporario(prev => ({
      ...prev,
      entrada: new Date(),
    }));
  };

  const registrarSaida = () => {
    setRegistroTemporario(prev => ({
      ...prev,
      saida: new Date(),
    }));
  };

  const registrarEntradaAlmoco = () => {
    setRegistroTemporario(prev => ({
      ...prev,
      entradaAlmoco: new Date(),
    }));
  };

  const registrarSaidaAlmoco = () => {
    setRegistroTemporario(prev => ({
      ...prev,
      saidaAlmoco: new Date(),
    }));
  };

  const confirmarRegistro = async () => {
    if (!registroTemporario.entrada) {
      Alert.alert('Erro', 'É necessário registrar a entrada primeiro.');
      return;
    }

    const dataFormatada = formatarDataParaString(dataSelecionada);

    const novoPonto: Ponto = {
      id: Date.now().toString(),
      data: dataFormatada,
      entrada: registroTemporario.entrada,
      saida: registroTemporario.saida,
      entradaAlmoco: registroTemporario.entradaAlmoco,
      saidaAlmoco: registroTemporario.saidaAlmoco,
    };

    await StorageService.savePonto(novoPonto);
    setRegistroPonto(registroTemporario);
    setRegistroTemporario({});
    Alert.alert('Sucesso', 'Registro de ponto salvo com sucesso!');
  };

  const cancelarRegistro = () => {
    setRegistroTemporario({});
    Alert.alert('Aviso', 'Registro cancelado.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.title}>Registro de Ponto</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity 
            style={styles.dataContainer}
            onPress={() => setMostrarSeletorData(true)}
          >
            <Text style={styles.dataText}>
              {formatarDataParaExibicao(dataSelecionada)}
            </Text>
          </TouchableOpacity>
          {mostrarSeletorData && (
            <DateTimePicker
              value={dataSelecionada}
              mode="date"
              display="default"
              onChange={onDataChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entrada/Saída</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Entrada:</Text>
            <Text style={styles.value}>
              {registroTemporario.entrada
                ? registroTemporario.entrada.toLocaleTimeString()
                : registroPonto.entrada
                ? registroPonto.entrada.toLocaleTimeString()
                : '--:--'}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Saída:</Text>
            <Text style={styles.value}>
              {registroTemporario.saida
                ? registroTemporario.saida.toLocaleTimeString()
                : registroPonto.saida
                ? registroPonto.saida.toLocaleTimeString()
                : '--:--'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Almoço</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Entrada:</Text>
            <Text style={styles.value}>
              {registroTemporario.entradaAlmoco
                ? registroTemporario.entradaAlmoco.toLocaleTimeString()
                : registroPonto.entradaAlmoco
                ? registroPonto.entradaAlmoco.toLocaleTimeString()
                : '--:--'}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Saída:</Text>
            <Text style={styles.value}>
              {registroTemporario.saidaAlmoco
                ? registroTemporario.saidaAlmoco.toLocaleTimeString()
                : registroPonto.saidaAlmoco
                ? registroPonto.saidaAlmoco.toLocaleTimeString()
                : '--:--'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Registrar Entrada"
            onPress={registrarEntrada}
            disabled={!!registroTemporario.entrada || !!registroPonto.entrada}
            style={styles.button}
          />
          <Button
            title="Registrar Saída"
            onPress={registrarSaida}
            disabled={!registroTemporario.entrada || !!registroTemporario.saida || !!registroPonto.saida}
            style={styles.button}
          />
          <Button
            title="Registrar Entrada Almoço"
            onPress={registrarEntradaAlmoco}
            disabled={!!registroTemporario.entradaAlmoco || !!registroPonto.entradaAlmoco}
            style={styles.button}
          />
          <Button
            title="Registrar Saída Almoço"
            onPress={registrarSaidaAlmoco}
            disabled={!!registroTemporario.saidaAlmoco || !!registroPonto.saidaAlmoco}
            style={styles.button}
          />
          <View style={styles.confirmacaoContainer}>
            <Button
              title="Confirmar"
              onPress={confirmarRegistro}
              style={{ ...styles.button, ...styles.confirmButton }}
            />
            <Button
              title="Cancelar"
              onPress={cancelarRegistro}
              style={{ ...styles.button, ...styles.cancelButton }}
            />
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200ee',
  },
  dataContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dataText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666666',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    marginBottom: 12,
  },
  confirmacaoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  confirmButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#f44336',
  },
}); 