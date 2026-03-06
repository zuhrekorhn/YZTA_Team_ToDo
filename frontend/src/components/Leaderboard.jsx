import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/api'; // getLeaderboard fonksiyonunun doğru import edildiğinden emin olun
import { Flame, Trophy, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard();
                // Verinin dizi olup olmadığını kontrol et
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error("Beklenmedik veri formatı:", data);
                    setUsers([]);
                }
            } catch (error) {
                console.error("Liderlik tablosu yüklenemedi", error);
                setUsers([]);
            }
        };

        fetchLeaderboard();
        
        // Opsiyonel: Her 30 saniyede bir güncelle
        const interval = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(interval);
    }, []);

    // Sıralama ikonu ve numara yardımcı fonksiyonu
    const renderRank = (index) => {
        const rank = index + 1;
        let icon = null;
        let colorClass = "text-gray-500 dark:text-gray-400";

        if (rank === 1) {
            icon = <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-100 dark:fill-yellow-900/30" />;
            colorClass = "text-yellow-600 dark:text-yellow-400 font-extrabold";
        } else if (rank === 2) {
            icon = <Medal className="h-4 w-4 text-slate-500 fill-slate-200 dark:text-slate-400 dark:fill-slate-700" />;
            colorClass = "text-slate-600 dark:text-slate-300 font-bold";
        } else if (rank === 3) {
            icon = <Medal className="h-4 w-4 text-orange-400 fill-orange-100 dark:text-orange-300 dark:fill-orange-900/30" />;
            colorClass = "text-orange-600 dark:text-orange-400 font-bold";
        } else {
            // Hizalama için boşluk (gerekirse div)
        }

        return (
            <div className={`flex items-center justify-center gap-1 ${colorClass} w-8`}>
                <span className="text-sm w-4 text-right">{rank}.</span>
                {icon}
            </div>
        );
    };

    // Kullanıcı kartı render eden yardımcı fonksiyon
    const renderUserCard = (user, index) => (
        <div 
            key={index} 
            className={`flex items-center justify-between p-3 rounded-xl transition-all border dark:border-gray-700 ${
                user.is_me 
                ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:ring-blue-900' 
                : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md dark:bg-gray-800 dark:hover:border-gray-600'
            }`}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex-shrink-0">
                    {renderRank(index)}
                </div>
                
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`
                        h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm
                        ${index === 0 ? 'bg-gradient-to-tr from-yellow-400 to-orange-500' : 
                          index === 1 ? 'bg-gradient-to-tr from-slate-400 to-slate-600' :
                          index === 2 ? 'bg-gradient-to-tr from-orange-300 to-red-400' :
                          'bg-gradient-to-tr from-blue-400 to-blue-600'}
                    `}>
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate text-xs dark:text-gray-200">
                            {user.username} {user.is_me && <span className="text-blue-600 ml-1 dark:text-blue-400">(Sen)</span>}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate dark:text-gray-500">{user.mood || "Mood yok"}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded-lg text-orange-600 font-bold text-[10px] border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/40">
                    <Flame className="h-3 w-3 fill-orange-500 dark:text-orange-400" />
                    <span>{user.streak}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-50 rounded-xl dark:bg-yellow-900/20">
                        <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                         <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Liderlik Tablosu</h2>
                         <p className="text-[10px] text-gray-500 font-medium dark:text-gray-400">Sıralama seri (streak) gün sayısına göre belirlenir. İstikrarlı ol, zirveye çık!</p>
                    </div>
                </div>
            </div>

            {users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Sütun: İlk 3 kişi (1, 2, 3) */}
                    <div className="flex flex-col space-y-3">
                        <div className="text-xs font-bold text-gray-400 uppercase mb-3 pl-1 dark:text-gray-500">Liderler</div>
                        {users.slice(0, 3).map((user, i) => renderUserCard(user, i))}
                    </div>

                    {/* 2. Sütun: Sonraki 3 kişi (4, 5, 6) */}
                    <div className="flex flex-col space-y-3">
                        <div className="text-xs font-bold text-gray-400 uppercase mb-3 pl-1 hidden md:block dark:text-gray-500">&nbsp;</div>
                        {users.slice(3, 6).map((user, i) => renderUserCard(user, i + 3))}
                    </div>

                    {/* 3. Sütun: Son 3 kişi (7, 8, 9) */}
                    <div className="flex flex-col space-y-3">
                        <div className="text-xs font-bold text-gray-400 uppercase mb-3 pl-1 hidden md:block dark:text-gray-500">&nbsp;</div>
                        {users.slice(6, 9).map((user, i) => renderUserCard(user, i + 6))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    Henüz kimse skor yapmamış. İlk sen ol!
                </div>
            )}
        </div>
    );
};

export default Leaderboard;