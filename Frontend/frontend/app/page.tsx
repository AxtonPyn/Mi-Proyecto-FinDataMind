import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0f1a",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "520px", color: "white" }}>

        {/* LOGO GRANDE */}
        <Image
          src="/logofindatamind.png"
          alt="FindataMind Logo"
          width={270}
          height={250}
          style={{ margin: "0 auto 30px" }}
        />

        <p style={{ fontSize: "17px", marginBottom: "40px", opacity: 0.85 }}>
          Convierte tus datos financieros en decisiones inteligentes con IA.
        </p>

        {/* BOTONES */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          <Link href="/login">
            <button style={primaryButton}>
              Iniciar sesión
            </button>
          </Link>

          <Link href="/registro">
            <button style={secondaryButton}>
              Registrarse
            </button>
          </Link>
        </div>

      </div>
    </main>
  );
}

const primaryButton = {
  padding: "14px 28px",
  fontSize: "16px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  background: "#3b82f6",
  color: "white",
  fontWeight: "600",
};

const secondaryButton = {
  padding: "14px 28px",
  fontSize: "16px",
  borderRadius: "10px",
  border: "1px solid #3b82f6",
  cursor: "pointer",
  background: "transparent",
  color: "#3b82f6",
  fontWeight: "600",
};
