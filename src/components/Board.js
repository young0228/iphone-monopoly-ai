import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BOARD_POSITIONS, TILES } from '../game/gameData';

const PALETTE = {
  frame: '#0A1022',
  board: '#121B36',
  border: '#3E4F81',
  tileProperty: '#24345E',
  tileSpecial: '#1A2546',
  tileCorner: '#2A3E7B',
  center: '#0E1730',
  text: '#EEF4FF',
  muted: '#B6C3EA',
  specialMuted: '#91A2D2',
  ownerRingBg: '#091126',
};

const GROUP_COLORS = {
  brown: '#9C6B3D',
  lightBlue: '#72D6FF',
  pink: '#F883D4',
  orange: '#FFA74E',
  red: '#FF6B6B',
  yellow: '#FFD84D',
  green: '#4EDB91',
  darkBlue: '#3E5BFF',
};

const BOARD_SIZE = 11;
const CORNER_INDEXES = new Set([0, 10, 20, 30]);

function tileIndexAt(row, col) {
  return BOARD_POSITIONS.findIndex((p) => p.row === row && p.col === col);
}

function ownerForTile(tileId, players) {
  return players.find((p) => p.properties.includes(tileId));
}

function specialIconForTile(tile) {
  if (tile.name.includes('Chance')) return '?';
  if (tile.name.includes('Community Chest')) return 'CC';
  if (tile.name.includes('Tax')) return '$';
  if (tile.name.includes('Jail')) return 'J';
  if (tile.name.includes('Parking')) return 'P';
  if (tile.name === 'GO') return 'GO';
  return '•';
}

function tokenSlotStyle(index) {
  const slots = [
    { top: 1, left: 1 },
    { top: 1, right: 1 },
    { bottom: 1, left: 1 },
    { bottom: 1, right: 1 },
  ];
  return slots[index] ?? slots[slots.length - 1];
}

export default function Board({ players }) {
  return (
    <View style={styles.perspectiveShell}>
      <View style={styles.frameShadow} />
      <View style={styles.frame}>
        <View style={styles.board}>
          {Array.from({ length: BOARD_SIZE }).map((_, row) => (
            <View key={`row-${row}`} style={styles.row}>
              {Array.from({ length: BOARD_SIZE }).map((__, col) => {
                const tileIndex = tileIndexAt(row, col);

                if (tileIndex < 0) {
                  return (
                    <View key={`empty-${row}-${col}`} style={styles.centerCell}>
                      {row === 5 && col === 5 ? (
                        <View style={styles.centerBadge}>
                          <Text style={styles.centerTitle}>MONOPOLY</Text>
                        </View>
                      ) : null}
                    </View>
                  );
                }

                const tile = TILES[tileIndex];
                const playersOnTile = players.filter((player) => player.position === tile.id);
                const isCorner = CORNER_INDEXES.has(tileIndex);
                const isProperty = tile.type === 'property';
                const owner = ownerForTile(tile.id, players);
                const groupColor = tile.colorGroup ? GROUP_COLORS[tile.colorGroup] : '#56648A';

                return (
                  <View
                    key={tile.id}
                    style={[
                      styles.tile,
                      isProperty ? styles.propertyTile : styles.nonPropertyTile,
                      isCorner ? styles.cornerTile : null,
                    ]}
                  >
                    {isProperty ? (
                      <View style={[styles.propertyStrip, { backgroundColor: groupColor }]} />
                    ) : (
                      <View style={styles.nonPropertyHeader}>
                        <Text style={styles.nonPropertyIcon}>{specialIconForTile(tile)}</Text>
                      </View>
                    )}

                    <View style={styles.tileBody}>
                      <View style={styles.tileHeaderRow}>
                        <Text numberOfLines={3} style={[styles.tileName, isCorner ? styles.cornerName : null]}>
                          {tile.name}
                        </Text>
                        {owner ? (
                          <View style={[styles.ownerRing, { borderColor: owner.color }]}>
                            <View style={[styles.ownerDot, { backgroundColor: owner.color }]} />
                          </View>
                        ) : null}
                      </View>

                      <Text style={[styles.tilePrice, isProperty ? styles.propertyPrice : styles.nonPropertyPrice]}>
                        {isProperty ? `$${tile.price}` : 'Special'}
                      </Text>
                    </View>

                    <View style={styles.tokenDock}>
                      {playersOnTile.map((player, index) => (
                        <View
                          key={player.id}
                          style={[
                            styles.tokenShell,
                            tokenSlotStyle(index),
                            { borderColor: player.id === 'human' ? '#FFFFFF' : player.color },
                            player.id === 'human' ? styles.humanTokenShell : null,
                          ]}
                        >
                          <View style={[styles.tokenCore, { backgroundColor: player.color }]} />
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  perspectiveShell: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 10,
    position: 'relative',
    transform: [{ scaleY: 0.95 }],
  },
  frameShadow: {
    ...StyleSheet.absoluteFillObject,
    top: 14,
    left: 12,
    right: -8,
    bottom: -8,
    borderRadius: 24,
    backgroundColor: '#060a16',
    opacity: 0.65,
  },
  frame: {
    flex: 1,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2A3A69',
    backgroundColor: PALETTE.frame,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 12,
  },
  board: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: PALETTE.border,
    backgroundColor: PALETTE.board,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  tile: {
    flex: 1,
    borderWidth: 0.8,
    borderColor: '#4F65A0',
    overflow: 'visible',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 2.4,
  },
  propertyTile: {
    backgroundColor: PALETTE.tileProperty,
  },
  nonPropertyTile: {
    backgroundColor: PALETTE.tileSpecial,
  },
  cornerTile: {
    backgroundColor: PALETTE.tileCorner,
    borderWidth: 1.6,
    transform: [{ scale: 1.08 }],
    zIndex: 30,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 4.2,
  },
  propertyStrip: {
    height: 7,
    borderBottomWidth: 0.8,
    borderBottomColor: '#0a1226',
  },
  nonPropertyHeader: {
    height: 7,
    backgroundColor: '#334675',
    borderBottomWidth: 0.8,
    borderBottomColor: '#0a1226',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonPropertyIcon: {
    color: '#E6EEFF',
    fontSize: 6,
    fontWeight: '800',
  },
  tileBody: {
    flex: 1,
    paddingHorizontal: 4,
    paddingTop: 3,
    paddingBottom: 17,
    justifyContent: 'space-between',
    gap: 2,
  },
  tileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 2,
  },
  tileName: {
    color: PALETTE.text,
    fontSize: 8.2,
    lineHeight: 9.6,
    fontWeight: '700',
    flex: 1,
  },
  cornerName: {
    fontSize: 9.4,
    lineHeight: 10.4,
  },
  tilePrice: {
    fontSize: 7.6,
    fontWeight: '700',
  },
  propertyPrice: {
    color: '#ECF3FF',
  },
  nonPropertyPrice: {
    color: PALETTE.specialMuted,
  },
  ownerRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.ownerRingBg,
    marginTop: 1,
  },
  ownerDot: {
    width: 4.2,
    height: 4.2,
    borderRadius: 2.1,
  },
  centerCell: {
    flex: 1,
    backgroundColor: PALETTE.center,
  },
  centerBadge: {
    alignSelf: 'center',
    marginTop: 2,
    backgroundColor: '#121D3B',
    borderColor: '#2C3E72',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  centerTitle: {
    color: '#D9E6FF',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tokenDock: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 36,
    height: 36,
    zIndex: 20,
    elevation: 8,
  },
  tokenShell: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.8,
    backgroundColor: '#0A142E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1.6,
  },
  humanTokenShell: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#91BBFF',
    shadowOpacity: 0.95,
    shadowRadius: 4.2,
    shadowOffset: { width: 0, height: 0 },
  },
  tokenCore: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
