import { useState, useMemo, useEffect } from "react";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useBirthdays, useUpdateBirthday, useDeleteBirthday } from "@/hooks/use-birthdays";
import { Birthday } from "@shared/schema";
import { format, parseISO, getMonth } from "date-fns";
import { 
  LogOut, 
  Plus, 
  Search, 
  PartyPopper,
  Calendar as CalendarIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { BirthdayCard } from "@/components/BirthdayCard";
import { BirthdayFormDialog } from "@/components/BirthdayFormDialog";
import { motion, AnimatePresence } from "framer-motion";

// Helper to group birthdays by month
const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

export default function Dashboard() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const [, setLocation] = useLocation();
  const logoutMutation = useLogout();
  
  const { data: birthdays, isLoading: isBirthdaysLoading } = useBirthdays();
  const updateMutation = useUpdateBirthday();
  const deleteMutation = useDeleteBirthday();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filter and sort logic
  const groupedBirthdays = useMemo(() => {
    if (!birthdays) return {};

    const filtered = birthdays.filter(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort by date (assuming YYYY-MM-DD or MM-DD format)
    // We only care about Month/Day for sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.birthDate);
      const dateB = new Date(b.birthDate);
      // Compare month first
      const monthDiff = getMonth(dateA) - getMonth(dateB);
      if (monthDiff !== 0) return monthDiff;
      // Then day
      return dateA.getDate() - dateB.getDate();
    });

    // Group by month
    const groups: Record<string, Birthday[]> = {};
    filtered.forEach(b => {
      const date = new Date(b.birthDate);
      const monthName = MONTHS[getMonth(date)];
      if (!groups[monthName]) groups[monthName] = [];
      groups[monthName].push(b);
    });

    return groups;
  }, [birthdays, searchQuery]);

  // Auth protection
  useEffect(() => {
    if (!isUserLoading && !user) {
      setLocation("/login");
    }
  }, [isUserLoading, user, setLocation]);

  if (!isUserLoading && !user) return null;

  const handleEdit = (birthday: Birthday) => {
    setEditingBirthday(birthday);
    setIsCreateOpen(true);
  };

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) setEditingBirthday(undefined);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  if (isUserLoading || isBirthdaysLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <PartyPopper className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight hidden sm:block">
              Напоминалка
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Поиск..." 
                className="pl-9 h-9 rounded-full bg-muted/50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button 
              size="sm" 
              onClick={() => setIsCreateOpen(true)}
              className="rounded-full h-9 px-4 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Добавить
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => logoutMutation.mutate()}
              className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Поиск..." 
              className="pl-9 h-10 rounded-xl bg-white border-border/50 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!birthdays?.length ? (
          <div className="text-center py-20">
            <div className="bg-white p-8 rounded-full inline-flex mb-4 shadow-lg shadow-black/5">
              <PartyPopper className="w-12 h-12 text-primary/40" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Дней рождений пока нет</h2>
            <p className="text-muted-foreground mb-6">Добавьте первый день рождения!</p>
            <Button 
              size="lg" 
              onClick={() => setIsCreateOpen(true)}
              className="rounded-full"
            >
              Добавить
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedBirthdays).map(([month, items]) => (
              items.length > 0 && (
                <section key={month} className="relative">
                  <div className="sticky top-20 z-10 flex items-center mb-6">
                    <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full border border-border/50 shadow-sm text-sm font-bold text-primary uppercase tracking-wider">
                      {month}
                    </div>
                    <div className="h-px bg-border flex-1 ml-4" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                      {items.map((birthday) => (
                        <BirthdayCard
                          key={birthday.id}
                          birthday={birthday}
                          onEdit={handleEdit}
                          onDelete={setDeletingId}
                          onToggleGift={(id, current) => updateMutation.mutate({ id, isGiftRequired: !current })}
                          onToggleReminder={(id, current) => updateMutation.mutate({ id, isReminderSet: !current })}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )
            ))}
            
            {Object.keys(groupedBirthdays).length === 0 && searchQuery && (
              <div className="text-center py-12 text-muted-foreground">
                Ничего не найдено по запросу "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <BirthdayFormDialog 
        open={isCreateOpen} 
        onOpenChange={handleCreateOpenChange}
        birthday={editingBirthday}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Карточка будет удалена безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
