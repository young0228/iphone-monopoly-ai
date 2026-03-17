import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Board from './src/components/Board';
import { TILES } from './src/game/gameData';
import {
  buyProperty,
  createInitialPlayers,
  movePlayer,
  resolveLanding,
  rollTurn,
  runAiTurn,
} from './src/game/gameLogic';

const UI = {
  bg: '#070B18',
  panel: '#111935',
  panelAlt: '#0D1430',
  border: '#26325B',
  text: '#EAF0FF',
  muted: '#9DAAD7',
  primary: '#4F7CFF',
  primaryBorder: '#3A64DA',
  success: '#2FC57A',
  successBorder: '#24A869',
  neutral: '#536186',
  neutralBorder: '#425173',
  disabled: '#3A4361',
};

const HUMAN_TURN_PHASES = {
  READY_TO_ROLL: 'ready_to_roll',
  MUST_DECIDE_PROPERTY: 'must_decide_property',
  READY_TO_END: 'ready_to_end',
};

export default function App() {
  const [players, setPlayers] = useState(createInitialPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Tap Roll Dice to begin.');
  const [lastRoll, setLastRoll] = useState(null);
  const [humanTurnPhase, setHumanTurnPhase] = useState(HUMAN_TURN_PHASES.READY_TO_ROLL);

  const activePlayer = players[currentPlayerIndex];
  const activeTile = TILES[activePlayer.position];
  const activeTileOwner = players.find((player) => player.properties.includes(activeTile.id));
  const isPurchasableTile = activeTile.type === 'property' && !activeTileOwner;

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => (a.isAI === b.isAI ? 0 : a.isAI ? 1 : -1)),
    [players],
  );

  const goToNextPlayer = () => {
    setCurrentPlayerIndex((prev) => {
      const next = (prev + 1) % players.length;
      const nextPlayer = players[next];
      setHumanTurnPhase(nextPlayer.isAI ? HUMAN_TURN_PHASES.READY_TO_END : HUMAN_TURN_PHASES.READY_TO_ROLL);
      return next;
    });
  };

  const handleHumanRoll = () => {
    if (activePlayer.isAI || humanTurnPhase !== HUMAN_TURN_PHASES.READY_TO_ROLL) {
      return;
    }

    const roll = rollTurn();
    setLastRoll(roll.total);

    const moved = movePlayer(players, currentPlayerIndex, roll.total);
    const landing = resolveLanding(moved, currentPlayerIndex);

    setPlayers(landing.players);
    setStatusMessage(`${activePlayer.name} rolled ${roll.total}. ${landing.message}`);

    if (landing.canBuy) {
      setHumanTurnPhase(HUMAN_TURN_PHASES.MUST_DECIDE_PROPERTY);
    } else {
      setHumanTurnPhase(HUMAN_TURN_PHASES.READY_TO_END);
    }
  };

  const handleBuy = () => {
    if (activePlayer.isAI || humanTurnPhase !== HUMAN_TURN_PHASES.MUST_DECIDE_PROPERTY) {
      return;
    }

    const purchase = buyProperty(players, currentPlayerIndex);
    setPlayers(purchase.players);
    setStatusMessage(purchase.message);
    setHumanTurnPhase(HUMAN_TURN_PHASES.READY_TO_END);
    goToNextPlayer();
  };

  const handleSkipBuy = () => {
    if (activePlayer.isAI || humanTurnPhase !== HUMAN_TURN_PHASES.MUST_DECIDE_PROPERTY) {
      return;
    }

    setStatusMessage(`${activePlayer.name} skipped buying ${activeTile.name}.`);
    setHumanTurnPhase(HUMAN_TURN_PHASES.READY_TO_END);
    goToNextPlayer();
  };

  const handleEndTurn = () => {
    if (activePlayer.isAI || humanTurnPhase !== HUMAN_TURN_PHASES.READY_TO_END) {
      return;
    }
    goToNextPlayer();
  };

  const handleAiTurn = () => {
    if (!activePlayer.isAI) {
      return;
    }

    const result = runAiTurn(players, currentPlayerIndex);
    setPlayers(result.players);
    setLastRoll(result.total);
    setStatusMessage(`${activePlayer.name} rolled ${result.total}. ${result.message}`);
    goToNextPlayer();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>Monopoly MVP</Text>
          <Text style={styles.subtitle}>Single Player • 3 AI Opponents</Text>
        </View>

        <Board players={players} />

        <View style={styles.infoCard}>
          <Text style={styles.cardLabel}>Current Turn</Text>
          <Text style={styles.turnName}>{activePlayer.name}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.info}>Tile: {TILES[activePlayer.position].name}</Text>
            <Text style={styles.info}>Cash: ${activePlayer.cash}</Text>
          </View>
          <Text style={styles.info}>Last Roll: {lastRoll ?? '-'}</Text>
          <Text style={styles.message}>{statusMessage}</Text>
          <Text style={styles.tileHint}>
            {activeTile.type !== 'property'
              ? `Special tile: ${activeTile.name} (not purchasable)`
              : isPurchasableTile
                ? `${activeTile.name} is available to buy for $${activeTile.price}.`
                : `Owned by ${activeTileOwner?.name ?? 'another player'}${activeTile.rent ? ` • Rent $${activeTile.rent}` : ''}.`}
          </Text>
        </View>

        <View style={styles.buttonsWrap}>
          {!activePlayer.isAI && (
            <TouchableOpacity
              style={[
                styles.buttonBase,
                humanTurnPhase === HUMAN_TURN_PHASES.READY_TO_ROLL ? styles.primaryButton : styles.disabledButton,
              ]}
              onPress={handleHumanRoll}
              disabled={humanTurnPhase !== HUMAN_TURN_PHASES.READY_TO_ROLL}
            >
              <Text style={styles.buttonText}>Roll Dice</Text>
            </TouchableOpacity>
          )}

          {!activePlayer.isAI && humanTurnPhase === HUMAN_TURN_PHASES.MUST_DECIDE_PROPERTY && (
            <>
              <TouchableOpacity style={[styles.buttonBase, styles.buyButton]} onPress={handleBuy}>
                <Text style={styles.buttonText}>Buy Property</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.buttonBase, styles.skipButton]} onPress={handleSkipBuy}>
                <Text style={styles.buttonText}>Skip</Text>
              </TouchableOpacity>
            </>
          )}

          {!activePlayer.isAI && humanTurnPhase === HUMAN_TURN_PHASES.READY_TO_END && (
            <TouchableOpacity style={[styles.buttonBase, styles.primaryButton]} onPress={handleEndTurn}>
              <Text style={styles.buttonText}>End Turn</Text>
            </TouchableOpacity>
          )}

          {activePlayer.isAI && (
            <TouchableOpacity style={[styles.buttonBase, styles.primaryButton]} onPress={handleAiTurn}>
              <Text style={styles.buttonText}>Run AI Turn</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardLabel}>Players</Text>
          {sortedPlayers.map((player) => (
            <View key={player.id} style={styles.playerRow}>
              <View style={[styles.playerToken, { backgroundColor: player.color }]} />
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
    backgroundColor: UI.bg,
  },
  container: {
    padding: 16,
    gap: 14,
  },
  heroCard: {
    backgroundColor: UI.panelAlt,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: UI.border,
  },
  title: {
    color: UI.text,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: UI.muted,
    fontSize: 13,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: UI.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.border,
    padding: 14,
    gap: 5,
  },
  cardLabel: {
    color: UI.muted,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  turnName: {
    color: UI.text,
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  info: {
    color: UI.text,
    fontSize: 14,
  },
  message: {
    marginTop: 8,
    color: UI.muted,
    lineHeight: 18,
    fontSize: 13,
  },
  tileHint: {
    marginTop: 4,
    color: '#D2DCFF',
    fontSize: 12,
    lineHeight: 16,
  },
  buttonsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buttonBase: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: UI.primary,
    borderColor: UI.primaryBorder,
  },
  disabledButton: {
    backgroundColor: UI.disabled,
    borderColor: '#4a5477',
  },
  buyButton: {
    backgroundColor: UI.success,
    borderColor: UI.successBorder,
  },
  skipButton: {
    backgroundColor: UI.neutral,
    borderColor: UI.neutralBorder,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerToken: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
