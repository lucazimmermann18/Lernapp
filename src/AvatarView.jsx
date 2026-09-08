import React from 'react';
import {avatarEmoji,normalizeAvatar} from './avatar.js';

export function AvatarView({avatar,size='normal',mood='ready',level=0}){const value=normalizeAvatar(avatar),upgrade=level>=4?'🛡️':level>=3?'🎒':level>=2?'🧢':level>=1?'✨':null;return <div className={`learning-avatar ${size} ${value.color} mood-${mood}`} title={`${value.name}: ${value.ability}`}><span>{avatarEmoji(value.type)}</span><i>{mood==='celebrate'?'✨':mood==='help'?'💡':'⭐'}</i>{upgrade&&<em title={`Freigeschaltete Avatar-Ausrüstung, Level ${level}`}>{upgrade}</em>}{size!=='small'&&<small>{value.name}</small>}</div>}
