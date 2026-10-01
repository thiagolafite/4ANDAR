import React, { useState } from 'react';
import { User as UserIcon, Camera } from 'lucide-react';

export interface UserAvatarProps {
  name: string;
  fotoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isMaster?: boolean;
  editable?: boolean;
  onUpload?: (dataUrl: string) => void;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-20 w-20 text-xl'
};

const iconSizes = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10'
};

// Generates warm, sophisticated pastel/brand colors based on name string
function getAvatarBg(name: string, isMaster?: boolean) {
  if (isMaster) {
    return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white';
  }
  const colors = [
    'bg-gradient-to-br from-orange-400 to-brand-600 text-white',
    'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
    'bg-gradient-to-br from-teal-500 to-emerald-600 text-white',
    'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
    'bg-gradient-to-br from-purple-500 to-pink-600 text-white',
    'bg-gradient-to-br from-rose-400 to-red-600 text-white',
    'bg-gradient-to-br from-slate-500 to-slate-700 text-white'
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  fotoUrl,
  size = 'md',
  className = '',
  isMaster = false,
  editable = false,
  onUpload,
  onClick
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);
  const bgClass = getAvatarBg(name, isMaster);
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const iconSizeClass = iconSizes[size] || iconSizes.md;

  const hasValidImage = Boolean(fotoUrl && fotoUrl.trim() && !imgError);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('A foto deve ter no máximo 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImgError(false);
      onUpload(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none overflow-hidden ${sizeClass} ${
        isMaster ? 'ring-2 ring-amber-400 shadow-xs' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {hasValidImage ? (
        <img
          src={fotoUrl!}
          alt={name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover rounded-full"
        />
      ) : (
        <div className={`h-full w-full flex items-center justify-center font-bold tracking-tight rounded-full ${bgClass}`}>
          {initials ? initials : <UserIcon className={iconSizeClass} />}
        </div>
      )}

      {editable && onUpload && (
        <label
          className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity rounded-full"
          title="Alterar Foto"
        >
          <Camera className={iconSizeClass} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
};
