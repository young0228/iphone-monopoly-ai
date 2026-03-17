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

const COLORS = {
  appBg: '#0B1020',
  cardBg: '#151B2E',
  text: '#E8EEFF',
  textMuted: '#A6B1D8',
  primary: '#5B8CFF',
  primaryDark: '#446FDC',
  success: '#35C77A',
  neutral: '#5D6B92',
  border: '#2C3658',
};

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
        <View style={styles.headerCard}>
          <Text style={styles.title}>Monopoly MVP</Text>
          <Text style={styles.subtitle}>You vs 3 AI opponents</Text>
        </View>

        <Board players={players} />

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Current Turn</Text>
          <Text style={styles.turnName}>{activePlayer.name}</Text>
          <Text style={styles.info}>Position: {TILES[activePlayer.position].name}</Text>
          <Text style={styles.info}>Cash: ${activePlayer.cash}</Text>
          <Text style={styles.info}>Last Roll: {lastRoll ?? '-'}</Text>
          <Text style={styles.message}>{statusMessage}</Text>
        </View>

        <View style={styles.buttonsRow}>
          {!activePlayer.isAI && (
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleHumanRoll}>
              <Text style={styles.buttonText}>Roll Dice</Text>
            </TouchableOpacity>
          )}

          {canBuyCurrentTile && !activePlayer.isAI && (
            <>
              <TouchableOpacity style={[styles.button, styles.buyButton]} onPress={handleBuy}>
                <Text style={styles.buttonText}>Buy Property</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.skipButton]} onPress={handleSkipBuy}>
                <Text style={styles.buttonText}>Skip</Text>
              </TouchableOpacity>
            </>
          )}

          {(!canBuyCurrentTile || activePlayer.isAI) && (
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleNextTurn}>
              <Text style={styles.buttonText}>{activePlayer.isAI ? 'Run AI Turn' : 'End Turn'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Players</Text>
          {sortedPlayers.map((player) => (
            <View key={player.id} style={styles.playerRow}>
              <View style={[styles.playerDot, { backgroundColor: player.color }]} />
              <Text style={styles.info}>
                {player.name}: ${player.cash} · {player.properties.length} properties
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.appBg,
  },
  container: {
    padding: 16,
    gap: 14,
  },
  headerCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  infoCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: COLORS.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  turnName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  info: {
    color: COLORS.text,
    fontSize: 14,
  },
  message: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  buyButton: {
    backgroundColor: COLORS.success,
    borderColor: '#2EA668',
  },
  skipButton: {
    backgroundColor: COLORS.neutral,
    borderColor: '#4F5D82',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  playerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
