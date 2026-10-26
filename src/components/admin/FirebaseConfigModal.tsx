import React, { useState } from 'react';
import {
  X,
  Database,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  ExternalLink,
  Shield,
  Send,
  Loader2,
  Sparkles,
  Server,
  CloudCheck,
} from 'lucide-react';
import {
  isFirebaseConfigured,
  testFirestoreConnection,
  FirestoreDiagnosticResult,
  resolvedDatabaseId,
} from '../../services/firebase';
import { resetDemoData, addCase } from '../../services/db';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<FirestoreDiagnosticResult | null>(null);
  const [isRegisteringTest, setIsRegisteringTest] = useState(false);
  const [testRegisterResult, setTestRegisterResult] = useState<{ success: boolean; message: string; caseId?: string } | null>(null);

  if (!isOpen) return null;

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sicurezzaxp';
  const databaseId = resolvedDatabaseId;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleClearData = () => {
    const ok = window.confirm(
      '¿Deseas vaciar la memoria local para que la aplicación muestre exclusivamente los casos que existan en Firestore de Firebase?'
    );
    if (ok) {
      localStorage.removeItem('sicurezza_sac_cases_v1');
      localStorage.removeItem('sicurezza_xp_cases_v2');
      window.dispatchEvent(new CustomEvent('sicurezza_cases_updated', { detail: [] }));
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleRunDiagnostic = async () => {
    setIsTesting(true);
    setDiagnosticResult(null);
    setTestRegisterResult(null);
    try {
      const result = await testFirestoreConnection();
      setDiagnosticResult(result);
    } catch (err: any) {
      setDiagnosticResult({
        success: false,
        status: 'offline_or_error',
        projectId,
        databaseId,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunTestRegistration = async () => {
    setIsRegisteringTest(true);
    setTestRegisterResult(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const created = await addCase({
        nroCasoDni: '78901234',
        nombresApellidos: 'Cliente Prueba de Conexión',
        fechaIngreso: today,
        canal: 'WhatsApp',
        telefonoCliente: '999888777',
        correoCliente: 'prueba@sicurezza.pe',
        numeroPedido: 'PED-TEST-101',
        numeroBoleta: 'B001-TEST',
        campanaMkt: 'Verificación Firebase',
        origenVenta: 'Tda. Jockey Plaza',
        fechaVenta: today,
        tipoPago: 'Tarjeta',
        producto: 'Bra Seamless Invisible (Test)',
        sku: 'SIC-BRA-TEST',
        cantidad: 1,
        talla: 'M',
        color: 'Beige',
        tipoCaso: 'Solicitud',
        motivo: 'Producto',
        submotivo: 'Verificación de conectividad',
        solicitudCliente: 'Registro de prueba ejecutado para comprobar almacenamiento en el sistema.',
        quejaPersonalInvolucrado: 'N/A',
        sucursalQueja: 'N/A',
        solucionBrindada: 'Cambio - Talla',
        cerroEnFcr: 'Sí',
        detalleSolucion: 'Verificación completada satisfactoriamente en tiempo real.',
        sustentosAtencion: 'N/A',
        estado: 'Abierto',
        cierre: 'Pendiente',
        fechaCierre: '',
        prioridad: 'Media',
        asesorResponsable: 'Administrador SICUREZZA XP',
        isArchived: false,
        createdBy: 'info@sicurezza.pe',
        updatedBy: 'info@sicurezza.pe',
        tienda: 'Tda. Jockey Plaza',
        categoria: 'Producto',
        clienteNombre: 'Cliente Prueba de Conexión',
        clienteDocumento: '78901234',
        clienteTelefono: '999888777',
        clienteEmail: 'prueba@sicurezza.pe',
        descripcion: 'Registro de prueba ejecutado para comprobar almacenamiento en el sistema.',
        solucionAccion: 'Verificación completada satisfactoriamente en tiempo real.',
        clienteConforme: 'Sí',
      });

      setTestRegisterResult({
        success: true,
        message: `¡Caso registrado con éxito en el sistema! Código asignado: ${created.id}`,
        caseId: created.id,
      });
    } catch (err: any) {
      setTestRegisterResult({
        success: false,
        message: `Error al registrar: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsRegisteringTest(false);
    }
  };

  const envTemplate = `# Configuración oficial de tu proyecto Firebase
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="sicurezzaxp.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="sicurezzaxp"
VITE_FIREBASE_STORAGE_BUCKET="sicurezzaxp.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="83510810103"
VITE_FIREBASE_APP_ID="1:83510810103:web:0ff7577d7d6499a88d0af2"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#161c36] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Conexión y Diagnóstico de Base de Datos
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900 text-blue-200 border border-blue-700">
                  SICUREZZA XP
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80">
                Verificación de Cloud Firestore, almacenamiento seguro y prueba en tiempo real
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Active Status Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 ${
                  isFirebaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-600'
                }`}
              />
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>
                    {isFirebaseConfigured
                      ? 'Credenciales Firebase Vinculadas'
                      : 'Modo Local Reactivo Activo'}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded font-mono bg-slate-200 text-slate-800">
                    {projectId}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Base de datos: <strong className="font-mono text-slate-700">{databaseId}</strong> · Sincronización continua de casos ATC.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearData}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Vaciar casos de la memoria local para ver solo Firestore"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Vaciar Casos Locales (0)</span>
              </button>
            </div>
          </div>

          {resetSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Memoria local vaciada. El sistema mostrará únicamente los registros existentes en Firestore.</span>
            </div>
          )}

          {/* Real-time Diagnostics & Test Section */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <h3 className="font-bold text-blue-950 text-xs uppercase tracking-wide">
                  Prueba de Conexión y Registro en Vivo
                </h3>
              </div>
              <span className="text-[10px] text-blue-700 font-medium">
                Comprobación directa con el servidor
              </span>
            </div>
            <p className="text-xs text-blue-900/90 leading-relaxed">
              Ejecuta una comprobación de red con Firebase Cloud Firestore para verificar si responde a lecturas y escrituras, o registra un caso de prueba para confirmar el almacenamiento inmediato.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleRunDiagnostic}
                disabled={isTesting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Comprobando Firestore...</span>
                  </>
                ) : (
                  <>
                    <Server className="w-3.5 h-3.5" />
                    <span>Probar Conexión Firestore Ahora</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRunTestRegistration}
                disabled={isRegisteringTest}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 disabled:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
              >
                {isRegisteringTest ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    <span>Registrar Caso de Prueba Directo</span>
                  </>
                )}
              </button>
            </div>

            {/* Diagnostic Result Banner */}
            {diagnosticResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-fade-in ${
                  diagnosticResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : diagnosticResult.status === 'db_not_created'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {diagnosticResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{diagnosticResult.message}</span>
                </div>

                {diagnosticResult.details && (
                  <p className="text-[11px] opacity-90 pl-6 leading-relaxed">
                    {diagnosticResult.details}
                  </p>
                )}

                {diagnosticResult.actionUrl && (
                  <div className="pt-1.5 pl-6">
                    <a
                      href={diagnosticResult.actionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <span>{diagnosticResult.actionText || 'Abrir Firebase Console'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Test Registration Result Banner */}
            {testRegisterResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fade-in ${
                  testRegisterResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {testRegisterResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testRegisterResult.message}</span>
                </div>

                {testRegisterResult.caseId && (
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800 text-[11px] font-bold">
                    {testRegisterResult.caseId}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Steps & Guidance */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Estado de la Integración Firebase para SICUREZZA XP
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Proyecto Configurado:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {projectId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">ID de Base de Datos:</span>
                <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {databaseId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Garantía de Persistencia:</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Doble capa (Nube + Local)
                </span>
              </div>
            </div>

            {/* Step-by-step to click "Crear base de datos" */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2.5">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-700" />
                <h4 className="font-bold text-amber-950 text-xs">
                  ¿Cómo activar Cloud Firestore en tu proyecto {projectId}?
                </h4>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Si en la consola de Firebase te figura el botón <strong>"Crear base de datos"</strong> o la consola te da <em>"Database (default) not found"</em>, sigue estos 3 pasos (toma menos de 1 minuto):
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-950 font-medium pl-1">
                <li>
                  Abre la consola de Firestore en tu proyecto:{' '}
                  <a
                    href={`https://console.firebase.google.com/project/${projectId}/firestore`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 font-bold underline inline-flex items-center gap-0.5"
                  >
                    Ir a Firestore en Firebase Console <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>
                  Haz clic en el botón azul <strong>"Crear base de datos"</strong>.
                </li>
                <li>
                  Elige la ubicación geográfica (ej. <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">us-central1</code> o la más cercana) y haz clic en <strong>Siguiente</strong>.
                </li>
                <li>
                  Selecciona <strong>"Iniciar en modo de prueba"</strong> (o modo de producción) y haz clic en <strong>Habilitar</strong>.
                </li>
              </ol>
              <p className="text-[10px] text-amber-800 italic pt-1">
                Una vez habilitada, la base de datos '(default)' quedará activa de forma permanente. Todos los casos que registres se guardarán en tu Firestore y solo aparecerán los datos reales.
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-600">
                  Variables de Entorno Detectadas:
                </span>
                <button
                  type="button"
                  onClick={() => copyText(envTemplate, 'env')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-slate-300"
                >
                  <Copy className="w-3 h-3" />
                  {copiedKey === 'env' ? '¡Copiado!' : 'Copiar Plantilla'}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-normal">
                {envTemplate}
              </pre>
            </div>
          </div>

          {/* Security Rules Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              Reglas de Seguridad y Acceso Total
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              El sistema está configurado para el usuario único master <strong>Administrador SICUREZZA XP</strong> (<code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">info@sicurezza.pe</code>) con acceso irrestricto para registrar, editar, exportar y analizar casos en tiempo real.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Todos los casos registrados se reflejan al instante en el Explorador y los Gráficos.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#161c36] hover:bg-[#1a2142] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Cerrar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
};
