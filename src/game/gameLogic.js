import {
  LOW_CASH_THRESHOLD,
  PLAYER_SETUP,
  STARTING_CASH,
  TILES,
} from './gameData';

export function createInitialPlayers() {
  return PLAYER_SETUP.map((player) => ({
    ...player,
    position: 0,
    cash: STARTING_CASH,
    properties: [],
  }));
}

export function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

export function movePlayer(players, playerIndex, steps) {
  const updated = [...players];
  const player = { ...updated[playerIndex] };
  const nextPosition = (player.position + steps) % TILES.length;
  const passedGo = player.position + steps >= TILES.length;

  player.position = nextPosition;
  if (passedGo) {
    player.cash += 40;
  }

  updated[playerIndex] = player;
  return updated;
}

export function resolveLanding(players, playerIndex) {
  const updated = [...players];
  const active = { ...updated[playerIndex] };
  const tile = TILES[active.position];

  if (tile.type !== 'property') {
    updated[playerIndex] = active;
    return {
      players: updated,
      message: `${active.name} landed on ${tile.name}.`,
    };
  }

  const ownerIndex = updated.findIndex((p) => p.properties.includes(tile.id));

  if (ownerIndex >= 0 && ownerIndex !== playerIndex) {
    const owner = { ...updated[ownerIndex] };
    const rentPaid = Math.min(active.cash, tile.rent);
    active.cash -= rentPaid;
    owner.cash += rentPaid;
    updated[playerIndex] = active;
    updated[ownerIndex] = owner;

    return {
      players: updated,
      message: `${active.name} paid $${rentPaid} rent to ${owner.name} for ${tile.name}.`,
    };
  }

  updated[playerIndex] = active;
  return {
    players: updated,
    message: `${active.name} landed on ${tile.name} ($${tile.price}).`,
    canBuy: ownerIndex === -1,
  };
}

export function buyProperty(players, playerIndex) {
  const updated = [...players];
  const active = { ...updated[playerIndex] };
  const tile = TILES[active.position];

  if (tile.type !== 'property') {
    return { players, purchased: false, message: 'This tile is not a property.' };
  }

  const ownerExists = updated.some((p) => p.properties.includes(tile.id));
  if (ownerExists || active.cash < tile.price) {
    return { players, purchased: false, message: `${active.name} could not buy ${tile.name}.` };
  }

  active.cash -= tile.price;
  active.properties = [...active.properties, tile.id];
  updated[playerIndex] = active;

  return {
    players: updated,
    purchased: true,
    message: `${active.name} bought ${tile.name} for $${tile.price}.`,
  };
}

export function runAiTurn(players, playerIndex) {
  const die = rollDie();
  let movedPlayers = movePlayer(players, playerIndex, die);
  const landing = resolveLanding(movedPlayers, playerIndex);
  movedPlayers = landing.players;

  const aiPlayer = movedPlayers[playerIndex];
  const tile = TILES[aiPlayer.position];

  if (landing.canBuy && tile.price <= aiPlayer.cash - LOW_CASH_THRESHOLD) {
    const purchase = buyProperty(movedPlayers, playerIndex);
    return {
      players: purchase.players,
      die,
      message: `${landing.message} ${purchase.message}`,
    };
  }

  const skipReason = landing.canBuy
    ? `${aiPlayer.name} skipped buying to keep cash.`
    : `${aiPlayer.name} ended the turn.`;

  return {
    players: movedPlayers,
    die,
    message: `${landing.message} ${skipReason}`,
  };
}
