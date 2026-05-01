"use client";

import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  User,
  Mail,
  Camera,
  Trash2,
  LogOut,
  Settings2,
  Bell,
  Save,
  X,
  AlertTriangle
} from "lucide-react";
import {
  motion,
  PageTransition,
  FadeIn,
  staggerContainer,
  staggerItem,
} from "@/components/motion";

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state from context user
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || "");
      setAvatar(user.avatar || null);
    }
  }, [user]);

  // Handle avatar upload via file reader
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatar(result);
      if (!isEditing) {
        // If not in edit mode, auto-save the picture immediately
        updateUser({ avatar: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    if (!isEditing) {
      updateUser({ avatar: null });
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    updateUser({ name: displayName, avatar });
    setIsEditing(false);
    setSaving(false);
  };

  const handleCancel = () => {
    if (user) {
      setDisplayName(user.name || "");
      setAvatar(user.avatar || null);
    }
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="p-8 max-w-4xl mx-auto text-[var(--text-primary)]">
          {/* Header */}
          <FadeIn>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-blue)]/15 to-[var(--accent-purple)]/15 border border-[var(--border-default)] flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-[var(--accent-blue)]" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Profile & Settings</h1>
                <p className="text-[var(--text-secondary)]">
                  Manage your account details and preferences
                </p>
              </div>
            </div>
          </FadeIn>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* 1. PROFILE HEADER & PICTURE */}
            <motion.div variants={staggerItem} className="glass-card rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-purple)] rounded-full blur-[100px] opacity-[0.1]" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Avatar section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-[var(--border-default)] bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.15)] overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-[var(--text-primary)] font-bold">
                          {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    
                    {/* Hover overlay for upload */}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white backdrop-blur-sm"
                    >
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Change</span>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarSelect} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                  
                  {avatar && (
                    <button 
                      onClick={handleRemoveAvatar}
                      className="text-xs text-[var(--accent-red)] hover:text-red-500 font-medium px-3 py-1.5 rounded-lg hover:bg-[var(--accent-red)]/10 transition-colors"
                    >
                      Remove Picture
                    </button>
                  )}
                </div>

                {/* Profile fast info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                    {displayName || "Add a display name"}
                  </h2>
                  <p className="text-[var(--text-secondary)] flex items-center justify-center md:justify-start gap-2 mb-4">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>
                  
                  {!isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] font-medium shadow-sm transition-all"
                    >
                      Edit Profile
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 2. EDIT PROFILE FORM */}
            {isEditing && (
              <motion.div 
                variants={staggerItem}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card rounded-2xl p-8 border border-[var(--accent-blue)]/30 shadow-[0_0_40px_rgba(99,102,241,0.08)]"
              >
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-[var(--accent-blue)]" />
                  Profile Details
                </h3>
                
                <div className="space-y-5 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:shadow-[0_0_0_2px_rgba(99,102,241,0.15)] outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      disabled
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-muted)] opacity-70 cursor-not-allowed outline-none"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      Your email address cannot be changed at this time.
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border-default)]">
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveChanges}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all disabled:opacity-70"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. PREFERENCES */}
            <motion.div variants={staggerItem} className="glass-card rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[var(--accent-purple)]" />
                Preferences
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-glass)]">
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">App Theme</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Toggle between light and dark mode</p>
                  </div>
                  <ThemeToggle />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-glass)]">
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Email Notifications</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Receive updates on workflow failures</p>
                  </div>
                  {/* Placeholder toggle for UI */}
                  <div className="relative w-12 h-6 rounded-full bg-[var(--accent-purple)] p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-6 shadow-sm" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 4. ACCOUNT ACTIONS (Danger Zone) */}
            <motion.div variants={staggerItem} className="glass-card rounded-2xl p-8 border border-[var(--accent-red)]/20">
              <h3 className="text-lg font-semibold text-[var(--accent-red)] mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-glass)] gap-4">
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Sign Out</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Log out of your current session on this device</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[var(--text-primary)] font-medium border border-[var(--border-default)] hover:bg-[var(--bg-card-hover)] shadow-sm transition-all whitespace-nowrap"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </motion.button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[var(--accent-red)]/20 bg-[var(--accent-red)]/5 gap-4">
                  <div>
                    <h4 className="font-medium text-[var(--accent-red)]">Delete Account</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Permanently delete your account and all workflows</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => alert("Account deletion requires confirmation. Please contact support.")}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium bg-[var(--accent-red)] hover:bg-red-500 shadow-sm transition-all whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </motion.button>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
