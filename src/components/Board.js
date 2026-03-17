import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BOARD_POSITIONS, TILES } from '../game/gameData';

const PALETTE = {
  frame: '#0B1125',
  board: '#111A34',
  border: '#384773',
  edgeTile: '#1C294D',
  topStripe: '#415A9A',
  rightStripe: '#537D5B',
  bottomStripe: '#9B6C3F',
  leftStripe: '#7E4B7E',
  corner: '#273C78',
  center: '#0D1530',
  text: '#EAF0FF',
  muted: '#A4B2DF',
};

const BOARD_SIZE = 11;
const CORNER_INDEXES = new Set([0, 10, 20, 30]);

function tileIndexAt(row, col) {
  return BOARD_POSITIONS.findIndex((p) => p.row === row && p.col === col);
}

function stripeStyle(index) {
  if (index <= 10) {
    return styles.topStripe;
  }
  if (index <= 20) {
    return styles.rightStripe;
  }
  if (index <= 30) {
    return styles.bottomStripe;
  }
  return styles.leftStripe;
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

              return (
                <View
                  key={tile.id}
                  style={[
                    styles.tile,
                    stripeStyle(tileIndex),
                    isCorner ? styles.cornerTile : null,
                  ]}
                >
                  <Text numberOfLines={1} style={[styles.tileName, isCorner ? styles.cornerTileName : null]}>
                    {tile.name}
                  </Text>
                  <Text style={styles.tilePrice}>{tile.type === 'property' ? `$${tile.price}` : '•'}</Text>
                  <View style={styles.tokensWrap}>
                    {playersOnTile.map((player) => (
                      <View key={player.id} style={[styles.tokenRing, { borderColor: player.color }]}>
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
    padding: 3,
    justifyContent: 'space-between',
  },
  topStripe: {
    backgroundColor: PALETTE.topStripe,
  },
  rightStripe: {
    backgroundColor: PALETTE.rightStripe,
  },
  bottomStripe: {
    backgroundColor: PALETTE.bottomStripe,
  },
  leftStripe: {
    backgroundColor: PALETTE.leftStripe,
  },
  cornerTile: {
    backgroundColor: PALETTE.corner,
    borderWidth: 1.4,
  },
  centerCell: {
    flex: 1,
    backgroundColor: PALETTE.center,
  },
  tileName: {
    color: PALETTE.text,
    fontSize: 7,
    fontWeight: '700',
  },
  cornerTileName: {
    fontSize: 8,
  },
  tilePrice: {
    color: PALETTE.muted,
    fontSize: 7,
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
