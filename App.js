import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
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
};

const HUMAN_TURN_PHASES = {
  READY_TO_ROLL: 'ready_to_roll',
  MUST_DECIDE_PROPERTY: 'must_decide_property',
  READY_TO_END: 'ready_to_end',
};

export default function App() {
  const { height: screenHeight } = useWindowDimensions();
  const [players, setPlayers] = useState(createInitialPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [lastRoll, setLastRoll] = useState(null);
  const [latestActionLog, setLatestActionLog] = useState('Tap Roll Dice to begin.');
  const [lastAiMoveLog, setLastAiMoveLog] = useState('No AI move yet.');
  const [humanTurnPhase, setHumanTurnPhase] = useState(HUMAN_TURN_PHASES.READY_TO_ROLL);

  const activePlayer = players[currentPlayerIndex];
  const activeTile = TILES[activePlayer.position];
  const activeTileOwner = players.find((player) => player.properties.includes(activeTile.id));
  const isPurchasableTile = activeTile.type === 'property' && !activeTileOwner;

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => (a.isAI === b.isAI ? 0 : a.isAI ? 1 : -1)),
    [players],
  );
  const boardHeight = Math.round(screenHeight * 0.7);

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
    setLatestActionLog(`${activePlayer.name} rolled ${roll.total}. ${landing.message}`);

    if (landing.canBuy) {
      setHumanTurnPhase(HUMAN_TURN_PHASES.MUST_DECIDE_PROPERTY);
      return;
    }

    if (roll.extraRollGranted) {
      setHumanTurnPhase(HUMAN_TURN_PHASES.READY_TO_ROLL);
      setLatestActionLog(`${activePlayer.name} rolled ${roll.total}. ${landing.message} Roll again for doubles.`);
      return;
    }

    setHumanTurnPhase(HUMAN_TURN_PHASES.READY_TO_END);
  };

  const handleBuy = () => {
    if (activePlayer.isAI || humanTurnPhase !== HUMAN_TURN_PHASES.MUST_DECIDE_PROPERTY) {
      return;
    }

    const purchase = buyProperty(players, currentPlayerIndex);
    setPlayers(purchase.players);
    setLatestActionLog(purchase.message);
    setHumanTurnPhase(HUMAN_TURN_PHASES.READY_TO_END);
    goToNextPlayer();
  };

  const handleSkipBuy = () => {
    if (activePlayer.isAI || humanTurnPhase !== HUMAN_TURN_PHASES.MUST_DECIDE_PROPERTY) {
      return;
    }

    setLatestActionLog(`${activePlayer.name} skipped buying ${activeTile.name}.`);
    setHumanTurnPhase(HUMAN_TURN_PHASES.READY_TO_END);
    goToNextPlayer();
  };

  const handleEndTurn = () => {
    if (activePlayer.isAI || humanTurnPhase !== HUMAN_TURN_PHASES.READY_TO_END) {
      return;
    }
    setLatestActionLog(`${activePlayer.name} ended the turn.`);
    goToNextPlayer();
  };

  const handleAiTurn = () => {
    if (!activePlayer.isAI) {
      return;
    }

    const result = runAiTurn(players, currentPlayerIndex);
    const aiLog = `${activePlayer.name} rolled ${result.total}. ${result.message}`;
    setPlayers(result.players);
    setLastRoll(result.total);
    setLatestActionLog(aiLog);
    setLastAiMoveLog(aiLog);
    goToNextPlayer();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>Monopoly MVP</Text>
          <Text style={styles.subtitle}>Single Player • 3 AI Opponents</Text>
        </View>

        <View style={[styles.boardStage, { minHeight: boardHeight }]}>
          <Board players={players} activePosition={activePlayer.position} />
        </View>

        <View style={styles.bottomOverlay}>
          <View style={styles.overlayTopRow}>
            <View style={[styles.infoCard, styles.currentTurnCard]}>
              <Text style={styles.cardLabel}>Current Turn</Text>
              <Text style={styles.turnName}>{activePlayer.name}</Text>
              <View style={styles.statsRow}>
                <Text style={styles.info}>Tile: {activeTile.name}</Text>
                <Text style={styles.info}>Cash: ${activePlayer.cash}</Text>
              </View>
              <Text style={styles.info}>Last Roll: {lastRoll ?? '-'}</Text>
              <Text style={styles.tileHint}>
                {activeTile.type !== 'property'
                  ? `Special tile: ${activeTile.name} (not purchasable)`
                  : isPurchasableTile
                    ? `${activeTile.name} is available to buy for $${activeTile.price}.`
                    : `Owned by ${activeTileOwner?.name ?? 'another player'}${activeTile.rent ? ` • Rent $${activeTile.rent}` : ''}.`}
              </Text>
            </View>

            <View style={[styles.infoCard, styles.logCard]}>
              <Text style={styles.cardLabel}>Action Log</Text>
              <Text style={styles.message}>{latestActionLog}</Text>
              <Text style={styles.aiLog}>Last AI Move: {lastAiMoveLog}</Text>
            </View>
          </View>

          <View style={styles.buttonsWrap}>
            {!activePlayer.isAI && humanTurnPhase === HUMAN_TURN_PHASES.READY_TO_ROLL && (
              <TouchableOpacity style={[styles.buttonBase, styles.primaryButton]} onPress={handleHumanRoll}>
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

          <View style={[styles.infoCard, styles.playersCard]}>
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
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
  },
  heroCard: {
    backgroundColor: UI.panelAlt,
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: UI.border,
    marginBottom: 6,
  },
  title: {
    color: UI.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: UI.muted,
    fontSize: 12,
    marginTop: 2,
  },
  boardStage: {
    flex: 1,
    marginBottom: 6,
  },
  bottomOverlay: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 6,
    backgroundColor: 'rgba(11, 18, 40, 0.96)',
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 16,
    padding: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 14,
  },
  overlayTopRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoCard: {
    backgroundColor: UI.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI.border,
    padding: 10,
    gap: 4,
  },
  currentTurnCard: {
    flex: 1.15,
  },
  logCard: {
    flex: 0.85,
  },
  playersCard: {
    paddingTop: 8,
    paddingBottom: 8,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  info: {
    color: UI.text,
    fontSize: 12,
  },
  message: {
    marginTop: 2,
    color: '#DDE7FF',
    lineHeight: 16,
    fontSize: 12,
  },
  aiLog: {
    marginTop: 2,
    color: UI.muted,
    lineHeight: 15,
    fontSize: 11,
  },
  tileHint: {
    marginTop: 2,
    color: '#D2DCFF',
    fontSize: 11,
    lineHeight: 14,
  },
  buttonsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  buttonBase: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: UI.primary,
    borderColor: UI.primaryBorder,
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
    fontSize: 13,
    fontWeight: '700',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerToken: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
