import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  LayoutList, 
  Trello,
  Calendar,
  List,
  AlertCircle,
  CheckCircle2,
  Clock4
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  parseISO, 
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isBefore,
  addHours,
  eachHourOfInterval
} from 'date-fns';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useBoardStore } from '../stores/boardStore';
import { Link } from 'react-router-dom';

interface CalendarItem {
  id: string;
  title: string;
  date: Date;
  type: 'card';
  boardName: string;
  listName: string;
  boardId: string;
  description?: string | null;
  isOverdue?: boolean;
}

type ViewType = 'month' | 'week' | 'day';

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const { currentWorkspace, workspaces } = useWorkspaceStore();
  const { boards, lists, cards, fetchBoards, fetchLists, fetchCards } = useBoardStore();

  useEffect(() => {
    const loadWorkspaceData = async () => {
      if (!currentWorkspace) return;
      await fetchBoards(currentWorkspace.id);
    };

    loadWorkspaceData();
  }, [currentWorkspace]);

  useEffect(() => {
    const loadBoardData = async () => {
      if (!boards.length) return;
      for (const board of boards) {
        await fetchLists(board.id);
      }
    };

    loadBoardData();
  }, [boards]);

  useEffect(() => {
    const loadListData = async () => {
      if (!lists.length) return;
      for (const list of lists) {
        await fetchCards(list.id);
      }
    };

    loadListData();
  }, [lists]);

  useEffect(() => {
    const items: CalendarItem[] = cards
      .filter(card => card.due_date)
      .map(card => {
        const list = lists.find(l => l.id === card.list_id);
        const board = list ? boards.find(b => b.id === list.board_id) : null;

        return {
          id: card.id,
          title: card.title,
          date: parseISO(card.due_date!),
          type: 'card',
          boardName: board?.name || 'Unknown Board',
          listName: list?.name || 'Unknown List',
          boardId: board?.id || '',
          description: card.description
        };
      });

    setCalendarItems(items);
  }, [cards, lists, boards]);

  const navigate = {
    month: {
      prev: () => setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() - 1, 1)),
      next: () => setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() + 1, 1)),
    },
    week: {
      prev: () => setCurrentDate(date => subWeeks(date, 1)),
      next: () => setCurrentDate(date => addWeeks(date, 1)),
    },
    day: {
      prev: () => setCurrentDate(date => addDays(date, -1)),
      next: () => setCurrentDate(date => addDays(date, 1)),
    },
  };

  const getDateRange = () => {
    switch (viewType) {
      case 'month': {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
      }
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn: 0 });
        const end = endOfWeek(currentDate, { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
      }
      case 'day':
        return [currentDate];
    }
  };

  const getViewTitle = () => {
    switch (viewType) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        return `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  };

  const getItemsForDate = (date: Date) => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    return calendarItems.filter(item => 
      isWithinInterval(item.date, { start, end })
    );
  };

  if (!currentWorkspace) {
    return (
      <div className="text-center py-12">
        <div className="p-3 bg-blue-100 rounded-lg inline-block mb-4">
          <CalendarIcon className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Workspace Selected</h2>
        <p className="text-gray-600 mb-6">
          Please select a workspace to view the calendar
        </p>
        {workspaces.length > 0 ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            Select a workspace
          </Link>
        ) : (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create a workspace
          </Link>
        )}
      </div>
    );
  }

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div
          key={day}
          className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-900"
        >
          {day}
        </div>
      ))}
      {getDateRange().map((date) => {
        const dayItems = getItemsForDate(date);

        return (
          <div
            key={date.toISOString()}
            className={`
              bg-white min-h-[120px] p-2
              ${!isSameMonth(date, currentDate) ? 'text-gray-400' : ''}
              ${isToday(date) ? 'bg-blue-50' : ''}
            `}
          >
            <div className="font-medium mb-2 text-sm">
              {format(date, 'd')}
            </div>
            <div className="space-y-2">
              {dayItems.map(item => (
                <Link
                  key={item.id}
                  to={`/dashboard?board=${item.boardId}`}
                  className="block p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <Trello className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500 truncate">
                            {item.boardName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                          <LayoutList className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500 truncate">
                            {item.listName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-4">
      {getDateRange().map((date) => {
        const dayItems = getItemsForDate(date);
        const isCurrentDay = isToday(date);
        const isPastDay = isBefore(date, startOfDay(new Date()));

        return (
          <div key={date.toISOString()} className="min-h-[600px]">
            <div className={`
              p-3 rounded-t-lg
              ${isCurrentDay ? 'bg-blue-100' : isPastDay ? 'bg-gray-100' : 'bg-gray-50'}
            `}>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">
                  {format(date, 'EEE')}
                </div>
                <div className={`
                  text-2xl font-bold
                  ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}
                `}>
                  {format(date, 'd')}
                </div>
              </div>
            </div>

            <div className="mt-2">
              {dayItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No tasks scheduled
                </div>
              ) : (
                <div className="space-y-2">
                  {dayItems.map(item => {
                    const isOverdue = isBefore(item.date, new Date()) && !isSameDay(item.date, new Date());
                    
                    return (
                      <Link
                        key={item.id}
                        to={`/dashboard?board=${item.boardId}`}
                        className="block p-3 bg-white border rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {isOverdue ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock4 className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`
                              font-medium text-sm mb-1
                              ${isOverdue ? 'text-red-600' : 'text-gray-900'}
                            `}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className={`
                                font-medium
                                ${isOverdue ? 'text-red-500' : ''}
                              `}>
                                {format(item.date, 'HH:mm')}
                              </span>
                              <span>•</span>
                              <span>{item.boardName}</span>
                              <span>•</span>
                              <span>{item.listName}</span>
                            </div>
                            {item.description && (
                              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDayView = () => {
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);
    const hours = eachHourOfInterval({ start: dayStart, end: dayEnd });
    const dayItems = getItemsForDate(currentDate);

    return (
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${isToday(currentDate) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'}
              `}>
                <span className="text-2xl font-bold">{format(currentDate, 'd')}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {format(currentDate, 'EEEE')}
                </h3>
                <p className="text-sm text-gray-500">
                  {format(currentDate, 'MMMM yyyy')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {dayItems.length} {dayItems.length === 1 ? 'task' : 'tasks'}
              </div>
              <div className="text-sm text-gray-500">
                {dayItems.filter(item => isBefore(item.date, new Date())).length} overdue
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y">
          {hours.map(hour => {
            const hourItems = dayItems.filter(item => 
              format(item.date, 'HH') === format(hour, 'HH')
            );

            return (
              <div key={hour.toISOString()} className="flex">
                <div className="w-24 py-4 px-4 bg-gray-50 border-r text-sm text-gray-500">
                  {format(hour, 'HH:mm')}
                </div>
                <div className="flex-1 p-2">
                  {hourItems.map(item => {
                    const isOverdue = isBefore(item.date, new Date());
                    
                    return (
                      <Link
                        key={item.id}
                        to={`/dashboard?board=${item.boardId}`}
                        className={`
                          block p-3 rounded-lg mb-2 last:mb-0
                          ${isOverdue 
                            ? 'bg-red-50 hover:bg-red-100' 
                            : 'bg-blue-50 hover:bg-blue-100'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {isOverdue ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock4 className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <p className={`
                              font-medium mb-1
                              ${isOverdue ? 'text-red-600' : 'text-gray-900'}
                            `}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Trello className="h-4 w-4" />
                                <span>{item.boardName}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <LayoutList className="h-4 w-4" />
                                <span>{item.listName}</span>
                              </div>
                            </div>
                            {item.description && (
                              <p className="mt-2 text-sm text-gray-600">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Calendar</h1>
        <p className="text-gray-600">
          View and manage your team's schedule and due dates
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {currentWorkspace.name} Calendar
                </h2>
                <p className="text-sm text-gray-500">
                  {getViewTitle()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType('month')}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    viewType === 'month' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewType('week')}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    viewType === 'week' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewType('day')}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    viewType === 'day' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Day
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate[viewType].prev()}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate[viewType].next()}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {viewType === 'month' && renderMonthView()}
          {viewType === 'week' && renderWeekView()}
          {viewType === 'day' && renderDayView()}
        </div>
      </div>
    </div>
  );
}