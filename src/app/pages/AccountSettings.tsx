import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AccountSettings: React.FC = () => {
  const { user, updatePassword, updateProfileAvatar } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  // Placeholder handlers
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      // Password update
      if (newPassword && newPassword === confirmPassword) {
        await updatePassword(newPassword);
        setMessage('Password updated successfully!');
      } else if (newPassword || confirmPassword) {
        setMessage('Passwords do not match.');
        return;
      }
      // Avatar update
      if (avatarFile) {
        // Upload avatar to Supabase storage (example bucket: 'avatars')
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const { data, error } = await window.supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
        if (error) throw error;
        const avatarUrl = window.supabase.storage
          .from('avatars')
          .getPublicUrl(fileName).publicUrl;
        await updateProfileAvatar(avatarUrl);
        setMessage('Avatar updated successfully!');
      }
    } catch (err: any) {
      setMessage(err.message || 'Error updating account.');
    }
  };

  return (
    <div className="account-settings-container">
      <h2>Account Settings</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Profile Avatar:</label>
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
          {avatar && <img src={avatar} alt="Avatar Preview" style={{ width: 80, height: 80, borderRadius: '50%' }} />}
        </div>
        <div>
          <label>Current Password:</label>
          <input type="password" value={password} onChange={handlePasswordChange} />
        </div>
        <div>
          <label>New Password:</label>
          <input type="password" value={newPassword} onChange={handleNewPasswordChange} />
        </div>
        <div>
          <label>Confirm New Password:</label>
          <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} />
        </div>
        <button type="submit">Update Account</button>
        {message && <div style={{ marginTop: 16, color: '#2979FF' }}>{message}</div>}
      </form>
    </div>
  );
};

export default AccountSettings;
