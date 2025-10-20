import React, { createContext, useEffect, useState } from "react";
import { User } from "../interface/user";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          _id: firebaseUser.uid,
          email: firebaseUser.email as string,
          name: firebaseUser.displayName as string,
        });
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
