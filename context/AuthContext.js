"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

const AuthContext = createContext({
  user: null,
  userData: null,
  loading: true,
  loginEmail: async () => {},
  registerEmail: async () => {},
  loginGoogle: async () => {},
  logout: async () => {},
  refreshUserData: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fungsi memastikan dokumen users/{uid} ada tanpa menimpa data yang sudah ada
  const ensureUserDoc = async (firebaseUser, additionalData = {}) => {
    if (!firebaseUser) return null;
    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    } else {
      // Buat baru dengan peran awal "pasien"
      const newProfile = {
        nama: additionalData.nama || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "Pasien"),
        email: firebaseUser.email || "",
        noHp: additionalData.noHp || "",
        role: "pasien", // Peran awal default sesuai PRD 2.2
        aktif: true,
        dibuatPada: serverTimestamp(),
      };
      await setDoc(userRef, newProfile);
      return { id: firebaseUser.uid, ...newProfile };
    }
  };

  const fetchUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setUserData(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await ensureUserDoc(currentUser);
          setUserData(profile);
        } catch (err) {
          console.error("Error memproses user doc:", err);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginEmail = async (email, password) => {
    const cleanEmail = typeof email === "string" ? email.replace(/[\u200B-\u200D\uFEFF]/g, "").trim() : email;
    const cleanPass = typeof password === "string" ? password.replace(/[\u200B-\u200D\uFEFF]/g, "").trim() : password;
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    const profile = await ensureUserDoc(cred.user);
    setUser(cred.user);
    setUserData(profile);
    return profile;
  };

  const registerEmail = async (nama, email, noHp, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (nama) {
      await updateProfile(cred.user, { displayName: nama });
    }
    const profile = await ensureUserDoc(cred.user, { nama, noHp });
    setUser(cred.user);
    setUserData(profile);
    return profile;
  };

  const loginGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const profile = await ensureUserDoc(cred.user);
    setUser(cred.user);
    setUserData(profile);
    return profile;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  const refreshUserData = async () => {
    if (user) {
      return await fetchUserData(user.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        loginEmail,
        registerEmail,
        loginGoogle,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
