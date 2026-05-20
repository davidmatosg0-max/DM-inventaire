import type { PieceJointe } from './communicationInterneStorage';

export type TeamChatConversationType = 'direct' | 'team' | 'channel';

export interface TeamChatMessage {
  id: string;
  conversationType: TeamChatConversationType;
  conversationId: string;
  senderUserId: string;
  senderName: string;
  content: string;
  attachments: PieceJointe[];
  createdAt: string;
  updatedAt: string;
  readByUserIds: string[];
}

export interface TeamChatTeam {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  createdByUserId: string;
  createdAt: string;
}

export interface TeamChatChannel {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  teamId?: string;
  createdByUserId: string;
  createdAt: string;
}

export interface TeamChatEvent {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  createdByUserId: string;
  participantIds: string[];
  teamId?: string;
  channelId?: string;
  createdAt: string;
}

const STORAGE_KEY_MESSAGES = 'team_chat_messages';
const STORAGE_KEY_TEAMS = 'team_chat_teams';
const STORAGE_KEY_CHANNELS = 'team_chat_channels';
const STORAGE_KEY_EVENTS = 'team_chat_events';
const STORAGE_KEY_SIGNAL = 'team_chat_signal';

export const TEAM_CHAT_EVENT = 'team-chat:updated';

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Erreur lors du parsing du stockage ${key}:`, error);
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T, scope: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));

  const payload = {
    scope,
    updatedAt: new Date().toISOString(),
  };

  window.dispatchEvent(new CustomEvent(TEAM_CHAT_EVENT, { detail: payload }));
  localStorage.setItem(STORAGE_KEY_SIGNAL, JSON.stringify(payload));
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildDirectConversationId(leftUserId: string, rightUserId: string): string {
  return ['direct', leftUserId, rightUserId].sort().join(':');
}

export function obtenirTeamChatMessages(): TeamChatMessage[] {
  return readStorage<TeamChatMessage[]>(STORAGE_KEY_MESSAGES, []);
}

function sauvegarderTeamChatMessages(messages: TeamChatMessage[]): void {
  writeStorage(STORAGE_KEY_MESSAGES, messages, 'messages');
}

export function envoyerTeamChatMessage(payload: Omit<TeamChatMessage, 'id' | 'createdAt' | 'updatedAt' | 'readByUserIds'> & { readByUserIds?: string[] }): TeamChatMessage {
  const messages = obtenirTeamChatMessages();
  const now = new Date().toISOString();
  const nextMessage: TeamChatMessage = {
    ...payload,
    id: createId('team-chat-message'),
    createdAt: now,
    updatedAt: now,
    readByUserIds: payload.readByUserIds || [payload.senderUserId],
  };

  messages.push(nextMessage);
  sauvegarderTeamChatMessages(messages);
  return nextMessage;
}

export function marquerConversationLeida(conversationType: TeamChatConversationType, conversationId: string, userId: string): void {
  const messages = obtenirTeamChatMessages();
  let changed = false;

  const nextMessages = messages.map((message) => {
    if (message.conversationType !== conversationType || message.conversationId !== conversationId) {
      return message;
    }

    if (message.readByUserIds.includes(userId)) {
      return message;
    }

    changed = true;
    return {
      ...message,
      readByUserIds: [...message.readByUserIds, userId],
      updatedAt: new Date().toISOString(),
    };
  });

  if (changed) {
    sauvegarderTeamChatMessages(nextMessages);
  }
}

export function obtenirTeamChatTeams(): TeamChatTeam[] {
  return readStorage<TeamChatTeam[]>(STORAGE_KEY_TEAMS, []);
}

function sauvegarderTeamChatTeams(teams: TeamChatTeam[]): void {
  writeStorage(STORAGE_KEY_TEAMS, teams, 'teams');
}

export function creerTeamChatTeam(payload: Omit<TeamChatTeam, 'id' | 'createdAt'>): TeamChatTeam {
  const teams = obtenirTeamChatTeams();
  const nextTeam: TeamChatTeam = {
    ...payload,
    id: createId('team-chat-team'),
    createdAt: new Date().toISOString(),
  };

  teams.push(nextTeam);
  sauvegarderTeamChatTeams(teams);
  return nextTeam;
}

export function mettreAJourTeamChatTeam(teamId: string, payload: Partial<Omit<TeamChatTeam, 'id' | 'createdAt' | 'createdByUserId'>>): TeamChatTeam | null {
  const teams = obtenirTeamChatTeams();
  const index = teams.findIndex((team) => team.id === teamId);
  if (index === -1) {
    return null;
  }

  const updatedTeam: TeamChatTeam = {
    ...teams[index],
    ...payload,
    memberIds: payload.memberIds ? Array.from(new Set(payload.memberIds)) : teams[index].memberIds,
  };
  teams[index] = updatedTeam;
  sauvegarderTeamChatTeams(teams);

  const channels = obtenirTeamChatChannels();
  const nextChannels = channels.map((channel) => (
    channel.teamId === teamId
      ? { ...channel, memberIds: [...updatedTeam.memberIds] }
      : channel
  ));
  sauvegarderTeamChatChannels(nextChannels);

  return updatedTeam;
}

export function supprimerTeamChatTeam(teamId: string): void {
  const teams = obtenirTeamChatTeams().filter((team) => team.id !== teamId);
  sauvegarderTeamChatTeams(teams);

  const deletedChannelIds = obtenirTeamChatChannels()
    .filter((channel) => channel.teamId === teamId)
    .map((channel) => channel.id);
  const nextChannels = obtenirTeamChatChannels().filter((channel) => channel.teamId !== teamId);
  sauvegarderTeamChatChannels(nextChannels);

  const nextEvents = obtenirTeamChatEvents().filter((event) => event.teamId !== teamId && !deletedChannelIds.includes(event.channelId || ''));
  sauvegarderTeamChatEvents(nextEvents);

  const nextMessages = obtenirTeamChatMessages().filter((message) => {
    if (message.conversationType === 'team' && message.conversationId === teamId) {
      return false;
    }

    if (message.conversationType === 'channel' && deletedChannelIds.includes(message.conversationId)) {
      return false;
    }

    return true;
  });
  sauvegarderTeamChatMessages(nextMessages);
}

export function obtenirTeamChatChannels(): TeamChatChannel[] {
  return readStorage<TeamChatChannel[]>(STORAGE_KEY_CHANNELS, []);
}

function sauvegarderTeamChatChannels(channels: TeamChatChannel[]): void {
  writeStorage(STORAGE_KEY_CHANNELS, channels, 'channels');
}

export function creerTeamChatChannel(payload: Omit<TeamChatChannel, 'id' | 'createdAt'>): TeamChatChannel {
  const channels = obtenirTeamChatChannels();
  const nextChannel: TeamChatChannel = {
    ...payload,
    id: createId('team-chat-channel'),
    createdAt: new Date().toISOString(),
  };

  channels.push(nextChannel);
  sauvegarderTeamChatChannels(channels);
  return nextChannel;
}

export function mettreAJourTeamChatChannel(channelId: string, payload: Partial<Omit<TeamChatChannel, 'id' | 'createdAt' | 'createdByUserId'>>): TeamChatChannel | null {
  const channels = obtenirTeamChatChannels();
  const index = channels.findIndex((channel) => channel.id === channelId);
  if (index === -1) {
    return null;
  }

  const updatedChannel: TeamChatChannel = {
    ...channels[index],
    ...payload,
    memberIds: payload.memberIds ? Array.from(new Set(payload.memberIds)) : channels[index].memberIds,
  };
  channels[index] = updatedChannel;
  sauvegarderTeamChatChannels(channels);
  return updatedChannel;
}

export function supprimerTeamChatChannel(channelId: string): void {
  const channels = obtenirTeamChatChannels().filter((channel) => channel.id !== channelId);
  sauvegarderTeamChatChannels(channels);

  const events = obtenirTeamChatEvents().filter((event) => event.channelId !== channelId);
  sauvegarderTeamChatEvents(events);

  const messages = obtenirTeamChatMessages().filter((message) => !(message.conversationType === 'channel' && message.conversationId === channelId));
  sauvegarderTeamChatMessages(messages);
}

export function obtenirTeamChatEvents(): TeamChatEvent[] {
  return readStorage<TeamChatEvent[]>(STORAGE_KEY_EVENTS, []);
}

function sauvegarderTeamChatEvents(events: TeamChatEvent[]): void {
  writeStorage(STORAGE_KEY_EVENTS, events, 'events');
}

export function creerTeamChatEvent(payload: Omit<TeamChatEvent, 'id' | 'createdAt'>): TeamChatEvent {
  const events = obtenirTeamChatEvents();
  const nextEvent: TeamChatEvent = {
    ...payload,
    id: createId('team-chat-event'),
    createdAt: new Date().toISOString(),
  };

  events.push(nextEvent);
  sauvegarderTeamChatEvents(events);
  return nextEvent;
}

export function mettreAJourTeamChatEvent(eventId: string, payload: Partial<Omit<TeamChatEvent, 'id' | 'createdAt' | 'createdByUserId'>>): TeamChatEvent | null {
  const events = obtenirTeamChatEvents();
  const index = events.findIndex((event) => event.id === eventId);
  if (index === -1) {
    return null;
  }

  const updatedEvent: TeamChatEvent = {
    ...events[index],
    ...payload,
    participantIds: payload.participantIds ? Array.from(new Set(payload.participantIds)) : events[index].participantIds,
  };
  events[index] = updatedEvent;
  sauvegarderTeamChatEvents(events);
  return updatedEvent;
}

export function supprimerTeamChatEvent(eventId: string): void {
  const events = obtenirTeamChatEvents().filter((event) => event.id !== eventId);
  sauvegarderTeamChatEvents(events);
}
