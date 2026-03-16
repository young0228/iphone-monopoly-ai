import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Board from './src/components/Board';
import { TILES } from './src/game/gameData';
import {
  buyProperty,
  createInitialPlayers,
  movePlayer,
  resolveLanding,
  rollDie,
  runAiTurn,
} from './src/game/gameLogic';

export default function App() {
  const [players, setPlayers] = useState(createInitialPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Tap Roll Dice to begin.');
  const [lastRoll, setLastRoll] = useState(null);
  const [canBuyCurrentTile, setCanBuyCurrentTile] = useState(false);

  const activePlayer = players[currentPlayerIndex];
  const activeTile = TILES[activePlayer.position];

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => (a.isAI === b.isAI ? 0 : a.isAI ? 1 : -1)),
    [players],
  );

  const goToNextPlayer = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setCanBuyCurrentTile(false);
  };

  const handleHumanRoll = () => {
    if (activePlayer.isAI) {
      return;
    }

    const die = rollDie();
    setLastRoll(die);

    const moved = movePlayer(players, currentPlayerIndex, die);
    const landing = resolveLanding(moved, currentPlayerIndex);

    setPlayers(landing.players);
    setCanBuyCurrentTile(Boolean(landing.canBuy));
    setStatusMessage(`${activePlayer.name} rolled ${die}. ${landing.message}`);
  };

  const handleBuy = () => {
    const purchase = buyProperty(players, currentPlayerIndex);
    setPlayers(purchase.players);
    setStatusMessage(purchase.message);
    setCanBuyCurrentTile(false);
    goToNextPlayer();
  };

  const handleSkipBuy = () => {
    setStatusMessage(`${activePlayer.name} skipped buying ${activeTile.name}.`);
    setCanBuyCurrentTile(false);
    goToNextPlayer();
  };

  const handleNextTurn = () => {
    if (!activePlayer.isAI) {
      goToNextPlayer();
      return;
    }

    const result = runAiTurn(players, currentPlayerIndex);
    setPlayers(result.players);
    setLastRoll(result.die);
    setStatusMessage(`${activePlayer.name} rolled ${result.die}. ${result.message}`);
    goToNextPlayer();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Monopoly MVP</Text>
        <Text style={styles.subtitle}>You vs 3 simple AI players</Text>

        <Board players={players} />

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Current Turn: {activePlayer.name}</Text>
          <Text style={styles.info}>Position: {TILES[activePlayer.position].name}</Text>
          <Text style={styles.info}>Cash: ${activePlayer.cash}</Text>
          <Text style={styles.info}>Last Roll: {lastRoll ?? '-'}</Text>
          <Text style={styles.message}>{statusMessage}</Text>
        </View>

        <View style={styles.buttonsRow}>
          {!activePlayer.isAI && (
            <TouchableOpacity style={styles.button} onPress={handleHumanRoll}>
              <Text style={styles.buttonText}>Roll Dice</Text>
            </TouchableOpacity>
          )}

          {canBuyCurrentTile && !activePlayer.isAI && (
            <>
              <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
                <Text style={styles.buttonText}>Buy Property</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkipBuy}>
                <Text style={styles.buttonText}>Skip</Text>
              </TouchableOpacity>
            </>
          )}

          {(!canBuyCurrentTile || activePlayer.isAI) && (
            <TouchableOpacity style={styles.button} onPress={handleNextTurn}>
              <Text style={styles.buttonText}>{activePlayer.isAI ? 'Run AI Turn' : 'End Turn'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Players</Text>
          {sortedPlayers.map((player) => (
            <Text key={player.id} style={styles.info}>
              {player.name}: ${player.cash} | Properties: {player.properties.length}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#334155',
  },
  panel: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  info: {
    color: '#1e293b',
  },
  message: {
    marginTop: 8,
    color: '#0f172a',
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  buyButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  skipButton: {
    backgroundColor: '#64748b',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
