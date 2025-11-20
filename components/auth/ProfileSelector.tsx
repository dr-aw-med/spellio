'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChildProfile } from '@/types/user';

interface ProfileSelectorProps {
  onProfileSelect?: (profileId: string) => void;
}

export default function ProfileSelector({ onProfileSelect }: ProfileSelectorProps) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.role === 'PARENT') {
      fetchProfiles();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.activeProfileId) {
      setSelectedProfileId(session.user.activeProfileId);
    }
  }, [session]);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles.filter((p: ChildProfile) => p.isActive));
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des profils:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProfile = async (profileId: string) => {
    setSelectedProfileId(profileId);
    
    // Mettre à jour la session avec le profil actif
    await update({
      activeProfileId: profileId,
    });

    if (onProfileSelect) {
      onProfileSelect(profileId);
    } else {
      // Rediriger vers le tableau de bord enfant
      router.push(`/child/dashboard?profile=${profileId}`);
    }
  };

  if (!session || session.user.role !== 'PARENT') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-600">Chargement des profils...</div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800 mb-3">
          Aucun profil enfant disponible. Créez un profil pour commencer.
        </p>
        <button
          onClick={() => router.push('/profiles')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Créer un profil
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Sélectionner un profil
      </h2>
      <p className="text-gray-600 mb-6">
        Choisissez le profil enfant pour commencer une session
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleSelectProfile(profile.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedProfileId === profile.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-600">{profile.schoolLevel}</p>
              </div>
            </div>
            {selectedProfileId === profile.id && (
              <div className="text-sm text-indigo-600 font-medium">
                ✓ Profil actif
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/profiles')}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Gérer les profils
        </button>
        {selectedProfileId && (
          <button
            onClick={() => handleSelectProfile(selectedProfileId)}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Continuer
          </button>
        )}
      </div>
    </div>
  );
}

