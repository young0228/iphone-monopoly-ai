import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BOARD_POSITIONS, TILES } from '../game/gameData';

function tileForGridCell(row, col) {
  const index = BOARD_POSITIONS.findIndex((pos) => pos.row === row && pos.col === col);
  return index >= 0 ? TILES[index] : null;
}

export default function Board({ players }) {
  const gridSize = 4;

  return (
    <View style={styles.board}>
      {Array.from({ length: gridSize }).map((_, row) => (
        <View key={`row-${row}`} style={styles.row}>
          {Array.from({ length: gridSize }).map((__, col) => {
            const tile = tileForGridCell(row, col);

            if (!tile) {
              return <View key={`empty-${row}-${col}`} style={[styles.cell, styles.centerCell]} />;
            }

            const playersOnTile = players.filter((player) => player.position === tile.id);

            return (
              <View key={tile.id} style={styles.cell}>
                <Text style={styles.tileName}>{tile.name}</Text>
                {tile.type === 'property' ? (
                  <Text style={styles.tilePrice}>${tile.price}</Text>
                ) : (
                  <Text style={styles.tilePrice}>-</Text>
                )}
                <View style={styles.tokensRow}>
                  {playersOnTile.map((player) => (
                    <View
                      key={player.id}
                      style={[styles.token, { backgroundColor: player.color }]}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#111827',
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#475569',
    padding: 4,
    justifyContent: 'space-between',
  },
  centerCell: {
    backgroundColor: '#cbd5e1',
  },
  tileName: {
    fontSize: 10,
    fontWeight: '600',
  },
  tilePrice: {
    fontSize: 10,
    color: '#334155',
  },
  tokensRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  token: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
