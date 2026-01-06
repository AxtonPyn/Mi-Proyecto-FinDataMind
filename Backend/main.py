import os
import json
import io
import calendar
import pandas as pd
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# IA y Base de Datos
from google import genai
from google.genai import types
from database import supabase
from passlib.context import CryptContext

# ===== CONFIGURACIÓN =====
client = genai.Client()
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== MODELOS =====
class Transaccion(BaseModel):
    usuario_id: int
    tipo: str
    categoria_id: int
    monto: float
    descripcion: str
    fecha: str


    
# --- MODELOS DE AUTENTICACIÓN ---
class UsuarioLogin(BaseModel):
    correo: str
    contrasena: str

class UsuarioRegistro(BaseModel):
    nombre: str
    correo: str
    contrasena: str

# ===== RUTAS =====
    @app.get("/")
    def root():
        return {"message": "Backend conectado correctamente 🚀"}

# --- RUTA DE REGISTRO ---
@app.post("/registrar")
def registrar_usuario(usuario: UsuarioRegistro):
    try:
        password_a_hashear = usuario.contrasena[:72]
        hashed_password = pwd_context.hash(password_a_hashear)

        data = {
            "nombre": usuario.nombre,
            "correo": usuario.correo,
            "contrasena": hashed_password
        }
        supabase.table("usuarios").insert(data).execute()
        
        return {"message": "Usuario registrado con éxito 🎉"}

    except Exception as e:
        print("ERROR SUPABASE:", e)
        raise HTTPException(status_code=400, detail=str(e))
        

# ===== LOGIN =====

@app.post("/login")
def login(usuario: UsuarioLogin):
    respuesta = (
        supabase
        .table("usuarios")
        .select("*")
        .eq("correo", usuario.correo)
        .execute()
    )

    if not respuesta.data:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas ❌")

    usuario_db = respuesta.data[0]
    contrasena_hash = usuario_db.get("contrasena")

    if not verify_password(usuario.contrasena, contrasena_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas ❌")

    return {
        "message": "Inicio de sesión exitoso 🔐",
        "usuario_id": usuario_db.get("id_usuario"),
        "nombre": usuario_db.get("nombre"),
        "usuario": usuario_db
    }
    
# ===== PROCESAMIENTO MULTIMODAL =====

@app.post("/upload/image/{id_usuario}")
async def upload_and_process(id_usuario: int, file: UploadFile = File(...)):
    if client is None:
        raise HTTPException(status_code=500, detail="Gemini no configurado.")

    filename = file.filename.lower()
    contents = await file.read()
    prompt_parts = []

    # 1. Identificar archivo
    try:
        print(f"--- Procesando archivo: {filename} ---") # Debug en consola
        
        if filename.endswith(('.jpg', '.jpeg', '.png')):
            # Aseguramos un mime_type válido para imágenes
            m_type = file.content_type if file.content_type else "image/jpeg"
            prompt_parts.append(types.Part.from_bytes(data=contents, mime_type=m_type))
            
        elif filename.endswith('.pdf'):
            prompt_parts.append(types.Part.from_bytes(data=contents, mime_type="application/pdf"))
            
        elif filename.endswith(('.xlsx', '.xls', '.csv')):
            # Para archivos de Excel, necesitamos asegurarnos de que pandas pueda leer los bytes
            buffer = io.BytesIO(contents)
            if filename.endswith('.csv'):
                df = pd.read_csv(buffer)
            else:
                df = pd.read_excel(buffer)
            prompt_parts.append(f"Analiza esta tabla:\n{df.to_string()}")
            
        elif filename.endswith(('.txt', '.log')):
            prompt_parts.append(f"Analiza este texto:\n{contents.decode('utf-8')}")
            
        else:
            print(f"Error: Extensión {filename} no soportada.")
            raise HTTPException(status_code=400, detail=f"Formato {filename} no soportado.")

    except Exception as e:
        print(f"Ocurrió un error interno: {str(e)}") # Esto te dirá el error real en la terminal
        raise HTTPException(status_code=400, detail=f"Error al procesar archivo: {str(e)}")

    # 2. Prompt (Ajustado a tus IDs de base de datos)
    prompt_ia = """
    Extrae la info financiera. Devuelve un JSON (o lista de JSONs).
    Formato: 
    {
      "monto_bruto": número, 
      "fecha_transaccion": "YYYY-MM-DD", 
      "descripcion": "texto", 
      "tipo_transaccion": "ingreso" o "gasto", 
      "categoria_id": número (1:Sueldo, 2:Comida, 3:Transporte, 4:Vivienda, 99:Otro)
      "reporte_ia": {
          "analisis": "Breve explicación de qué es este documento",
          "sugerencia": "Consejo financiero real basado en este gasto o ingreso",
          "alerta": "Prioridad alta/media/baja"
      }
    }
    """
    prompt_parts.append(prompt_ia)

    # 3. Ejecutar IA
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt_parts,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        ia_data = json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Fallo en IA")

    # 4. GUARDADO EN DB (Lógica para listas y objetos)
    try:
        # Si es un solo objeto, lo metemos en una lista para procesar igual
        data_list = ia_data if isinstance(ia_data, list) else [ia_data]
        registros = []

        for item in data_list:
            # Limpiar el monto (quitar símbolos si la IA se equivoca)
            m_raw = item.get("monto_bruto", 0)
            m_final = float(str(m_raw).replace('$','').replace('.','').replace(',','').strip())

            registros.append({
                "usuario_id": id_usuario,
                "categoria_id": item.get("categoria_id", 99),
                "monto": m_final,
                "descripcion": item.get("descripcion", "Carga Automatizada"),
                "fecha": item.get("fecha_transaccion", "2025-01-01"),
                "tipo": item.get("tipo_transaccion", "gasto")
            })

        if registros:
            supabase.table("transacciones").insert(registros).execute()
            print(f"✅ Insertados {len(registros)} registros en la DB.")

    except Exception as e:
        print(f"❌ ERROR DB: {str(e)}")

    return {"message": "Proceso Exitoso", "ai_analysis": ia_data}

# ===== CONSULTA DE DATOS =====
@app.get("/transaccion/{id_usuario}")
def obtener_transacciones(id_usuario: int, mes: int = None, anio: int = 2025):
    try:
        query = supabase.table("transacciones").select("*").eq("usuario_id", id_usuario)
        if mes:
            ultimo_dia = calendar.monthrange(anio, mes)[1]
            query = query.gte("fecha", f"{anio}-{mes:02d}-01").lte("fecha", f"{anio}-{mes:02d}-{ultimo_dia:02d}")
        res = query.execute()
        return {"transacciones": res.data or []}
    except Exception as e:
        return {"error": str(e), "transacciones": []}