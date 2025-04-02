import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';
import { supabase } from '../../lib/supabase';
import { CardTitle } from './card/CardTitle';
import { CardDescription } from './card/CardDescription';
import { CardChecklists } from './card/CardChecklists';
import { CardComments } from './card/CardComments';
import { CardSidebar } from './card/CardSidebar';
import { MemberSelector } from './MemberSelector';
import { LabelSelector } from './LabelSelector';
import { DueDatePicker } from './DueDatePicker';
import type { Card } from '../../stores/boardStore/types';

interface CardDialogProps {
  card: Card;
  onClose: () => void;
}

export function CardDialog({ card, onClose }: CardDialogProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showMemberSelector, setShowMemberSelector] = useState(false);
  const [showLabelSelector, setShowLabelSelector] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [boardId, setBoardId] = useState<string | null>(null);

  const {
    fetchLabels,
    fetchChecklists,
    fetchComments,
    fetchCardMembers,
    deleteCard,
  } = useBoardStore();

  useEffect(() => {
    const loadCardData = async () => {
      // First, get the board ID from the list
      const { data: listData } = await supabase
        .from('lists')
        .select('board_id')
        .eq('id', card.list_id)
        .single();

      if (listData) {
        setBoardId(listData.board_id);
        // Now fetch all card data using the correct board ID
        await Promise.all([
          fetchLabels(listData.board_id),
          fetchChecklists(card.id),
          fetchComments(card.id),
          fetchCardMembers(card.id),
        ]);
      }
    };
    loadCardData();
  }, [card.id, card.list_id]);

  const handleDeleteCard = async () => {
    if (confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      await deleteCard(card.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8">
        <div className="flex justify-between items-start p-6 border-b">
          <div className="flex-1">
            <CardTitle
              card={card}
              isEditing={isEditingTitle}
              title={title}
              setTitle={setTitle}
              setIsEditing={setIsEditingTitle}
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-6 p-6">
          <div className="flex-1 space-y-6">
            <CardDescription
              card={card}
              isEditing={isEditingDescription}
              description={description}
              setDescription={setDescription}
              setIsEditing={setIsEditingDescription}
            />
            <CardChecklists card={card} />
            <CardComments card={card} />
          </div>

          <CardSidebar
            card={card}
            onShowMemberSelector={() => setShowMemberSelector(true)}
            onShowLabelSelector={() => setShowLabelSelector(true)}
            onShowDueDatePicker={() => setShowDueDatePicker(true)}
            onDelete={handleDeleteCard}
          />

          {showMemberSelector && boardId && (
            <MemberSelector
              boardId={boardId}
              cardId={card.id}
              onClose={() => setShowMemberSelector(false)}
            />
          )}

          {showLabelSelector && boardId && (
            <LabelSelector
              boardId={boardId}
              cardId={card.id}
              onClose={() => setShowLabelSelector(false)}
            />
          )}

          {showDueDatePicker && (
            <DueDatePicker
              cardId={card.id}
              currentDate={card.due_date}
              onClose={() => setShowDueDatePicker(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}