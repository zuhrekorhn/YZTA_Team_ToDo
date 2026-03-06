import React from 'react';
import { Calendar, Square, CheckSquare, Smile, Eye } from 'lucide-react';

const UserCard = ({ user, onUserClick, onTodoClick }) => {
    // Profil yüklenmemişse hata vermesin
    if (!user) return null;

    // Bugünün tarihi
    const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    // Emojileri gruplayan yardımcı fonksiyon
    const groupReactions = (reactions) => {
        if (!reactions || !Array.isArray(reactions) || reactions.length === 0) return [];

        const groups = {};
        reactions.forEach(reaction => {
            if (!reaction) return; // Skip null/undefined

            // Backend'den bazen string bazen obje geliyor olabilir, kontrol edelim
            let emojiCode = '❓';
            let username = 'Birisi';

            if (typeof reaction === 'string') {
                emojiCode = reaction;
            } else if (typeof reaction === 'object') {
                emojiCode = reaction.code || '❓';
                username = reaction.username || 'Birisi';
            }

            if (!groups[emojiCode]) {
                groups[emojiCode] = { count: 0, users: [] };
            }
            groups[emojiCode].count += 1;
            groups[emojiCode].users.push(username);
        });

        return Object.entries(groups).map(([code, data]) => ({ code, ...data }));
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full group/card dark:bg-gray-900 dark:border-gray-800">
            {/* Kart Başlığı (Header) */}
            <div 
                onClick={() => onUserClick && onUserClick(user.id)}
                className="p-5 border-b border-gray-50 relative cursor-pointer hover:bg-gray-50 transition-colors group dark:border-gray-800 dark:hover:bg-gray-800/50"
            >
                <div className="absolute top-5 right-5 text-xs text-gray-400 font-medium group-hover:hidden dark:text-gray-500">
                    {today}
                </div>
                <div className="absolute top-5 right-5 hidden group-hover:flex items-center gap-1 text-blue-500 text-xs font-bold animate-in fade-in dark:text-blue-400">
                    <Eye size={14} /> Profili İncele
                </div>

                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 bg-gradient-to-br from-green-100 to-blue-100 border-2 border-white shadow-sm ring-1 ring-gray-100 dark:border-gray-700 dark:ring-gray-800 dark:bg-gray-800 dark:text-gray-300">
                             {/* Profil resmi yoksa baş harfi gösterelim */}
                             {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors dark:text-gray-100 dark:group-hover:text-blue-400">{user.username}</h3>
                            {/* Mood Rozeti */}
                            {user.daily_mood && (
                                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium border border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30">
                                    <Smile size={12} />
                                    Mood: {user.daily_mood}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Görevler Listesi (Body) */}
            <div className="p-5 flex-1 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2 dark:text-gray-500">
                        <Calendar size={12} /> GÜNLÜK HEDEFLER
                    </h4>
                </div>
                
                <ul className="space-y-3">
                    {user.todos && user.todos.length > 0 ? (
                        user.todos.map((todo) => (
                            <li 
                                key={todo.id} 
                                onClick={() => onTodoClick && onTodoClick(todo)}
                                className="relative bg-white p-3 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-blue-200 cursor-pointer active:scale-[0.98] group/item dark:bg-gray-900 dark:border-gray-700 dark:hover:border-blue-700"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Checkbox */}
                                    <div className={`mt-0.5 transition-colors ${todo.is_completed ? 'text-green-500 dark:text-green-400' : 'text-gray-300 group-hover/item:text-blue-400 dark:text-gray-600 dark:group-hover/item:text-blue-500'}`}>
                                        {todo.is_completed ? <CheckSquare size={20} /> : <Square size={20} />}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className={`text-sm font-semibold transition-colors block leading-tight ${
                                                todo.is_completed ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-700 group-hover/item:text-blue-700 dark:text-gray-200 dark:group-hover/item:text-blue-400'
                                            }`}>
                                                {todo.title}
                                            </span>
                                        </div>
                                        
                                        {/* Alt Bilgiler: Kategori & Öncelik */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 capitalize dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                                                {todo.category}
                                            </span>
                                            {todo.priority && (
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                                                    todo.priority === 'Yüksek' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50' :
                                                    todo.priority === 'Düşük' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50' : 
                                                    'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50'
                                                }`}>
                                                    {todo.priority}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reaksiyonlar - Slack Tarzı (Sağ Tarafta) */}
                                    {todo.reactions && todo.reactions.length > 0 && (
                                        <div className="flex flex-wrap gap-1 justify-end max-w-[35%] shrink-0">
                                            {groupReactions(todo.reactions).map((group, idx) => (
                                                <div 
                                                    key={idx}
                                                    className="group/emoji relative flex items-center gap-0.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-full px-1.5 py-0.5 transition-colors cursor-help dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-blue-900/30 dark:hover:border-blue-800"
                                                >
                                                    <span className="text-xs leading-none">{group.code}</span>
                                                    {group.count > 1 && (
                                                        <span className="text-[9px] font-bold text-gray-600 group-hover/emoji:text-blue-600">
                                                            {group.count}
                                                        </span>
                                                    )}
                                                    
                                                    {/* Tooltip (Sola Hizalı) */}
                                                    <div className="absolute top-full right-0 mt-1 hidden group-hover/emoji:block z-20 w-max max-w-[150px]">
                                                        <div className="bg-gray-800 text-white text-[10px] rounded px-2 py-1 shadow-xl text-end">
                                                            {group.users.slice(0, 3).join(", ")}
                                                            {group.users.length > 3 && ` ve ${group.users.length - 3} kişi daha`}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="text-sm text-gray-400 italic text-center py-4 bg-white/50 rounded-xl border border-dashed border-gray-200">
                            Bugün için henüz hedef eklenmemiş.
                        </li>
                    )}
                </ul>
            </div>
            
            {/* Alt Bilgi (Footer) - Opsiyonel */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
               <span>Streak: {user.streak || 0} gün</span>
            </div>
        </div>
    );
};

export default UserCard;