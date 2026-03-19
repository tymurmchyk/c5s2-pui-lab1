import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/backend";
import { cn } from "@/lib/utils";

export default function RegisterView() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName || !birthDate) {
      setError("Будь ласка, заповніть усі обов'язкові поля");
      return;
    }
    const ok = register({ email, password, firstName, lastName, gender: gender || "unknown", birthDate });
    if (!ok) {
      setError("Цей e-mail вже використовується");
      return;
    }
    navigate("/objects");
  }

  return (
    <div className="flex-1 flex flex-col items-center pt-8 px-6 gap-4">
      <form onSubmit={handleSubmit} className="border grid grid-cols-[auto_1fr] items-center">
        <h2 className="col-span-2 px-8 py-3 text-center text-sm">Реєстрація</h2>

        <label htmlFor="reg-email" className="form-row-label">E-mail</label>
        <Input
          id="reg-email"
          type="email"
          placeholder="example@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-row-input"
        />

        <label htmlFor="reg-password" className="form-row-label">Пароль</label>
        <Input
          id="reg-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-row-input"
        />

        <label htmlFor="reg-firstname" className="form-row-label">Ім'я</label>
        <Input
          id="reg-firstname"
          type="text"
          placeholder="Іван"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="form-row-input"
        />

        <label htmlFor="reg-lastname" className="form-row-label">Прізвище</label>
        <Input
          id="reg-lastname"
          type="text"
          placeholder="Іваненко"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="form-row-input"
        />

        <label htmlFor="reg-gender" className="form-row-label">Стать</label>
        <select
          id="reg-gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className={cn("form-select w-full rounded-md", gender === "" && "text-muted-foreground")}
        >
          <option value="" className="text-muted-foreground">Не вказувати</option>
          <option value="female">Жіноча</option>
          <option value="male">Чоловіча</option>
        </select>

        <label htmlFor="reg-birthdate" className="form-row-label">Дата народження</label>
        <Input
          id="reg-birthdate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className={cn("form-row-input", birthDate === "" && "text-muted-foreground")}
        />

        <div className="col-span-2 flex justify-center py-3">
          <Button type="submit" variant="outline" className="rounded-none">Зареєструватися</Button>
        </div>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-sm text-muted-foreground">
        Вже маєте обліковий запис?{" "}
        <Link to="/login" className="underline">Увійти</Link>
      </p>
    </div>
  );
}
