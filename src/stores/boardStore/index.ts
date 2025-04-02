import { create } from 'zustand';
import { createBoardSlice } from './boardSlice';
import { createListSlice } from './listSlice';
import { createCardSlice } from './cardSlice';
import { createLabelSlice } from './labelSlice';
import { createChecklistSlice } from './checklistSlice';
import { createCommentSlice } from './commentSlice';
import { createMemberSlice } from './memberSlice';
import type { BoardStore } from './types';

export const useBoardStore = create<BoardStore>((set, get) => ({
  ...createBoardSlice(set, get),
  ...createListSlice(set, get),
  ...createCardSlice(set, get),
  ...createLabelSlice(set, get),
  ...createChecklistSlice(set, get),
  ...createCommentSlice(set, get),
  ...createMemberSlice(set, get),
  isLoading: false,
  error: null,
}));

export type { 
  Board,
  List,
  Card,
  Label,
  Checklist,
  ChecklistItem,
  Comment,
  CardMember 
} from './types';