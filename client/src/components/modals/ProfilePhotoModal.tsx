import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { X, Upload, Link2, Trash2, Camera, Check } from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, showToast } = useApp();
  const [photoPreview, setPhotoPreview] = useState<string>(currentUser?.avatar_url || '');
  const [urlInput, setUrlInput] = useState<string>('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setPhotoPreview(currentUser.avatar_url || '');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('A foto deve ter no máximo 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setPhotoPreview(urlInput.trim());
    setUrlInput('');
    setShowUrlField(false);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);

    const updatedUser = {
      ...currentUser,
      avatar_url: photoPreview
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('4andar_currentUser', JSON.stringify(updatedUser));

    try {
      await fetch(`${API_URL}/usuarios/${currentUser.id}/perfil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar_url: photoPreview
        })
      });
    } catch {
      // Backend offline ou local, continua normalmente com localStorage
    }

    setIsSaving(false);
    showToast(
      photoPreview ? 'Foto de perfil atualizada com sucesso!' : 'Foto de perfil removida com sucesso!',
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Foto de Perfil</h3>
              <p className="text-xs text-slate-500">{currentUser.nome}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-5">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <UserAvatar
                name={currentUser.nome}
                fotoUrl={photoPreview}
                size="2xl"
                isMaster={Boolean(currentUser.is_master || currentUser.role === 'master')}
                className="h-28 w-28 text-2xl shadow-md border-4 border-white"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {photoPreview ? 'Visualização da sua foto' : 'Sem foto cadastrada (exibindo iniciais)'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <label className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-brand-700 text-xs font-bold transition-all cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>Escolher do Computador</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            <button
              type="button"
              onClick={() => setShowUrlField(!showUrlField)}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Link2 className="h-4 w-4 text-slate-500" />
              <span>Inserir por Link</span>
            </button>
          </div>

          {/* Optional URL Input */}
          {showUrlField && (
            <div className="pt-2 flex items-center gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://exemplo.com/sua-foto.jpg"
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-medium"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
              >
                Aplicar
              </button>
            </div>
          )}

          {/* Remove Photo */}
          {photoPreview && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remover foto atual (ficar sem foto)</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="py-2 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
