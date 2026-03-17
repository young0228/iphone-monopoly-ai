import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BOARD_POSITIONS, TILES } from '../game/gameData';

const PALETTE = {
  frame: '#0B1125',
  board: '#111A34',
  border: '#384773',
  tileBase: '#1A2648',
  corner: '#273C78',
  center: '#0D1530',
  text: '#EAF0FF',
  muted: '#A4B2DF',
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

              return (
                <View key={tile.id} style={[styles.tile, isCorner ? styles.cornerTile : null]}>
                  {isProperty ? (
                    <View style={[styles.propertyStrip, { backgroundColor: groupColor }]} />
                  ) : (
                    <View style={styles.neutralStrip} />
                  )}

                  <View style={styles.tileBody}>
                    <View style={styles.tileHeaderRow}>
                      <Text numberOfLines={1} style={[styles.tileName, isCorner ? styles.cornerTileName : null]}>
                        {tile.name}
                      </Text>
                      {owner ? (
                        <View style={[styles.ownerRing, { borderColor: owner.color }]}>
                          <View style={[styles.ownerDot, { backgroundColor: owner.color }]} />
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.tilePrice}>{isProperty ? `$${tile.price}` : '•'}</Text>
                    <View style={styles.tokensWrap}>
                      {playersOnTile.map((player) => (
                        <View key={player.id} style={[styles.tokenRing, { borderColor: player.color }]}>
                          <View style={[styles.tokenCore, { backgroundColor: player.color }]} />
                        </View>
                      ))}
                    </View>
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
    borderWidth: 0.5,
    borderColor: PALETTE.border,
    backgroundColor: PALETTE.tileBase,
    overflow: 'hidden',
  },
  cornerTile: {
    backgroundColor: PALETTE.corner,
    borderWidth: 1.2,
  },
  propertyStrip: {
    height: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#0b1022',
  },
  neutralStrip: {
    height: 5,
    backgroundColor: '#4C5A84',
    borderBottomWidth: 0.5,
    borderBottomColor: '#0b1022',
  },
  tileBody: {
    flex: 1,
    padding: 3,
    justifyContent: 'space-between',
  },
  tileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 2,
  },
  tileName: {
    color: PALETTE.text,
    fontSize: 7,
    fontWeight: '700',
    flex: 1,
  },
  cornerTileName: {
    fontSize: 8,
  },
  tilePrice: {
    color: PALETTE.muted,
    fontSize: 7,
  },
  ownerRing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.ownerRingBg,
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
  tokensWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
  },
  tokenRing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: '#091022',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenCore: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
