
import { User } from '../types';

export const USERS: User[] = [

  { passcode: '3000', name: 'Name' },

];

export const validatePasscode = (passcode: string): User | null => {
  return USERS.find(user => user.passcode === passcode) || null;
};

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem('currentUser');
};
