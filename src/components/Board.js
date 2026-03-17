import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BOARD_POSITIONS, TILES } from '../game/gameData';

const PALETTE = {
  frame: '#0B1125',
  board: '#111A34',
  border: '#384773',
  tileBase: '#1A2648',
  propertyTile: '#202D53',
  specialTile: '#18223F',
  corner: '#2A3E7B',
  center: '#0D1530',
  text: '#EAF0FF',
  muted: '#A4B2DF',
  specialMuted: '#8A9ACB',
  ownerRingBg: '#081024',
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
    <View style={styles.frame}>
      <View style={styles.board}>
        {Array.from({ length: BOARD_SIZE }).map((_, row) => (
          <View key={`row-${row}`} style={styles.row}>
            {Array.from({ length: BOARD_SIZE }).map((__, col) => {
              const tileIndex = tileIndexAt(row, col);

              if (tileIndex < 0) {
                return <View key={`empty-${row}-${col}`} style={styles.centerCell} />;
              }

              const tile = TILES[tileIndex];
              const playersOnTile = players.filter((player) => player.position === tile.id);
              const isCorner = CORNER_INDEXES.has(tileIndex);
              const isProperty = tile.type === 'property';
              const owner = ownerForTile(tile.id, players);
              const groupColor = tile.colorGroup ? GROUP_COLORS[tile.colorGroup] : '#556287';
              const isHorizontalEdge = row === 0 || row === 10;

              return (
                <View
                  key={tile.id}
                  style={[
                    styles.tile,
                    isProperty ? styles.propertyTile : styles.nonPropertyTile,
                    isHorizontalEdge ? styles.horizontalEdgeTile : null,
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
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.tileName,
                          isProperty ? styles.propertyName : styles.nonPropertyName,
                          isCorner ? styles.cornerTileName : null,
                          isHorizontalEdge ? styles.horizontalTileName : null,
                        ]}
                      >
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
                          { borderColor: player.color },
                          player.id === 'human' ? styles.humanTokenShell : null,
                        ]}
                      >
                        <View
                          style={[
                            styles.tokenCore,
                            { backgroundColor: player.color },
                            player.id === 'human' ? styles.humanTokenCore : null,
                          ]}
                        />
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
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: PALETTE.frame,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2A3A69',
  },
  board: {
    width: '100%',
    aspectRatio: 1,
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
    borderWidth: 0.6,
    borderColor: PALETTE.border,
    overflow: 'hidden',
    position: 'relative',
  },
  propertyTile: {
    backgroundColor: PALETTE.propertyTile,
  },
  nonPropertyTile: {
    backgroundColor: PALETTE.specialTile,
  },
  horizontalEdgeTile: {
    paddingBottom: 1,
  },
  cornerTile: {
    backgroundColor: PALETTE.corner,
    borderWidth: 1.6,
  },
  propertyStrip: {
    height: 7,
    borderBottomWidth: 0.6,
    borderBottomColor: '#0b1022',
  },
  nonPropertyHeader: {
    height: 7,
    backgroundColor: '#2F3E66',
    borderBottomWidth: 0.6,
    borderBottomColor: '#0b1022',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonPropertyIcon: {
    color: '#DBE6FF',
    fontSize: 6,
    fontWeight: '800',
  },
  tileBody: {
    flex: 1,
    paddingHorizontal: 3,
    paddingVertical: 2,
    justifyContent: 'space-between',
    gap: 1,
    paddingBottom: 18,
  },
  tileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 2,
  },
  tileName: {
    color: PALETTE.text,
    fontWeight: '700',
    flex: 1,
    lineHeight: 8,
  },
  propertyName: {
    fontSize: 7,
  },
  nonPropertyName: {
    fontSize: 6.5,
    color: '#D5E1FF',
  },
  horizontalTileName: {
    fontSize: 7.4,
    lineHeight: 8.4,
  },
  cornerTileName: {
    fontSize: 8.2,
    lineHeight: 9,
  },
  tilePrice: {
    fontSize: 6.5,
    fontWeight: '700',
  },
  propertyPrice: {
    color: '#EAF0FF',
  },
  nonPropertyPrice: {
    color: PALETTE.specialMuted,
    fontWeight: '600',
  },
  ownerRing: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.ownerRingBg,
    marginTop: 1,
  },
  ownerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  centerCell: {
    flex: 1,
    backgroundColor: PALETTE.center,
  },
  tokenDock: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 32,
    height: 32,
    zIndex: 12,
    elevation: 6,
  },
  tokenShell: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.6,
    backgroundColor: '#0A142F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1.5,
  },
  humanTokenShell: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderColor: '#FFFFFF',
    shadowColor: '#9EC5FF',
    shadowOpacity: 0.95,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  tokenCore: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  humanTokenCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
