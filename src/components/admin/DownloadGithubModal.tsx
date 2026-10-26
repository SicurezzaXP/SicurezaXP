import React, { useState } from 'react';
import {
  Download,
  Github,
  Check,
  Copy,
  Terminal,
  FolderArchive,
  ExternalLink,
  X,
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DownloadGithubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadGithubModal: React.FC<DownloadGithubModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const gitSnippet = `# 1. Inicializar git en la carpeta descomprimida
git init

# 2. Agregar todos los archivos fuente
git add .

# 3. Crear el primer commit
git commit -m "feat: Sistema SICUREZZA XP completo con Firebase Firestore"

# 4. Asignar la rama principal
git branch -M main

# 5. Conectar con tu repositorio en GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git

# 6. Subir el proyecto a GitHub
git push -u origin main`;

  const runLocallySnippet = `# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor local de desarrollo
npm run dev

# 3. Compilar para producción (si deseas desplegar)
npm run build`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#161c36] text-white px-6 py-4 flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Descargar Proyecto y Subir a GitHub
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  SICUREZZA XP
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Código fuente completo, limpio y listo para producción
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Step 1: Download button */}
          <div className="p-5 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 rounded-2xl border-2 border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <FolderArchive className="w-3.5 h-3.5" /> Paso 1: Descargar ZIP
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">
                Paquete de Código Fuente (.ZIP)
              </h3>
              <p className="text-xs text-slate-600">
                Incluye todos los componentes React 19, TypeScript, reglas de Firestore, estilos Tailwind v4 y configuraciones.
              </p>
            </div>
            <a
              href="/sicurezza-xp-codigo-fuente.zip"
              download="sicurezza-xp-codigo-fuente.zip"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap active:scale-98"
            >
              <Download className="w-4 h-4 animate-bounce" />
              <span>Descargar .ZIP (0.43 MB)</span>
            </a>
          </div>

          {/* Step 2: Push to GitHub */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-600" /> Paso 2: Subir a tu Repositorio de GitHub
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(gitSnippet, 1)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                {copiedIndex === 1 ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar comandos</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Descomprime el archivo ZIP en tu computadora, abre tu terminal en esa carpeta y ejecuta:
            </p>

            <div className="relative bg-[#161c36] text-blue-100 font-mono text-xs rounded-xl p-4 overflow-x-auto border border-blue-900 shadow-inner">
              <pre className="leading-relaxed">{gitSnippet}</pre>
            </div>
          </div>

          {/* Step 3: Run Locally */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Paso 3: Ejecución Local en tu Computadora
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(runLocallySnippet, 2)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                {copiedIndex === 2 ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar comandos</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl p-4 overflow-x-auto border border-slate-800 shadow-inner">
              <pre className="leading-relaxed">{runLocallySnippet}</pre>
            </div>
          </div>

          {/* Note on environment variables */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Configuración de Firebase en tu máquina local:
            </div>
            <p className="text-amber-800">
              El archivo <code>.env.example</code> viene incluido en la raíz. Solo debes copiarlo como <code>.env</code> y pegar tus credenciales de la consola de Firebase si deseas conectar tu base de datos propia.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Archivo pre-generado listo para descargar
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
