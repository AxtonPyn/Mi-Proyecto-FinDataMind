"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Registro() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const registrarUsuario = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          correo,
          contrasena,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Error al registrar");
        return;
      }

      alert("Usuario registrado correctamente 🎉");
      router.push("/login");
    } catch (error) {
      alert("No se pudo conectar con el backend ❌");
      console.error(error);
    }
  };

  return (
    <main style={contenedorPrincipal}>
      {/* Fondo */}
      <div style={fondoImagen} />
      <div style={overlay} />

      {/* Card */}
      <div style={card}>
        <Image
          src="/logofindatamind.png"
          alt="FindataMind Logo"
          width={100}
          height={90}
          style={{ marginBottom: "20px" }}
        />

        <h2 style={{ marginBottom: "20px" }}>Crear cuenta</h2>

        <input
          style={input}
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

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

        <button style={boton} onClick={registrarUsuario}>
          Registrarme
        </button>
      </div>
    </main>
  );
}

/* ===== ESTILOS ===== */

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
  backgroundImage: "url('/fondofinanzas.png')", // ✅ CORREGIDO
  backgroundSize: "cover",
  backgroundPosition: "center",
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
  maxWidth: "380px",
  textAlign: "center" as const,
  color: "white",
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "none",
};

const boton = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#22c55e",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};
