"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface ClientUser {
  email: string;
  isAdmin: boolean;
}

const UserContext = createContext<ClientUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: ClientUser;
  children: ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useCurrentUser(): ClientUser | null {
  return useContext(UserContext);
}
