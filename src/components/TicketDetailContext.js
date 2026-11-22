import { createContext, useContext } from 'react';

export const TicketDetailContext = createContext({ openTicket: () => {} });

export const useTicketDetail = () => useContext(TicketDetailContext);
