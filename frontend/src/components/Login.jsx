import React, { useState } from 'react';
import { login, register } from '../services/api';
import { User, Lock, LogIn, Mail, UserPlus } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            if (isRegistering) {
                // Kayıt olma işlemi
                await register(username, email, password);
                setSuccessMessage('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
                setIsRegistering(false); // Giriş ekranına dön
                // Formu temizle (kullanıcı adı kalsın isteyebiliriz ama şifre gitsin)
                setPassword(''); 
            } else {
                // Giriş yapma işlemi
                const data = await login(username, password);
                localStorage.setItem('token', data.access_token);
                onLoginSuccess();
            }
        } catch (err) {
            console.error(err);
            if (isRegistering) {
                 setError('Kayıt başarısız. Kullanıcı adı veya e-posta kullanılıyor olabilir.');
            } else {
                 setError('Giriş başarısız! Kullanıcı adı veya şifre hatalı.');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setError('');
        setSuccessMessage('');
        setPassword('');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-xl w-96">
                <div className="flex justify-center mb-4">
                     <div className={`p-3 rounded-full ${isRegistering ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {isRegistering ? 
                            <UserPlus className="w-8 h-8 text-green-600" /> : 
                            <User className="w-8 h-8 text-blue-600" />
                        }
                     </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-800">
                    {isRegistering ? 'Team ToDo Kayıt' : 'Team ToDo Giriş'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <div className="flex items-center border-2 py-2 px-3 rounded-2xl mb-4">
                            <User className="h-5 w-5 text-gray-400" />
                            <input 
                                className="pl-2 outline-none border-none w-full"
                                type="text" 
                                placeholder="Kullanıcı Adı"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        
                        {isRegistering && (
                            <div className="flex items-center border-2 py-2 px-3 rounded-2xl mb-4">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <input 
                                    className="pl-2 outline-none border-none w-full"
                                    type="email" 
                                    placeholder="E-posta Adresi"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="flex items-center border-2 py-2 px-3 rounded-2xl">
                            <Lock className="h-5 w-5 text-gray-400" />
                            <input 
                                className="pl-2 outline-none border-none w-full"
                                type="password" 
                                placeholder="Şifre"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                    {successMessage && <p className="text-green-500 text-sm mt-2 text-center">{successMessage}</p>}

                    <div className="flex flex-col gap-3 mt-6">
                        <button 
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                                isRegistering 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {loading ? 'İşlem Yapılıyor...' : (
                                isRegistering ? <><UserPlus size={18}/> Kayıt Ol</> : <><LogIn size={18}/> Giriş Yap</>
                            )}
                        </button>
                        
                        <div className="text-center text-sm">
                            <span className="text-gray-500">
                                {isRegistering ? "Zaten hesabın var mı?" : "Hesabın yok mu?"}
                            </span>
                            <button
                                type="button"
                                onClick={toggleMode}
                                className={`ml-1 font-semibold hover:underline ${
                                    isRegistering ? 'text-blue-600' : 'text-green-600'
                                }`}
                            >
                                {isRegistering ? "Giriş Yap" : "Kayıt Ol"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;