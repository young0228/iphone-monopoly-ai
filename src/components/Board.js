import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BOARD_POSITIONS, TILES } from '../game/gameData';

const PALETTE = {
  boardBg: '#151B2E',
  outerLine: '#34406A',
  tileBg: '#1E2744',
  tileAltBg: '#202B4D',
  text: '#E8EEFF',
  muted: '#9CA9D6',
  goTile: '#2D5BFF',
  specialTile: '#36405E',
};

function tileForGridCell(row, col) {
  const index = BOARD_POSITIONS.findIndex((pos) => pos.row === row && pos.col === col);
  return index >= 0 ? TILES[index] : null;
}

function isEdgeTile(row, col, size) {
  return row === 0 || col === 0 || row === size - 1 || col === size - 1;
}

export default function Board({ players }) {
  const gridSize = 4;

  return (
    <View style={styles.shell}>
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
              const edge = isEdgeTile(row, col, gridSize);
              const tileStyle = [
                styles.cell,
                edge ? styles.edgeTile : styles.innerTile,
                tile.id === 0 ? styles.goTile : null,
                tile.type === 'rest' ? styles.specialTile : null,
              ];

              return (
                <View key={tile.id} style={tileStyle}>
                  <Text numberOfLines={1} style={styles.tileName}>
                    {tile.name}
                  </Text>
                  <Text style={styles.tilePrice}>{tile.type === 'property' ? `$${tile.price}` : '•'}</Text>
                  <View style={styles.tokensWrap}>
                    {playersOnTile.map((player) => (
                      <View key={player.id} style={[styles.tokenOuter, { borderColor: player.color }]}>
                        <View style={[styles.tokenInner, { backgroundColor: player.color }]} />
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
  shell: {
    backgroundColor: '#0F1530',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2A3761',
  },
  board: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: PALETTE.outerLine,
    backgroundColor: PALETTE.boardBg,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: PALETTE.outerLine,
    padding: 5,
    justifyContent: 'space-between',
  },
  edgeTile: {
    backgroundColor: PALETTE.tileBg,
  },
  innerTile: {
    backgroundColor: PALETTE.tileAltBg,
  },
  centerCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    color: PALETTE.muted,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '700',
  },
  goTile: {
    backgroundColor: PALETTE.goTile,
  },
  specialTile: {
    backgroundColor: PALETTE.specialTile,
  },
  tileName: {
    fontSize: 10,
    fontWeight: '700',
    color: PALETTE.text,
  },
  tilePrice: {
    fontSize: 10,
    color: PALETTE.muted,
  },
  tokensWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  tokenOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#0B1020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
