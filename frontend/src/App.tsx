import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Stack, IconButton, Box, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import PublicVehiclesPage from "./pages/PublicVehiclesPage";
import LoginPage from "./pages/LoginPage";

import AdminHomePage from "./pages/AdminHomePage";
import AdminMarcasPage from "./pages/AdminMarcasPage";
import AdminVehiculosPage from "./pages/AdminVehiculosPage";

import RequireAuth from "./components/RequireAuth";

export default function App() {
  const theme = createTheme({
    palette: {
      primary: { main: "#1976d2" },
    },
  });

  // useNavigate is only valid inside Router; create a small wrapper component below
  function HeaderActions() {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    const logout = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    };

    return (
      <Stack direction="row" spacing={1} alignItems="center">
        {token ? (
          <>
            <Typography variant="body2" sx={{ mr: 1 }}>Admin</Typography>
            <Button color="inherit" onClick={logout}>Cerrar sesión</Button>
          </>
        ) : null}
      </Stack>
    );
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Vehículos UI (MUI)
            </Typography>

            <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flexWrap: "wrap", mr: 2 }}>
                <Button color="inherit" component={Link} to="/">Home</Button>
                <Button color="inherit" component={Link} to="/acerca">Acerca</Button>
                <Button color="inherit" component={Link} to="/lista">Lista</Button>
                <Button color="inherit" component={Link} to="/login">Login</Button>
                <Button color="inherit" component={Link} to="/admin">Admin</Button>
              </Stack>
            </Box>

            <HeaderActions />
          </Toolbar>
        </AppBar>

        <Box className="main-content">
          <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/acerca" element={<AboutPage />} />
        <Route path="/lista" element={<PublicVehiclesPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminHomePage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/marcas"
          element={
            <RequireAuth>
              <AdminMarcasPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/vehiculos"
          element={
            <RequireAuth>
              <AdminVehiculosPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
