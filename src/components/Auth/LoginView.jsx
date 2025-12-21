import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginView() {
    const { login, signup } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Registration State
    const [showRegModal, setShowRegModal] = useState(false);
    const [regData, setRegData] = useState({
        displayName: '',
        phone: '',
        address: '',
        postalCode: ''
    });

    const handlePreRegister = (e) => {
        e.preventDefault();
        setError('');
        // Validate password/email first
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        setShowRegModal(true);
    }

    const handleFinalizeRegistration = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            await signup(email, password, regData);
            setSuccessMsg('Cuenta creada y perfil guardado.');
            setShowRegModal(false);
            // Auto login happens
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado.');
            } else {
                setError('Error al registrar: ' + err.message);
            }
        }
        setLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Credenciales incorrectas.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Demasiados intentos. Espera un momento.');
            } else {
                setError('Error al iniciar sesión: ' + err.message);
            }
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">

            {/* Registration Modal */}
            {showRegModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="bg-primary/5 p-6 border-b border-gray-100 dark:border-white/5">
                            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Completar Registro</h2>
                            <p className="text-xs text-gray-500 mt-1">Por favor, ingresa tus datos para el Directorio Parroquial.</p>
                        </div>
                        <form onSubmit={handleFinalizeRegistration} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nombre Completo</label>
                                <input
                                    required
                                    value={regData.displayName}
                                    onChange={e => setRegData({ ...regData, displayName: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl"
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Teléfono / WhatsApp</label>
                                <input
                                    required
                                    type="tel"
                                    value={regData.phone}
                                    onChange={e => setRegData({ ...regData, phone: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl"
                                    placeholder="Ej: 55 1234 5678"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Dirección</label>
                                    <input
                                        value={regData.address}
                                        onChange={e => setRegData({ ...regData, address: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl"
                                        placeholder="Calle y Número"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">C.P.</label>
                                    <input
                                        value={regData.postalCode}
                                        onChange={e => setRegData({ ...regData, postalCode: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl"
                                        placeholder="00000"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRegModal(false)}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-red-800 transition-colors"
                                >
                                    {loading ? 'Registrando...' : 'Finalizar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/5 animate-fade-in up">

                {/* Header Graphic */}
                <div className="h-32 bg-primary/10 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
                    <div className="text-center z-10">
                        <span className="material-symbols-outlined text-6xl text-primary mb-2">church</span>
                    </div>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">LITÚRG-IA /CG</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {isRegistering ? 'Crear Nueva Cuenta' : 'Acceso al Sistema Parroquial'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 text-sm rounded-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={isRegistering ? handlePreRegister : handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1 ml-1">Correo Electrónico</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">mail</span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                                    placeholder="nombre@parroquia.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1 ml-1">Contraseña</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">lock</span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-red-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Procesando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                            className="text-xs text-gray-500 hover:text-primary transition-colors underline"
                        >
                            {isRegistering
                                ? '¿Ya tienes cuenta? Inicia Sesión aquí'
                                : '¿No tienes cuenta? Regístrate aquí'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
