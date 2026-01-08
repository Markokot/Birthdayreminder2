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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative bg-white rounded-2xl p-6 shadow-sm border border-border/50",
        "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300",
        isToday && "ring-2 ring-accent ring-offset-2"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold font-display text-foreground truncate">
              {birthday.name}
            </h3>
            {isToday && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                Today! 🎉
              </span>
            )}
          </div>
          
          <div className="flex items-center text-muted-foreground text-sm mb-3">
            <Calendar className="w-4 h-4 mr-1.5 opacity-70" />
            <span className="font-medium">{birthday.birthDate}</span>
          </div>

          {birthday.description && (
            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {birthday.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-full transition-colors",
                    birthday.isGiftRequired 
                      ? "bg-accent/10 text-accent hover:bg-accent/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => onToggleGift(birthday.id, !!birthday.isGiftRequired)}
                >
                  <Gift className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {birthday.isGiftRequired ? "Gift needed" : "Mark gift needed"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-full transition-colors",
                    birthday.isReminderSet 
                      ? "bg-primary/10 text-primary hover:bg-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => onToggleReminder(birthday.id, !!birthday.isReminderSet)}
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {birthday.isReminderSet ? "Reminder set" : "Set reminder"}
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-end">
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
      </div>
    </motion.div>
  );
}
