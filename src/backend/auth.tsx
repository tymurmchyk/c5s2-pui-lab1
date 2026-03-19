import { createContext, useContext, useState } from "react";
import type { User } from "./model";
import { DEMO_USER } from "./data";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: string;
    birthDate: string;
  }) => boolean;
}

const USERS: User[] = [DEMO_USER];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const register = (data: { email: string; password: string; firstName: string; lastName: string; gender: string; birthDate: string }): boolean => {
    if (USERS.find((u) => u.email === data.email)) return false;
    const newUser: User = {
      id: `u${Date.now()}`,
      email: data.email,
      passwordHash: data.password,
      name: { first: data.firstName, last: data.lastName },
      gender: data.gender,
      birthDate: data.birthDate,
    };
    USERS.push(newUser);
    setCurrentUser(newUser);
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const user = USERS.find(
      (u) => u.email === email && u.passwordHash === password
    );
    if (!user) return false;
    setCurrentUser(user);
    return true;
  };

  return (
    <AuthContext value={{
      currentUser,
      isAuthenticated: currentUser !== null,
      login,
      logout: () => setCurrentUser(null),
      register,
    }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
