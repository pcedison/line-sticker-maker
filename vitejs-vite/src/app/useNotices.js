import { useContext } from 'react';
import { NoticeContext } from './NoticeContext';

export const useNotices = () => {
  const context = useContext(NoticeContext);

  if (!context) {
    throw new Error('useNotices must be used within a NoticeProvider.');
  }

  return context;
};
