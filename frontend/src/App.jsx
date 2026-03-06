import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Leaderboard from './components/Leaderboard';
import SocialFeed from './components/SocialFeed';
import Login from './components/Login';
import Profile from './components/Profile';
import { getCommunityStats } from './services/api';
import { CheckCircle2 } from 'lucide-react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('home'); // 'home' | 'profile'
  const [totalCompleted, setTotalCompleted] = useState(0);

  // Hash değiştiğinde view'i güncelle
  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash.replace('#', '') || 'home';
        setView(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
      if (token && view === 'home') {
          getCommunityStats()
            .then(data => setTotalCompleted(data.total_completed))
            .catch(console.error);
      }
  }, [token, view]);

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('token'));
    window.location.hash = '#home';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.hash = '';
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 dark:bg-gray-950 dark:text-gray-100">
      <Navbar onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {view === 'home' ? (
            <>
                {totalCompleted > 0 && (
                    <div className="bg-white border-l-4 border-green-500 shadow-sm rounded-r-xl p-4 mb-6 flex items-center justify-between transition-all hover:shadow-md dark:bg-gray-900 dark:border-green-600">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-50 p-2 rounded-lg dark:bg-green-900/20">
                                <CheckCircle2 className="text-green-600 h-6 w-6 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 dark:text-gray-100">
                                    {totalCompleted} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Görev Tamamlandı</span>
                                </h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Topluluk olarak harika gidiyoruz!</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-8">
                    <section>
                        <Leaderboard />
                    </section>
                    
                    <section>
                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-white px-6 py-2 rounded-full shadow-sm text-sm text-gray-500 border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400">
                                 Arkadaşların bugün neler yapıyor?
                            </div>
                        </div>
                        <SocialFeed />
                    </section>
                </div>
            </>
        ) : view.startsWith('profile') ? (
            <Profile targetUserId={view.split('/')[1]} />
        ) : null}

      </main>
    </div>
  );
}

export default App;