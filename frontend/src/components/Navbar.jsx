import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Search, LogOut, X, Moon, Sun } from 'lucide-react';
import { searchUsers } from '../services/api';

const Navbar = ({ onLogout }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });
    const searchRef = useRef(null);

    // Dark Mode Effect
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsLoading(true);
                setShowResults(true);
                try {
                    const data = await searchUsers(query);
                    setResults(data);
                } catch (error) {
                    console.error("Arama hatası", error);
                    setResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    // Dışarı tıklayınca kapat
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleResultClick = (userId) => {
        window.location.hash = `#profile/${userId}`;
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50 dark:bg-gray-900 dark:border-b dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Sol: Logo */}
                    <div className="cursor-pointer" onClick={() => window.location.hash = '#home'}>
                        <span className="font-bold text-xl text-blue-600 tracking-tight dark:text-blue-400">Team ToDo</span>
                    </div>

                    {/* Orta: Arama Çubuğu */}
                    <div className="flex-1 flex justify-center px-4 lg:ml-6 lg:justify-end relative" ref={searchRef}>
                        <div className="max-w-lg w-full lg:max-w-xs relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors dark:text-gray-500" />
                            </div>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => query.length >= 2 && setShowResults(true)}
                                className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 sm:text-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:bg-gray-900 dark:focus:ring-blue-900"
                                placeholder="Arkadaşını ara..."
                                type="search"
                            />
                            
                            {/* Temizleme Butonu */}
                            {query && (
                                <button 
                                    onClick={() => { setQuery(''); setResults([]); setShowResults(false); }}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}

                            {/* Arama Sonuçları Dropdown */}
                            {showResults && (
                                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 dark:bg-gray-900 dark:border-gray-700">
                                    {isLoading ? (
                                        <div className="p-4 text-center text-xs text-gray-400 animate-pulse">Aranıyor...</div>
                                    ) : results.length > 0 ? (
                                        <ul className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                                            {results.map((user) => (
                                                <li key={user.id}>
                                                    <button
                                                        onClick={() => handleResultClick(user.id)}
                                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors group/item dark:hover:bg-gray-800"
                                                    >
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm group-hover/item:scale-110 transition-transform">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-sm text-gray-700 truncate group-hover/item:text-blue-600 transition-colors">{user.username}</div>
                                                            {user.mood && <div className="text-[10px] text-gray-400 truncate">Mood: {user.mood}</div>}
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-xs text-gray-400">Sonuç bulunamadı</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sağ: İkonlar */}
                    <div className="ml-4 flex items-center space-x-2 sm:space-x-4">
                        <button 
                            onClick={() => window.location.hash = '#home'}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group relative"
                            title="Anasayfa"
                        >
                            <Home className="h-5 w-5" />
                        </button>
                        
                        <button 
                            onClick={() => window.location.hash = '#profile'}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group relative"
                            title="Profilim"
                        >
                            <User className="h-5 w-5" />
                        </button>
                        
                        <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-gray-800 dark:hover:text-yellow-400 rounded-xl transition-all"
                            title={darkMode ? "Aydınlık Mod" : "Karanlık Mod"}
                        >
                            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <div className="h-6 w-px bg-gray-100 mx-1 dark:bg-gray-700"></div>

                        <button 
                            onClick={onLogout}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title="Çıkış Yap"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;