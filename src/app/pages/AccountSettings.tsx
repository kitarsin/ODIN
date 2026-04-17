import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { Lock, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const AccountSettings: React.FC = () => {
  const { user, updatePassword, updateProfileAvatar } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);

  const isAvatarUrl = (value: string) => value.startsWith('http') || value.startsWith('data:');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      // Password update
      if (newPassword && newPassword === confirmPassword && newPassword.length > 0) {
        await updatePassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
        setMessage('Password updated successfully!');
        setMessageType('success');
      } else if (newPassword || confirmPassword) {
        setMessage('Passwords do not match or are empty.');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // Avatar update
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || 'png';
        const fileName = `${user?.id}.${fileExt}`;
        const { error } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
        if (error) throw error;
        const { data: publicData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        await updateProfileAvatar(publicData.publicUrl);
        setAvatarFile(null);
        setMessage('Avatar updated successfully!');
        setMessageType('success');
      }
    } catch (err: any) {
      setMessage(err.message || 'Error updating account.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const bgColor = 'bg-background';
  const cardColor = 'bg-card';
  const textColor = 'text-foreground';
  const borderColor = 'border-border';
  const inputBg = 'bg-background';

  return (
    <div className={`min-h-screen ${bgColor} transition-colors`}>
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-semibold ${textColor} mb-2`}>
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and security
          </p>
        </div>

        <div className={`${cardColor} border ${borderColor} rounded-lg p-8 shadow-lg transition-colors`}>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div>
              <h2 className={`text-xl font-semibold ${textColor} mb-4 flex items-center gap-2`}>
                <Upload className="w-5 h-5" />
                Profile Avatar
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary bg-muted">
                    {avatar && isAvatarUrl(avatar) ? (
                      <img
                        src={avatar}
                        alt="Avatar Preview"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">
                        {user?.avatar || '🧑‍🎓'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-muted-foreground mb-2 text-sm">
                    Choose image
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    className={`block w-full text-sm text-muted-foreground 
                      file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                      file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90 transition-colors`}
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className={`pt-6 border-t ${borderColor}`}>
              <h2 className={`text-xl font-semibold ${textColor} mb-4 flex items-center gap-2`}>
                <Lock className="w-5 h-5" />
                Change Password
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={`block ${textColor} text-sm font-medium mb-2`}>
                    Current Password
                  </label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor} 
                      focus:outline-none focus:border-primary transition-colors`}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className={`block ${textColor} text-sm font-medium mb-2`}>
                    New Password
                  </label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor} 
                      focus:outline-none focus:border-primary transition-colors`}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className={`block ${textColor} text-sm font-medium mb-2`}>
                    Confirm New Password
                  </label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor} 
                      focus:outline-none focus:border-primary transition-colors`}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  loading 
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                } bg-primary text-primary-foreground hover:bg-primary/90`}
              >
                {loading ? 'Updating...' : 'Update Account'}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg text-sm font-medium transition-colors ${
                messageType === 'success'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-destructive/20 text-destructive'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
