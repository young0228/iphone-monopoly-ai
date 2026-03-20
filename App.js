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

  const renderTurnActions = () => {
    if (!activePlayer.isAI && humanTurnPhase === HUMAN_TURN_PHASES.READY_TO_ROLL) {
      return (
        <TouchableOpacity style={[styles.buttonBase, styles.primaryButton]} onPress={handleHumanRoll}>
          <Text style={styles.buttonText}>Roll Dice</Text>
        </TouchableOpacity>
      );
    }

    if (!activePlayer.isAI && humanTurnPhase === HUMAN_TURN_PHASES.MUST_DECIDE_PROPERTY) {
      return (
        <View style={styles.dualActionRow}>
          <TouchableOpacity style={[styles.buttonBase, styles.buyButton, styles.flexButton]} onPress={handleBuy}>
            <Text style={styles.buttonText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonBase, styles.skipButton, styles.flexButton]} onPress={handleSkipBuy}>
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!activePlayer.isAI && humanTurnPhase === HUMAN_TURN_PHASES.READY_TO_END) {
      return (
        <TouchableOpacity style={[styles.buttonBase, styles.primaryButton]} onPress={handleEndTurn}>
          <Text style={styles.buttonText}>End Turn</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={[styles.buttonBase, styles.primaryButton]} onPress={handleAiTurn}>
        <Text style={styles.buttonText}>Run AI Turn</Text>
      </TouchableOpacity>
    );
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
          <View style={styles.hudMainRow}>
            <View style={styles.turnSection}>
              <Text style={styles.cardLabel}>Current Turn</Text>
              <Text style={styles.turnName}>{activePlayer.name}</Text>
              <Text style={styles.info}>Tile: {activeTile.name}</Text>
              <Text style={styles.info}>Cash ${activePlayer.cash} • Roll {lastRoll ?? '-'}</Text>
              <Text style={styles.tileHint} numberOfLines={2}>
                {activeTile.type !== 'property'
                  ? `${activeTile.name} is a special tile`
                  : isPurchasableTile
                    ? `${activeTile.name} available for $${activeTile.price}`
                    : `Owned by ${activeTileOwner?.name ?? 'another player'}${activeTile.rent ? ` • Rent $${activeTile.rent}` : ''}`}
              </Text>
              <View style={styles.turnActionWrap}>{renderTurnActions()}</View>
            </View>

            <View style={styles.logSection}>
              <Text style={styles.cardLabel}>Latest Move</Text>
              <Text style={styles.message} numberOfLines={3}>
                {latestActionLog}
              </Text>
              <Text style={styles.aiLog} numberOfLines={2}>
                AI: {lastAiMoveLog}
              </Text>
            </View>
          </View>

          <View style={styles.playersStrip}>
            <Text style={[styles.cardLabel, styles.playersLabel]}>Players</Text>
            {sortedPlayers.map((player) => (
              <View key={player.id} style={styles.playerChip}>
                <View style={[styles.playerToken, { backgroundColor: player.color }]} />
                <Text style={styles.playerChipText}>
                  {player.name} ${player.cash} · {player.properties.length}
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
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 14,
  },
  hudMainRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'stretch',
  },
  turnSection: {
    flex: 1.2,
    backgroundColor: UI.panel,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: UI.border,
    padding: 8,
    gap: 2,
  },
  logSection: {
    flex: 0.8,
    backgroundColor: UI.panel,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: UI.border,
    padding: 8,
    gap: 2,
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  info: {
    color: UI.text,
    fontSize: 11,
  },
  message: {
    marginTop: 2,
    color: '#DDE7FF',
    lineHeight: 16,
    fontSize: 11.5,
  },
  aiLog: {
    marginTop: 2,
    color: UI.muted,
    lineHeight: 15,
    fontSize: 10.5,
  },
  tileHint: {
    marginTop: 2,
    color: '#D2DCFF',
    fontSize: 10.5,
    lineHeight: 13,
  },
  turnActionWrap: {
    marginTop: 4,
  },
  buttonBase: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dualActionRow: {
    flexDirection: 'row',
    gap: 5,
  },
  flexButton: {
    flex: 1,
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
    fontSize: 12,
    fontWeight: '700',
  },
  playersStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  playersLabel: {
    marginRight: 2,
  },
  playerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#2C3A64',
    backgroundColor: '#121C3D',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  playerChipText: {
    color: UI.text,
    fontSize: 10.5,
  },
  playerToken: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
