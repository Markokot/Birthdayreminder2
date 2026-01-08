import { Birthday } from "@shared/schema";
import { motion } from "framer-motion";
import { Gift, Bell, Pencil, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BirthdayCardProps {
  birthday: Birthday;
  onEdit: (birthday: Birthday) => void;
  onDelete: (id: number) => void;
  onToggleGift: (id: number, current: boolean) => void;
  onToggleReminder: (id: number, current: boolean) => void;
}

export function BirthdayCard({
  birthday,
  onEdit,
  onDelete,
  onToggleGift,
  onToggleReminder,
}: BirthdayCardProps) {
  // Parsing date roughly for display if it's text
  const isToday = new Date().toISOString().slice(5, 10) === birthday.birthDate.slice(5, 10);
  
  // Custom formatter to show Day Month (in Russian if locale was set, but we are manual here)
  const dateObj = new Date(birthday.birthDate);
  const day = dateObj.getDate();
  const monthIndex = dateObj.getMonth();
  const MONTHS_GENITIVE = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];
  const formattedDate = `${day} ${MONTHS_GENITIVE[monthIndex]}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative bg-white rounded-2xl px-5 py-3 shadow-sm border border-border/50",
        "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300",
        isToday && "ring-2 ring-accent ring-offset-2"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h3 className="text-lg font-bold font-display text-foreground truncate shrink-0">
            {birthday.name}
          </h3>
          <span className="text-sm text-muted-foreground font-medium shrink-0">
             {formattedDate}
          </span>
            
          {isToday && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent">
              Сегодня! 🎉
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full transition-colors",
                    birthday.isGiftRequired 
                      ? "bg-accent/10 text-accent hover:bg-accent/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => onToggleGift(birthday.id, !!birthday.isGiftRequired)}
                >
                  <Gift className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {birthday.isGiftRequired ? "Подарок нужен" : "Отметить подарок"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full transition-colors",
                    birthday.isReminderSet 
                      ? "bg-primary/10 text-primary hover:bg-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => onToggleReminder(birthday.id, !!birthday.isReminderSet)}
                >
                  <Bell className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {birthday.isReminderSet ? "Напоминание включено" : "Включить напоминание"}
              </TooltipContent>
            </Tooltip>
          
          <div className="w-px h-4 bg-border/60 mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
              onClick={() => onEdit(birthday)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(birthday.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
        </div>
      </div>
    </motion.div>
  );
}
