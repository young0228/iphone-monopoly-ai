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
  centerPanel: '#16244A',
  centerPanelBorder: '#314A83',
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

// Larger perimeter proportions for portrait readability.
const EDGE_ROW_WEIGHT = 2.1;
const EDGE_COL_WEIGHT = 3.2;
const INNER_WEIGHT = 1;
const ROW_WEIGHTS = [EDGE_ROW_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, EDGE_ROW_WEIGHT];
const COL_WEIGHTS = [EDGE_COL_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, INNER_WEIGHT, EDGE_COL_WEIGHT];

function total(weights) {
  return weights.reduce((sum, value) => sum + value, 0);
}

function sumRange(weights, start, endExclusive) {
  return weights.slice(start, endExclusive).reduce((sum, value) => sum + value, 0);
}

const ROW_TOTAL = total(ROW_WEIGHTS);
const COL_TOTAL = total(COL_WEIGHTS);

// Center panel spans inner 9x9 area (rows/cols 1..9).
const CENTER_LEFT = (sumRange(COL_WEIGHTS, 0, 1) / COL_TOTAL) * 100;
const CENTER_TOP = (sumRange(ROW_WEIGHTS, 0, 1) / ROW_TOTAL) * 100;
const CENTER_WIDTH = (sumRange(COL_WEIGHTS, 1, 10) / COL_TOTAL) * 100;
const CENTER_HEIGHT = (sumRange(ROW_WEIGHTS, 1, 10) / ROW_TOTAL) * 100;
const CENTER_INSET = 16;
const CENTER_PANEL_STYLE = {
  left: `${CENTER_LEFT + (CENTER_WIDTH * CENTER_INSET) / 100}%`,
  top: `${CENTER_TOP + (CENTER_HEIGHT * CENTER_INSET) / 100}%`,
  width: `${CENTER_WIDTH * (1 - (CENTER_INSET * 2) / 100)}%`,
  height: `${CENTER_HEIGHT * (1 - (CENTER_INSET * 2) / 100)}%`,
};

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
    { top: 6, left: 6 },
    { top: 6, right: 6 },
    { bottom: 6, left: 6 },
    { bottom: 6, right: 6 },
  ];
  return slots[index] ?? slots[slots.length - 1];
}

export default function Board({ players, activePosition }) {
  return (
    <View style={styles.perspectiveShell}>
      <View style={styles.frameShadow} />
      <View style={styles.frame}>
        <View style={styles.board}>
          <View style={[styles.centerPanel, CENTER_PANEL_STYLE]}>
            <Text style={styles.centerTitle}>MONOPOLY</Text>
            <Text style={styles.centerSubtitle}>iPhone MVP Edition</Text>
          </View>

          {Array.from({ length: BOARD_SIZE }).map((_, row) => (
            <View key={`row-${row}`} style={[styles.row, { flex: ROW_WEIGHTS[row] }]}>
              {Array.from({ length: BOARD_SIZE }).map((__, col) => {
                const tileIndex = tileIndexAt(row, col);

                if (tileIndex < 0) {
                  return <View key={`empty-${row}-${col}`} style={[styles.centerCell, { flex: COL_WEIGHTS[col] }]} />;
                }

                const tile = TILES[tileIndex];
                const playersOnTile = players.filter((player) => player.position === tile.id);
                const isCorner = CORNER_INDEXES.has(tileIndex);
                const isSideEdge = col === 0 || col === BOARD_SIZE - 1;
                const isProperty = tile.type === 'property';
                const isActiveTile = tile.id === activePosition;
                const owner = ownerForTile(tile.id, players);
                const groupColor = tile.colorGroup ? GROUP_COLORS[tile.colorGroup] : '#56648A';

                return (
                  <View
                    key={tile.id}
                    style={[
                      styles.tile,
                      { flex: COL_WEIGHTS[col] },
                      isProperty ? styles.propertyTile : styles.nonPropertyTile,
                      isSideEdge ? styles.sideEdgeTile : null,
                      isCorner ? styles.cornerTile : null,
                      isActiveTile ? styles.activeTile : null,
                    ]}
                  >
                    {isProperty ? (
                      <View style={[styles.propertyStrip, { backgroundColor: groupColor }]} />
                    ) : (
                      <View style={styles.nonPropertyHeader}>
                        <Text style={styles.nonPropertyIcon}>{specialIconForTile(tile)}</Text>
                      </View>
                    )}

                    <View style={[styles.tileBody, isSideEdge ? styles.sideEdgeBody : null]}>
                      <View style={styles.tileHeaderRow}>
                        <Text numberOfLines={2} style={[styles.tileName, isSideEdge ? styles.sideEdgeName : null, isCorner ? styles.cornerName : null]}>
                          {displayTileName(tile, isSideEdge)}
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
    transform: [{ scaleY: 0.99 }],
  },
  frameShadow: {
    ...StyleSheet.absoluteFillObject,
    top: 16,
    left: 12,
    right: -10,
    bottom: -10,
    borderRadius: 24,
    backgroundColor: '#050913',
    opacity: 0.7,
  },
  frame: {
    flex: 1,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2A3A69',
    backgroundColor: PALETTE.frame,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.58,
    shadowRadius: 12,
    elevation: 14,
  },
  board: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: PALETTE.border,
    backgroundColor: PALETTE.board,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    borderWidth: 0.9,
    borderColor: '#5269A6',
    overflow: 'visible',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3.2,
  },
  propertyTile: {
    backgroundColor: PALETTE.tileProperty,
  },
  nonPropertyTile: {
    backgroundColor: PALETTE.tileSpecial,
  },
  sideEdgeTile: {
    borderColor: '#5D75B5',
  },
  activeTile: {
    borderColor: '#EAF2FF',
    borderWidth: 2.2,
    shadowColor: '#9BC0FF',
    shadowOpacity: 0.75,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 40,
    elevation: 22,
  },
  cornerTile: {
    backgroundColor: PALETTE.tileCorner,
    borderWidth: 2,
    transform: [{ scale: 1.1 }],
    zIndex: 30,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.46,
    shadowRadius: 4.4,
  },
  propertyStrip: {
    height: 8,
    borderBottomWidth: 0.8,
    borderBottomColor: '#0a1226',
  },
  nonPropertyHeader: {
    height: 8,
    backgroundColor: '#334675',
    borderBottomWidth: 0.8,
    borderBottomColor: '#0a1226',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonPropertyIcon: {
    color: '#E6EEFF',
    fontSize: 6.5,
    fontWeight: '800',
  },
  tileBody: {
    flex: 1,
    paddingHorizontal: 6,
    paddingTop: 5,
    paddingBottom: 20,
    justifyContent: 'space-between',
    gap: 3,
  },
  sideEdgeMinimalBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 18,
  },
  sideEdgeGlyph: {
    color: '#CFE0FF',
    fontSize: 10,
    fontWeight: '800',
  },
  tileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 3,
  },
  tileName: {
    color: PALETTE.text,
    fontSize: 9.8,
    lineHeight: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  cornerName: {
    fontSize: 11.2,
    lineHeight: 12.6,
  },
  tilePrice: {
    fontSize: 8.8,
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
    backgroundColor: PALETTE.center,
  },
  centerPanel: {
    position: 'absolute',
    backgroundColor: PALETTE.centerPanel,
    borderWidth: 1,
    borderColor: PALETTE.centerPanelBorder,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 9,
    zIndex: 2,
  },
  centerTitle: {
    color: '#E4EEFF',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: 2,
  },
  centerSubtitle: {
    color: '#97ABD9',
    fontSize: 12,
    marginTop: 4,
  },
  tokenDock: {
    position: 'absolute',
    left: '50%',
    top: '56%',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    zIndex: 20,
    elevation: 9,
  },
  tokenShell: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.9,
    backgroundColor: '#0A142E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1.8,
  },
  humanTokenShell: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#91BBFF',
    shadowOpacity: 0.95,
    shadowRadius: 4.4,
    shadowOffset: { width: 0, height: 0 },
  },
  tokenCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
