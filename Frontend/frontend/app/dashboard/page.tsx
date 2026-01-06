"use client";

import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  Database, 
  Settings, 
  LayoutDashboard, 
  Upload,
  ChevronDown,
  Calendar,
  ArrowDownRight,
  History,
  Sparkles,
  FileText,
  User
} from "lucide-react";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";

import React, { useState, useEffect, useRef } from "react"; 


export default function Dashboard() {
    const router = useRouter();
    const [transacciones, setTransacciones] = useState<any[]>([]);
    const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState("ESPERANDO ARCHIVO...");
    const [ultimoAnalisis, setUltimoAnalisis] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const TEST_USER_ID = 1;
    const meses = [
        { id: 1, nombre: "ENERO" }, { id: 2, nombre: "FEBRERO" }, { id: 3, nombre: "MARZO" },
        { id: 4, nombre: "ABRIL" }, { id: 5, nombre: "MAYO" }, { id: 6, nombre: "JUNIO" },
        { id: 7, nombre: "JULIO" }, { id: 8, nombre: "AGOSTO" }, { id: 9, nombre: "SEPTIEMBRE" },
        { id: 10, nombre: "OCTUBRE" }, { id: 11, nombre: "NOVIEMBRE" }, { id: 12, nombre: "DICIEMBRE" }
    ];

    const fetchDatos = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/transaccion/${TEST_USER_ID}?mes=${mesSeleccionado}`);
            const data = await res.json();
            const datosOrdenados = (data.transacciones || []).sort((a: any, b: any) => 
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );
            setTransacciones(datosOrdenados);
        } catch (error) {
            console.error("Error al obtener datos:", error);
        }
    };

    useEffect(() => { fetchDatos(); }, [mesSeleccionado]);

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploadStatus("INICIANDO EXTRACCIÓN...");

        const formData = new FormData();
        formData.append("file", selectedFile); 

        try {
            const response = await fetch(`http://127.0.0.1:8000/upload/image/${TEST_USER_ID}`, { 
                method: "POST", 
                body: formData 
            });

            if (response.ok) {
            const result = await response.json();
            setUploadStatus("Éxito: " + result.message);
            setUltimoAnalisis(result.ai_analysis);
            fetchDatos();

        } else {
            const errorData = await response.json();
            setUploadStatus("Error: " + (errorData.detail || "Fallo en el servidor"));
        }
    } catch (error) {
        setUploadStatus("Error de conexión");
        console.error(error);
    }
};

    const totalIngresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + (t.monto || 0), 0);
    const totalGastos = transacciones.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + (t.monto || 0), 0);

    const obtenerSugerenciaIA = () => {
    const dataIA = Array.isArray(ultimoAnalisis) ? ultimoAnalisis[0] : ultimoAnalisis;
    if (dataIA?.reporte_ia?.sugerencia) {
        return dataIA.reporte_ia.sugerencia;
    }
    if (totalGastos > totalIngresos && totalIngresos > 0) {
        return "Alerta: Tus gastos superan tus ingresos este mes. Te sugiero reducir gastos operativos en un 10% para equilibrar el flujo.";
    }
    if (transacciones.length > 10) {
        return "Buen trabajo: Tienes un flujo constante. Podrías invertir el excedente en un fondo de bajo riesgo para generar interés compuesto.";
    }
    return "Analizando patrones... Sigue cargando tus documentos para darte consejos financieros más precisos.";
};

    return (
        <div className="flex h-screen w-full bg-[#0b0b0d] text-[#e0e0e0] font-sans overflow-hidden">
            
            {/* ASIDE - BARRA LATERAL */}
            <aside className="w-[280px] bg-[#1a1a1d] flex flex-col border-r border-white/5 px-8">
                <div className="py-16 flex justify-center pr-4"> 
                    <h1 className="text-[#E3C27C] text-xl font-extrabold tracking-tight uppercase italic text-center">Findatamind</h1>
                </div>
                
                <nav className="flex-1 mt-6">
                {/* 1. EL BOTÓN AMARILLO (ÚNICO Y AFUERA) */}
                <div className="flex items-center gap-3 p-3 bg-[#E3C27C] text-black rounded font-bold cursor-pointer shadow-lg shadow-[#E3C27C]/10 mb-16">
                    <LayoutDashboard size={22} /> 
                    <span className="text-[18px]">Panel Principal</span>
                </div>
                
                {/* 2. EL RESTO DE BOTONES (GRISES Y SEPARADOS) */}
                <div className="flex flex-col space-y-10"> 
                    {["Bases de Datos", "Cargar Documentos", "Análisis Financiero", "Ajustes"].map((item, i) => (
                        <div 
                            key={i} 
                            className="flex items-center gap-3 p-2 text-gray-400 hover:text-white transition cursor-pointer group"
                        >
                            {i === 0 && <Database size={20} />}
                            {i === 1 && <Upload size={20} />}
                            {i === 2 && <BarChart3 size={20} />}
                            {i === 3 && <Settings size={20} />}
                            <span className="text-[16px] group-hover:translate-x-1 transition-transform">
                                {item}
                            </span>
                        </div>
                    ))}
                </div>
            </nav>
                <div className="p-10 text-[14px] text-gray-700 font-mono italic">v0.1 • DataLex</div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 px-10 flex justify-between items-center border-b border-white/5 bg-[#1a1a1d]">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight relative left-[10px]">Resumen de Cuenta</h2>
                    </div>
                    <div className="relative group mr-4"> {/* Contenedor padre con 'group' */}
                        {/* EL CÍRCULO DEL USUARIO */}
                        <div className="w-10 h-10 rounded-full bg-[#16161a] border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/5 transition relative left-[-15px]">
                            <User size={30} className="text-[#E3C27C]" />
                        </div>
                        {/* EL MENÚ DESPLEGABLE */}
                        <div className="absolute left-[-110px] top-full pt-2 w-48 hidden group-hover:block z-[100]">
                            <div className="bg-[#1a1a1d] border border-white/10 rounded-lg shadow-2xl py-2 overflow-hidden">
                                {/* Opción de Perfil */}
                                <div className="px-4 py-3 hover:bg-white/5 cursor-pointer transition flex items-center gap-3">
                                    <User size={14} className="text-gray-400" />
                                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Mi Perfil</span>
                                </div>
                                <div className="h-[1px] bg-white/5 my-1"></div>
                                {/* Opción de Cerrar Sesión */}
                                <button
                                    onClick={() => router.push("/")}
                                    className="px-4 py-3 hover:bg-red-500/10 cursor-pointer transition flex items-center gap-3 group/item"
                                >
                                    <Settings size={14} className="text-gray-400 group-hover/logout:text-red-500" />
                                    <span className="text-xs font-bold text-gray-300 group-hover/logout:text-red-500 uppercase tracking-widest">Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 space-y-8">
                    
                    {/* FILA SUPERIOR: GRÁFICO E INDICADORES */}
                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-9">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest relative left-[10px] ">Flujo Mensual</h3>
                                <div className="relative group">
                                    <button className="flex items-center gap-2 bg-[#16161a] px-3 py-1 rounded border border-white/10 text-[10px] font-bold text-[#E3C27C]">
                                        <Calendar size={12} /> {meses.find(m => m.id === mesSeleccionado)?.nombre}
                                        <ChevronDown size={12} />
                                    </button>
                                    <div className="absolute hidden group-hover:block top-full right-0 bg-[#16161a] border border-white/10 rounded mt-1 z-50 max-h-48 overflow-y-auto">
                                        {meses.map(m => (
                                            <div key={m.id} onClick={() => setMesSeleccionado(m.id)} className="px-4 py-2 hover:bg-[#E3C27C] hover:text-black cursor-pointer text-[10px]">
                                                {m.nombre}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0f0f12] rounded-xl p-8 border border-white/5 h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[...transacciones].reverse()} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#E3C27C" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#E3C27C" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="fecha" tick={{fill: '#4b5563', fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={{fill: '#4b5563', fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val.toLocaleString()}`} />
                                        <Tooltip contentStyle={{backgroundColor: '#0b0b0d', border: '1px solid #E3C27C', fontSize: '12px', borderRadius: '8px'}} />
                                        <Area type="monotone" dataKey="monto" stroke="#E3C27C" fill="url(#colorMonto)" strokeWidth={3} dot={{ r: 5, fill: '#E3C27C', strokeWidth: 2, stroke: '#0f0f12' }} activeDot={{ r: 8, strokeWidth: 0 }} connectNulls={true} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="col-span-3">
                            <div className="w-[280px] ml-auto mr-12">
                            <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-4">Indicadores Clave</h3>
                            <div className="bg-[#2a2a2e] rounded-[8px] p-8 border border-white/5 space-y-8 h-[240px] flex flex-col justify-center">
                                <div className="relative left-[10px]">
                                    <p className="text-gray-500 text-[12px] uppercase font-bold mb-1 tracking-widest">Ingresos Totales</p>
                                    <p className="text-[28px] font-bold text-[#E3C27C] font-mono">CLP {totalIngresos.toLocaleString()}</p>
                                </div>
                                <div className="pt-8 border-t border-white/5">
                                    <div className="relative left-[10px]">
                                    <p className="text-gray-500 text-[12px] uppercase font-bold mb-1 tracking-widest">Gastos Totales</p>
                                    <p className="text-[28px] font-bold text-[#E3C27C] font-mono">CLP {totalGastos.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                    {/* FILA INFERIOR: HISTORIAL (IZQ) Y COLUMNA DE HERRAMIENTAS (DER) */}
                    <div className="grid grid-cols-12 gap-8">
                        
                        {/* COLUMNA IZQUIERDA: HISTORIAL Y TERMINAL (8 de 12) */}
                        <div className="col-span-8">
                            <div>
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 relative left-[10px]">Historial de Transacciones</h3>
                                <div className="bg-[#0f0f12] rounded-xl border border-white/5 h-[320px] overflow-y-auto custom-scrollbar">
                                    {transacciones.length > 0 ? (
                                        <div className="divide-y divide-white/5">
                                            {transacciones.map((t, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-5 hover:bg-white/[0.02] transition">
                                                    <div className="flex items-center gap-4">
                                                        <ArrowDownRight className={t.tipo === 'ingreso' ? "text-green-500 rotate-180" : "text-[#E3C27C]"} size={16} />
                                                        <div>
                                                            <p className="font-bold text-xs uppercase tracking-tight">{t.descripcion}</p>
                                                            <p className="text-[9px] text-gray-600 font-mono">{t.fecha}</p>
                                                        </div>
                                                    </div>
                                                    {/* Espaciado corregido en el monto */}
                                                    <p className={`text-sm font-bold pr-6 relative left-[-9px] ${t.tipo === 'ingreso' ? 'text-green-500' : 'text-white'}`}>
                                                        {t.tipo === 'ingreso' ? '+' : '-'} ${t.monto.toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-30">
                                            <History size={32} className="mb-2" />
                                            <p className="text-sm font-mono italic">Sin movimientos registrados</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SECCIÓN DE ANÁLISIS TERMINAL */}
                            <div>
                                <h3 className="text-[10px] font-bold text-[#E3C27C] uppercase tracking-widest mb-4 relative left-[10px]">Análisis de Datos Recientes</h3>
                                <div className="bg-[#0f0f12] rounded-xl border border-white/5 p-8 font-mono text-[10px] text-gray-500 overflow-x-auto min-h-[180px]">
                                    {ultimoAnalisis ? (
                                        <pre className="text-[#E3C27C] leading-relaxed">
                                            {JSON.stringify(ultimoAnalisis, null, 2)}
                                        </pre>
                                    ) : (
                                        "// TERMINAL: ESPERANDO EXTRACCIÓN DE METADATOS..."
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: GESTIÓN + IA (4 de 12) */}
                        <div className="col-span-4 flex flex-col gap-8">
                            
                            {/* BLOQUE 1: GESTIÓN DE ARCHIVOS */}
                            <div className="w-[380px] ml-auto mr-12">
                                <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-4">Gestión de Archivos</h3>
                                <div className="bg-[#2a2a2e] rounded-xl p-8 border border-white/5 space-y-6">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                                    />
                                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:bg-white/5 transition group">
                                        <Upload className="mx-auto mb-3 text-gray-600 group-hover:text-[#E3C27C] transition" size={24} />
                                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">
                                            {selectedFile ? selectedFile.name : "CARGAR Archivo o Imagen"}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleUpload} 
                                        className="flex items-center justify-center gap-3 w-full bg-[#E3C27C] text-black font-bold py-4 rounded-xl text-[11px] uppercase tracking-[2px] hover:brightness-110 hover:shadow-[0_0_20px_rgba(227,194,124,0.3)] active:scale-95 transition-all duration-300"
                                    >
                                        <Sparkles size={16} />
                                        Subir
                                    </button>
                                    <div className="pt-4 border-t border-white/5 text-center">
                                        <p className="text-[10px] text-gray-600 font-mono italic uppercase tracking-tighter">
                                            Estado: {uploadStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* BLOQUE 2: SUGERENCIA DE IA */}
                        <div className="w-[380px] ml-auto mr-12">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 relative left-[10px]">
                                <Sparkles size={12} className="text-[#E3C27C]" />
                                Sugerencia de Inteligencia
                            </h3>
                            <div className="bg-[#1a1a1d] rounded-[8px] p-6 border border-[#E3C27C]/20 shadow-[0_0_15px_rgba(227,194,124,0.05)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-[#E3C27C]/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
                                <div className="space-y-4 relative left-[5px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 bg-[#E3C27C] rounded-full"></div>
                                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">Insights del Sistema</p>
                                    </div>
                                    
                                    <p className="text-[12px] text-gray-300 leading-relaxed font-medium italic">
                                        "{obtenerSugerenciaIA()}"
                                    </p>

                                    <div className="pt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${uploadStatus.includes('INICIANDO') ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                            <span className="text-[8px] text-gray-600 font-mono uppercase">
                                                {uploadStatus.includes('INICIANDO') ? 'IA Analizando...' : 'Sistema Activo'}
                                            </span>
                                        </div>
                                        <span className="text-[8px] text-gray-700 font-mono">
                                            REF: {meses.find(m => m.id === mesSeleccionado)?.nombre}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* FIN BLOQUE IA */}

                    </div> {/* CIERRE DE COLUMNA DERECHA (col-span-4) */}
                </div> {/* CIERRE DE GRID INFERIOR */}
            </div> {/* CIERRE DE CONTENEDOR CON PADDING (p-10) */}
        </main> {/* CIERRE DE MAIN CONTENT */}
    </div>
  );
}