import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BOARD_POSITIONS, TILES } from '../game/gameData';

const PALETTE = {
  frame: '#0A1022',
  boardGlow: '#1B2A56',
  boardCore: '#111A34',
  text: '#F0F5FF',
  muted: '#B6C3EA',
  specialMuted: '#8FA0CF',
  tileProperty: '#24345E',
  tileSpecial: '#1A2546',
  tileCorner: '#2A3E7B',
  edge: '#485A92',
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

const CORNER_INDEXES = new Set([0, 10, 20, 30]);

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

function tokenSlotStyle(index, tokenSize) {
  const margin = 2;
  const slots = [
    { left: margin, top: margin },
    { right: margin, top: margin },
    { left: margin, bottom: margin },
    { right: margin, bottom: margin },
  ];
  return slots[index] ?? { right: margin, bottom: margin + tokenSize * 0.6 };
}

export default function Board({ players }) {
  const [size, setSize] = useState(0);

  const layout = useMemo(() => {
    const safe = Math.max(size, 300);
    const unit = safe / 11;
    const regularWidth = unit * 1.32;
    const regularHeight = unit * 0.88;
    const cornerWidth = unit * 1.6;
    const cornerHeight = unit * 1.08;
    const tokenSize = Math.max(11, unit * 0.38);

    const centerX = safe / 2;
    const startY = unit * 0.45;

    const tiles = BOARD_POSITIONS.map((pos, index) => {
      const x = centerX + (pos.col - pos.row) * unit * 0.54;
      const y = startY + (pos.col + pos.row) * unit * 0.315;
      const isCorner = CORNER_INDEXES.has(index);
      const width = isCorner ? cornerWidth : regularWidth;
      const height = isCorner ? cornerHeight : regularHeight;

      return {
        index,
        width,
        height,
        left: x - width / 2,
        top: y - height / 2,
        zIndex: Math.round(y * 10),
      };
    });

    return { tiles, tokenSize };
  }, [size]);

  return (
    <View style={styles.frame} onLayout={(e) => setSize(e.nativeEvent.layout.width)}>
      <View style={styles.isoBackdrop} />
      <View style={styles.centerBadge}>
        <Text style={styles.centerTitle}>MONOPOLY</Text>
        <Text style={styles.centerSub}>MVP BOARD</Text>
      </View>

      {layout.tiles.map((tileLayout) => {
        const tile = TILES[tileLayout.index];
        const playersOnTile = players.filter((player) => player.position === tile.id);
        const isCorner = CORNER_INDEXES.has(tileLayout.index);
        const isProperty = tile.type === 'property';
        const owner = ownerForTile(tile.id, players);
        const groupColor = tile.colorGroup ? GROUP_COLORS[tile.colorGroup] : '#56648A';

        return (
          <View
            key={tile.id}
            style={[
              styles.tile,
              {
                width: tileLayout.width,
                height: tileLayout.height,
                left: tileLayout.left,
                top: tileLayout.top,
                zIndex: tileLayout.zIndex,
              },
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
                <Text numberOfLines={2} style={[styles.tileName, isCorner ? styles.cornerName : null]}>
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
                    tokenSlotStyle(index, layout.tokenSize),
                    {
                      width: layout.tokenSize,
                      height: layout.tokenSize,
                      borderRadius: layout.tokenSize / 2,
                      borderColor: player.id === 'human' ? '#FFFFFF' : player.color,
                    },
                    player.id === 'human' ? styles.humanTokenShell : null,
                  ]}
                >
                  <View
                    style={[
                      styles.tokenCore,
                      {
                        width: layout.tokenSize * 0.58,
                        height: layout.tokenSize * 0.58,
                        borderRadius: (layout.tokenSize * 0.58) / 2,
                        backgroundColor: player.color,
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: PALETTE.frame,
    marginBottom: 10,
  },
  isoBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: PALETTE.boardCore,
    borderWidth: 2,
    borderColor: PALETTE.boardGlow,
    borderRadius: 20,
  },
  centerBadge: {
    position: 'absolute',
    left: '30%',
    top: '41%',
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E1730',
    borderWidth: 1,
    borderColor: '#2A3D72',
    borderRadius: 12,
    paddingVertical: 8,
    zIndex: 2,
  },
  centerTitle: {
    color: '#D7E5FF',
    fontWeight: '800',
    letterSpacing: 1.4,
    fontSize: 11,
  },
  centerSub: {
    color: '#8FA4D6',
    fontSize: 9,
    marginTop: 2,
  },
  tile: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.edge,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 2.5,
    elevation: 4,
  },
  propertyTile: {
    backgroundColor: PALETTE.tileProperty,
  },
  nonPropertyTile: {
    backgroundColor: PALETTE.tileSpecial,
  },
  cornerTile: {
    backgroundColor: PALETTE.tileCorner,
    borderWidth: 1.3,
  },
  propertyStrip: {
    height: 8,
    borderBottomWidth: 0.8,
    borderBottomColor: '#0a1226',
  },
  nonPropertyHeader: {
    height: 8,
    backgroundColor: '#31426F',
    borderBottomWidth: 0.8,
    borderBottomColor: '#0a1226',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonPropertyIcon: {
    color: '#E6EEFF',
    fontSize: 7,
    fontWeight: '800',
  },
  tileBody: {
    flex: 1,
    paddingHorizontal: 4,
    paddingTop: 3,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  tileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 3,
  },
  tileName: {
    color: PALETTE.text,
    fontSize: 8.6,
    lineHeight: 10,
    fontWeight: '700',
    flex: 1,
  },
  cornerName: {
    fontSize: 9.4,
    lineHeight: 11,
  },
  tilePrice: {
    fontSize: 8,
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
  tokenDock: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 34,
    height: 34,
    zIndex: 20,
    elevation: 8,
  },
  tokenShell: {
    position: 'absolute',
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
    shadowColor: '#91BBFF',
    shadowOpacity: 0.95,
    shadowRadius: 4.2,
    shadowOffset: { width: 0, height: 0 },
  },
  tokenCore: {
    borderRadius: 99,
  },
});
