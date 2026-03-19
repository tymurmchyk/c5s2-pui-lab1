import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/backend";

export default function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (login(email, password)) {
      navigate("/objects");
    } else {
      setError("Невірний e-mail або пароль");
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center pt-8 px-6 gap-4">
      <form onSubmit={handleSubmit} className="border grid grid-cols-[auto_1fr] items-center">
        <h2 className="col-span-2 px-8 py-3 text-center text-sm">Вхід</h2>

        <label htmlFor="login-email" className="form-row-label">E-mail</label>
        <Input
          id="login-email"
          type="email"
          placeholder="example@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-row-input"
        />

        <label htmlFor="login-password" className="form-row-label">Пароль</label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-row-input"
        />

        <div className="col-span-2 flex justify-center py-3">
          <Button type="submit" variant="outline" className="rounded-none">Увійти</Button>
        </div>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-sm text-muted-foreground">
        Немає облікового запису?{" "}
        <Link to="/register" className="underline">Зареєструватися</Link>
      </p>
    </div>
  );
}
