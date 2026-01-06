"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const iniciarSesion = async () => {
    const res = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correo,
        contrasena,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "Error al iniciar sesión");
      return;
    }

    // ✅ LOGIN OK → DASHBOARD
    alert("Login exitoso 🚀");
    router.push("/dashboard");
  };

  return (
    <main style={contenedorPrincipal}>
      {/* Fondo */}
      <div style={fondoImagen} />
      <div style={overlay} />

      {/* Card Login */}
      <div style={card}>
        <Image
          src="/logofindatamind.png"
          alt="FindataMind Logo"
          width={90}
          height={80}
          style={{ marginBottom: "25px" }}
        />

        <h2 style={{ marginBottom: "20px" }}>Iniciar sesión</h2>

        <input
          style={input}
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <input
          style={input}
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />

        <button style={boton} onClick={iniciarSesion}>
          Ingresar
        </button>
      </div>
    </main>
  );
}

/* ===== ESTILOS (IGUAL QUE ANTES) ===== */

const contenedorPrincipal = {
  position: "relative" as const,
  width: "100%",
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const fondoImagen = {
  position: "absolute" as const,
  inset: 0,
  backgroundImage: "url('/fondofinanzas.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  zIndex: 1,
};

const overlay = {
  position: "absolute" as const,
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.65)",
  zIndex: 2,
};

const card = {
  position: "relative" as const,
  zIndex: 3,
  background: "#0b0f1a",
  padding: "40px",
  borderRadius: "14px",
  width: "100%",
  maxWidth: "360px",
  textAlign: "center" as const,
  color: "white",
  boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "none",
  fontSize: "14px",
};

const boton = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#3b82f6",
  color: "white",
  fontWeight: "600",
  fontSize: "15px",
  cursor: "pointer",
};
