import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { useLogin, useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, PartyPopper } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { data: user, isLoading: isUserLoading } = useUser();
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // If already logged in, redirect
  useEffect(() => {
    if (!isUserLoading && user) {
      setLocation("/");
    }
  }, [isUserLoading, user, setLocation]);

  if (!isUserLoading && user) {
    return null;
  }

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-border/50 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-xl">
        <CardHeader className="space-y-2 text-center pb-8 pt-8">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
            <PartyPopper className="w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-display font-bold">С возвращением</CardTitle>
          <CardDescription className="text-base">
            Пожалуйста, войдите, чтобы управлять днями рождения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя пользователя</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Введите имя пользователя" 
                        className="h-11 rounded-xl bg-background/50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Введите пароль"
                        className="h-11 rounded-xl bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2 pb-2">
                <input
                  type="checkbox"
                  id="show-password"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <label htmlFor="show-password" className="text-sm text-muted-foreground select-none cursor-pointer">
                  Показать пароль
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Вход...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
