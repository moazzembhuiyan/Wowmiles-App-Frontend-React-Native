import { createContext, useContext } from 'react';

export const BookingTabBarContext = createContext<(hidden: boolean) => void>(() => {});

export function useBookingTabBar() {
  return useContext(BookingTabBarContext);
}
