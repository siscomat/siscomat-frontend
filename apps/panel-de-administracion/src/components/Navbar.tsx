import { useState } from "react";
import logo from "../assets/logo.png";
import { Button } from "@siscomat/shared-ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";

/**
 * Barra de navegación principal de la aplicación.
 *
 *
 * - **Responsividad:** Muestra un menú de "hamburguesa" desplegable en dispositivos móviles y una fila de botones en pantallas medianas o grandes.
 * - **Seguridad:** El componente devuelve `null` (no se renderiza) si no hay una sesión activa.
 * - **Permisos:** La pestaña de "Gestores" se renderiza condicionalmente solo si el usuario actual cuenta con la bandera `esAdmin`.
 *
 * @example
 * // Se coloca usualmente en el archivo principal de rutas o en un Layout global:
 * <div className="app-container">
 *   <Navbar />
 *   <main>
 *     <Outlet />
 *   </main>
 * </div>
 */
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="bg-brand-primary w-full z-20 inset-s-0">
      <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-3">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-3 no-underline text-inherit cursor-pointer"
          >
            <img src={logo} className="h-16" alt="Logo Unison" />
            <span className="self-center heading-1 text-light-4 whitespace-nowrap">
              SISCOMAT
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {user.esAdmin && (
              <Button onClick={() => navigate("/gestores")}>Gestores</Button>
            )}
            <Button onClick={() => navigate("/plantillas")}>Plantillas</Button>
            <Button onClick={() => navigate("/constancias")}>
              Constancias
            </Button>
          </div>
        </div>

        <div className="hidden md:block">
          <Button onClick={handleLogout}>
            Cerrar sesión
            <FontAwesomeIcon icon={faSignOutAlt} />
          </Button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-light-4 rounded-md md:hidden hover:bg-brand-darker focus:outline-none"
        >
          <span className="sr-only">Abrir menú principal</span>
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="2"
              d="M5 7h14M5 12h14M5 17h14"
            />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-brand-primary border-t border-brand-darker w-full">
          <div className="flex flex-col p-4 gap-4">
            {user.esAdmin && (
              <Button onClick={() => navigate("/gestores")}>Gestores</Button>
            )}
            <Button onClick={() => navigate("/plantillas")}>Plantillas</Button>
            <Button onClick={() => navigate("/constancias")}>
              Constancias
            </Button>
            <Button onClick={handleLogout}>Cerrar sesión</Button>
          </div>
        </div>
      )}
    </nav>
  );
};
