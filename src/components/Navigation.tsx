import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/backend";

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/about");
  }

  return (
    <nav className="border-b flex items-center gap-0.5 px-2 py-1.5 shrink-0 sticky top-0 z-50 bg-background overflow-x-auto">
      {isAuthenticated ? (
        <>
          <NavLink to="/objects">
            {({ isActive }) => (
              <Button variant={isActive ? "default" : "ghost"} size="sm" className="whitespace-nowrap shrink-0">Об&apos;єкти</Button>
            )}
          </NavLink>
          <NavLink to="/tasks">
            {({ isActive }) => (
              <Button variant={isActive ? "default" : "ghost"} size="sm" className="whitespace-nowrap shrink-0">Дод. завд.</Button>
            )}
          </NavLink>
          <NavLink to="/contacts">
            {({ isActive }) => (
              <Button variant={isActive ? "default" : "ghost"} size="sm" className="whitespace-nowrap shrink-0">Контакти</Button>
            )}
          </NavLink>
          <span className="h-4 w-px bg-border mx-1 shrink-0" />
        </>
      ) : (
        <span className="text-sm italic text-muted-foreground px-2 whitespace-nowrap shrink-0">
          Увійдіть, щоб перейти до органайзера
        </span>
      )}
      <div className="flex-1 min-w-2 shrink-0" />
      <NavLink to="/about">
        {({ isActive }) => (
          <Button variant={isActive ? "default" : "ghost"} size="sm" className="whitespace-nowrap shrink-0">Про додаток</Button>
        )}
      </NavLink>
      <span className="h-4 w-px bg-border mx-1 shrink-0" />
      {isAuthenticated ? (
        <>
          <NavLink to="/profile">
            {({ isActive }) => (
              <Button variant={isActive ? "default" : "ghost"} size="sm" className="whitespace-nowrap shrink-0">Профіль</Button>
            )}
          </NavLink>
          <Button variant="ghost" size="sm" className="whitespace-nowrap shrink-0" onClick={handleLogout}>Вийти</Button>
        </>
      ) : (
        <>
          <NavLink to="/register">
            {({ isActive }) => (
              <Button variant={isActive ? "default" : "ghost"} size="sm" className="whitespace-nowrap shrink-0">Реєстрація</Button>
            )}
          </NavLink>
          <NavLink to="/login">
            {({ isActive }) => (
              <Button variant={isActive ? "default" : "ghost"} size="sm" className="whitespace-nowrap shrink-0">Увійти</Button>
            )}
          </NavLink>
        </>
      )}
    </nav>
  );
}
