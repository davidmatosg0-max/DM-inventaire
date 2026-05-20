import React from 'react';
import { User } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { obtenerUsuarioSesion } from '../../utils/sesionStorage';
import { obtenerUsuarios, type Usuario } from '../../utils/usuarios';

type UserRecord = Partial<Usuario> & {
  id?: string;
  username?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  foto?: string;
  avatar?: string;
};

interface ResolveUserIdentityOptions {
  user?: UserRecord | null;
  userId?: string;
  displayName?: string;
  username?: string;
  email?: string;
  photo?: string;
  users?: UserRecord[];
}

interface UserAvatarProps extends ResolveUserIdentityOptions {
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  fallbackStyle?: React.CSSProperties;
  alt?: string;
}

function normalizeText(value?: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function getDisplayName(user?: UserRecord | null): string {
  if (!user) {
    return '';
  }

  return [user.nombre, user.apellido].filter(Boolean).join(' ').trim()
    || user.username
    || user.email
    || '';
}

function getPhoto(user?: UserRecord | null): string | undefined {
  return user?.foto || user?.avatar || undefined;
}

function getInitials(label: string): string {
  const initials = label
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return initials;
}

function matchesIdentity(user: UserRecord, options: ResolveUserIdentityOptions): boolean {
  const byId = options.userId && user.id === options.userId;
  const byUsername = options.username && normalizeText(user.username) === normalizeText(options.username);
  const byEmail = options.email && normalizeText(user.email) === normalizeText(options.email);
  const byDisplayName = options.displayName && normalizeText(getDisplayName(user)) === normalizeText(options.displayName);

  return Boolean(byId || byUsername || byEmail || byDisplayName);
}

export function resolveUserIdentity(options: ResolveUserIdentityOptions): {
  label: string;
  photo?: string;
  initials: string;
  user?: UserRecord;
} {
  const directory = options.users && options.users.length > 0 ? options.users : obtenerUsuarios();
  const sessionUser = obtenerUsuarioSesion();
  const candidates: UserRecord[] = [];

  if (options.user) {
    candidates.push(options.user);
  }

  if (sessionUser) {
    candidates.push({
      id: sessionUser.id,
      username: sessionUser.username,
      nombre: sessionUser.nombre,
      apellido: sessionUser.apellido,
      email: sessionUser.email,
      foto: sessionUser.foto,
    });
  }

  candidates.push(...directory);

  const matchedWithPhoto = candidates.find((candidate) => matchesIdentity(candidate, options) && Boolean(getPhoto(candidate)));
  const matchedUser = matchedWithPhoto || candidates.find((candidate) => matchesIdentity(candidate, options));
  const label = options.displayName
    || getDisplayName(options.user)
    || getDisplayName(matchedUser)
    || options.username
    || options.email
    || 'Utilisateur';
  const initials = getInitials(label);

  return {
    label,
    photo: options.photo || getPhoto(options.user) || getPhoto(matchedUser),
    initials,
    user: matchedUser,
  };
}

export function UserAvatar({
  className,
  imageClassName,
  fallbackClassName,
  fallbackStyle,
  alt,
  ...options
}: UserAvatarProps) {
  const resolved = React.useMemo(() => resolveUserIdentity(options), [options]);

  return (
    <div className={`relative overflow-hidden shrink-0 ${className || ''}`}>
      {resolved.photo ? (
        <ImageWithFallback
          src={resolved.photo}
          alt={alt || resolved.label}
          className={imageClassName || 'h-full w-full object-cover'}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center ${fallbackClassName || 'bg-slate-200 text-slate-700'}`}
          style={fallbackStyle}
          aria-label={alt || resolved.label}
          title={resolved.label}
        >
          {resolved.initials ? resolved.initials : <User className="h-1/2 w-1/2" />}
        </div>
      )}
    </div>
  );
}