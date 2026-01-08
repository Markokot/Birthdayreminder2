import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertBirthdaySchema, type Birthday, type InsertBirthday } from "@shared/schema";
import { useCreateBirthday, useUpdateBirthday } from "@/hooks/use-birthdays";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface BirthdayFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  birthday?: Birthday; // If present, we are editing
}

export function BirthdayFormDialog({
  open,
  onOpenChange,
  birthday,
}: BirthdayFormDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateBirthday();
  const updateMutation = useUpdateBirthday();

  const isEditing = !!birthday;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<InsertBirthday>({
    resolver: zodResolver(insertBirthdaySchema),
    defaultValues: {
      name: "",
      birthDate: "",
      description: "",
      isGiftRequired: false,
      isReminderSet: false,
    },
  });

  // Reset form when opening/closing or switching between edit/create
  useEffect(() => {
    if (open) {
      if (birthday) {
        form.reset({
          name: birthday.name,
          birthDate: birthday.birthDate,
          description: birthday.description || "",
          isGiftRequired: birthday.isGiftRequired || false,
          isReminderSet: birthday.isReminderSet || false,
        });
      } else {
        form.reset({
          name: "",
          birthDate: "",
          description: "",
          isGiftRequired: false,
          isReminderSet: false,
        });
      }
    }
  }, [open, birthday, form]);

  const onSubmit = async (data: InsertBirthday) => {
    try {
      if (isEditing && birthday) {
        await updateMutation.mutateAsync({ id: birthday.id, ...data });
        toast({ title: "Success", description: "Birthday updated successfully" });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Success", description: "Birthday added successfully" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-6 sm:p-8">
          <DialogHeader className="mb-4">
          <DialogTitle className="font-display text-2xl">
            {isEditing ? "Редактировать" : "Добавить день рождения"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Обновите информацию об этом событии." 
              : "Сохраните еще одну важную дату."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Например: Иван Иванов" 
                      className="rounded-xl h-11 border-border/60 bg-muted/30 focus:bg-background transition-colors"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата рождения</FormLabel>
                  <FormControl>
                    {/* Using type="date" simplifies parsing, but schema allows text. 
                        For consistent UX, we'll suggest YYYY-MM-DD but accept whatever the user types if we change to text.
                        Here we use 'date' input for best experience on mobile too.
                    */}
                    <Input 
                      type="date" 
                      className="rounded-xl h-11 border-border/60 bg-muted/30 focus:bg-background transition-colors w-full"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заметки (необязательно)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Идеи подарков, любимые цветы и т.д." 
                      className="resize-none rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors min-h-[100px]"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="rounded-xl h-11"
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="rounded-xl h-11 px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Сохранить" : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
