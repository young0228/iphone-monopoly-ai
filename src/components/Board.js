import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BOARD_POSITIONS, TILES } from '../game/gameData';

const PALETTE = {
  frame: '#0E1530',
  boardBg: '#131B35',
  border: '#34406A',
  tile: '#1B2547',
  tileInner: '#202C52',
  go: '#2A5CFF',
  special: '#313D63',
  text: '#E8EEFF',
  muted: '#A0ADDA',
};

function tileForGridCell(row, col) {
  const index = BOARD_POSITIONS.findIndex((pos) => pos.row === row && pos.col === col);
  return index >= 0 ? TILES[index] : null;
}

function isEdge(row, col, size) {
  return row === 0 || col === 0 || row === size - 1 || col === size - 1;
}

export default function Board({ players }) {
  const gridSize = 4;

  return (
    <View style={styles.frame}>
      <View style={styles.board}>
        {Array.from({ length: gridSize }).map((_, row) => (
          <View key={`row-${row}`} style={styles.row}>
            {Array.from({ length: gridSize }).map((__, col) => {
              const tile = tileForGridCell(row, col);

              if (!tile) {
                return (
                  <View key={`empty-${row}-${col}`} style={[styles.cell, styles.centerCell]}>
                    <Text style={styles.centerText}>CENTER</Text>
                  </View>
                );
              }

              const playersOnTile = players.filter((player) => player.position === tile.id);
              const styleList = [
                styles.cell,
                isEdge(row, col, gridSize) ? styles.edgeCell : styles.innerCell,
                tile.id === 0 ? styles.goCell : null,
                tile.type === 'rest' ? styles.specialCell : null,
              ];

              return (
                <View key={tile.id} style={styleList}>
                  <Text numberOfLines={1} style={styles.tileName}>
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
    borderColor: '#2A3863',
  },
  board: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: PALETTE.border,
    backgroundColor: PALETTE.boardBg,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 5,
    justifyContent: 'space-between',
  },
  edgeCell: {
    backgroundColor: PALETTE.tile,
  },
  innerCell: {
    backgroundColor: PALETTE.tileInner,
  },
  goCell: {
    backgroundColor: PALETTE.go,
  },
  specialCell: {
    backgroundColor: PALETTE.special,
  },
  centerCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    color: PALETTE.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tileName: {
    color: PALETTE.text,
    fontSize: 10,
    fontWeight: '700',
  },
  tilePrice: {
    color: PALETTE.muted,
    fontSize: 10,
  },
  tokensWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  tokenRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A1126',
  },
  tokenCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
