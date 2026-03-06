import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserMood, getMyTodos, createTodo, completeTodo, deleteTodo, patchTodo, updateTodo, getUserStats, getOtherUserProfile, getOtherUserTodos, getOtherUserStats, reactToTodo } from '../services/api'; 
import { User, Flame, Calendar, Trash2, CheckCircle, Circle, Plus, Smile, ArrowUpRight, ArrowDownLeft, Clock, AlignLeft, AlertCircle, X, Lock, Globe, PieChart, TrendingUp, Shield, Flame as FlameIcon, ThumbsUp, Heart, Star, CloudLightning } from 'lucide-react';

const Profile = ({ targetUserId }) => {
    const [user, setUser] = useState(null);
    const [todos, setTodos] = useState([]);
    const [stats, setStats] = useState(null);
    const [viewTodo, setViewTodo] = useState(null); // State for visitor modal
    const isOwner = !targetUserId; // Eğer targetUserId yoksa kendi profilimdir
    
    // Edit Modal State
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        category: 'kişisel',
        priority: 'Orta',
        due_date: '',
        is_daily: false,
        is_public: true
    });
    
    // Form State'leri
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [newTodoDescription, setNewTodoDescription] = useState('');
    const [newTodoCategory, setNewTodoCategory] = useState('kişisel');
    const [newTodoPriority, setNewTodoPriority] = useState('Orta');
    const [newTodoDueDate, setNewTodoDueDate] = useState('');
    const [isDaily, setIsDaily] = useState(false);
    const [isPublic, setIsPublic] = useState(true);

    const [mood, setMood] = useState('');
    const [loading, setLoading] = useState(true);

    const categories = [
        { value: 'kişisel', label: 'Kişisel' },
        { value: 'üniversite', label: 'Üniversite' },
        { value: 'moodle', label: 'Moodle' },
        { value: 'coursera', label: 'Coursera' },
        { value: 'eğlence', label: 'Eğlence' },
    ];

    const priorities = ["Düşük", "Orta", "Yüksek"];

    const moods = [
        "Mutlu", "Yorgun", "Heyecanlı", "Odaklanmış", 
        "Rahat", "Stresli", "Üretken", "Uykulu", 
        "Hasta", "Enerjik", "Sıkılmış", "Meraklı",
        "Sinirli", "Huzurlu", "Şaşkın"
    ];

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [targetUserId]); // targetUserId değişirse tekrar yükle

    const fetchData = async () => {
        try {
            let userData, todoData, statsData;

            if (isOwner) {
                // Kendi verilerim
                [userData, todoData, statsData] = await Promise.all([getUserProfile(), getMyTodos(), getUserStats()]);
            } else {
                // Başkasının verileri
                [userData, todoData, statsData] = await Promise.all([
                    getOtherUserProfile(targetUserId), 
                    getOtherUserTodos(targetUserId),
                    getOtherUserStats(targetUserId)
                ]);
            }
            
            setUser(userData);
            setMood(userData.daily_mood || '');
            setTodos(todoData);
            setStats(statsData);
        } catch (error) {
            console.error("Profil verileri yüklenemedi", error);
        } finally {
            setLoading(false);
        }
    };
    
    // Veri güncelleme fonksiyonu (complete/delete sonrası istatistikleri yenilemek için)
    const refreshStats = async () => {
        if (!isOwner) return; // Sadece kendi profilimde istatistikleri yenilemeye gerek var (action alabiliyorsam)
        try {
            const statsData = await getUserStats();
            setStats(statsData);
        } catch (error) {
            console.error("İstatistikler yenilenemedi", error);
        }
    }

    const handleMoodChange = async (selectedMood) => {
        if (!isOwner) return; // Başkasının moodunu değiştiremezsin
        try {
            setMood(selectedMood);
            await updateUserMood(selectedMood);
            setUser(prev => ({ ...prev, daily_mood: selectedMood }));
        } catch (error) {
            console.error("Mood güncellenemedi", error);
        }
    };

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!isOwner) return;
        
        if (!newTodoTitle.trim()) return;

        try {
            const newTodo = {
                title: newTodoTitle,
                description: newTodoDescription,
                category: newTodoCategory,
                priority: newTodoPriority,
                due_date: newTodoDueDate ? new Date(newTodoDueDate).toISOString() : null,
                is_daily: isDaily,
                is_public: isPublic,
            };
            
            await createTodo(newTodo);
            
            // Formu temizle
            setNewTodoTitle('');
            setNewTodoDescription('');
            setNewTodoPriority('Orta');
            setNewTodoDueDate('');
            // Listeyi yenile
            const updatedTodos = await getMyTodos();
            setTodos(updatedTodos);
        } catch (error) {
            console.error("Ödev eklenemedi", error);
        }
    };

    const handleComplete = async (id, currentStatus) => {
        if (!isOwner) return;

        try {
            // Optimistic Update
            setTodos(todos.map(todo => 
                todo.id === id ? { ...todo, is_completed: !currentStatus } : todo
            ));

            await completeTodo(id);
            
            if (!currentStatus) {
                const updatedUser = await getUserProfile();
                setUser(updatedUser);
            }
            // İstatistikleri güncelle
            refreshStats();

        } catch (error) {
            console.error("İşlem başarısız", error);
        }
    };

    const toggleDailyStatus = async (id, currentIsDaily) => {
        if (!isOwner) return;
        try {
            await patchTodo(id, { is_daily: !currentIsDaily });
            setTodos(todos.map(todo => 
                todo.id === id ? { ...todo, is_daily: !currentIsDaily } : todo
            ));
        } catch (error) {
            console.error("Daily durum değiştirilemedi", error);
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!isOwner) return;
        if (!selectedTodo || !editFormData.title.trim()) return;

        try {
            await updateTodo(selectedTodo.id, {
                ...editFormData,
                due_date: editFormData.due_date ? new Date(editFormData.due_date).toISOString() : null
            });
            
            // Listeyi yenile
            const updatedTodos = await getMyTodos();
            setTodos(updatedTodos);
            setSelectedTodo(null); // Modalı kapat
        } catch (error) {
            console.error("Güncelleme başarısız", error);
        }
    };

    const openEditModal = (todo) => {
        // Sadece okuma modu ise (başkasının profili), düzenleme modalını açma
        // Veya "View Only Modal" açabiliriz ama şimdilik disable edelim veya salt okunur modal yapalım
        if (!isOwner) return; 

        setSelectedTodo(todo);
        setEditFormData({
            title: todo.title,
            description: todo.description || '',
            category: todo.category,
            priority: todo.priority,
            due_date: todo.due_date ? new Date(todo.due_date).toISOString().split('T')[0] : '',
            is_daily: todo.is_daily,
            is_public: todo.is_public
        });
    };

    const handleDelete = async (id) => {
        if (!isOwner) return;
        if (!window.confirm("Bu görevi silmek istediğine emin misin?")) return;
        try {
            await deleteTodo(id);
            setTodos(todos.filter(t => t.id !== id));
            refreshStats(); // İstatistikleri güncelle
        } catch (error) {
            console.error("Silinemedi", error);
        }
    };

    const reactionOptions = [
        { code: "🔥", label: "Harika", icon: FlameIcon, color: "text-orange-500 bg-orange-50" },
        { code: "👍", label: "Beğen", icon: ThumbsUp, color: "text-blue-500 bg-blue-50" },
        { code: "❤️", label: "Sevdim", icon: Heart, color: "text-red-500 bg-red-50" },
        { code: "⭐", label: "Süper", icon: Star, color: "text-yellow-500 bg-yellow-50" },
        { code: "⚡", label: "Hızlı", icon: CloudLightning, color: "text-purple-500 bg-purple-50" },
    ];

    const groupReactions = (reactions) => {
        if (!reactions || !Array.isArray(reactions) || reactions.length === 0) return [];
        const groups = {};
        reactions.forEach(reaction => {
            if (!reaction) return;
            let emojiCode = typeof reaction === 'string' ? reaction : (reaction.code || '❓');
            if (!groups[emojiCode]) groups[emojiCode] = { count: 0 };
            groups[emojiCode].count += 1;
        });
        return Object.entries(groups).map(([code, data]) => ({ code, ...data }));
    };

    const handleReaction = async (emojiCode) => {
        if (!viewTodo) return;
        try {
            await reactToTodo(viewTodo.id, emojiCode);
            fetchData();
            setViewTodo(null);
        } catch (error) {
            console.error("Tepki verilemedi", error);
        }
    };

    const handleTodoClick = (todo) => {
        if (isOwner) {
            openEditModal(todo);
        } else {
            setViewTodo(todo);
        }
    };

    const dailyTodos = todos.filter(t => t.is_daily);
    const backlogTodos = todos.filter(t => !t.is_daily);

    if (loading) return <div className="text-center p-10">Yükleniyor...</div>;

    const TodoItem = ({ todo, listType }) => (
        <div 
            onClick={() => handleTodoClick(todo)}
            className={`flex items-center justify-between p-4 mb-3 rounded-xl border transition-all group cursor-pointer ${
                todo.is_completed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'
            }`}
        >
            <div className="flex items-center gap-4">
                <button 
                    onClick={(e) => { e.stopPropagation(); isOwner && handleComplete(todo.id, todo.is_completed); }}
                    className={`transition-colors flex-shrink-0 ${todo.is_completed ? 'text-green-500' : (isOwner ? 'text-gray-300 hover:text-green-500' : 'text-gray-300 cursor-default')}`}
                    disabled={!isOwner}
                >
                    {todo.is_completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                
                <div>
                    <p className={`font-semibold ${todo.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {todo.title}
                    </p>
                    {/* Açıklama varsa göster (küçük) */}
                    {todo.description && <p className="text-xs text-gray-400 truncate max-w-xs">{todo.description}</p>}
                    
                    <div className="flex gap-2 text-xs mt-1">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-500">{todo.category}</span>
                        {/* Öncelik Badge */}
                        <span className={`px-2 py-0.5 rounded ${
                            todo.priority === 'Yüksek' ? 'bg-red-100 text-red-600' :
                            todo.priority === 'Düşük' ? 'bg-green-100 text-green-600' : 
                            'bg-orange-100 text-orange-600'
                        }`}>
                            {todo.priority}
                        </span>
                        {/* Tarih varsa */}
                        {todo.due_date && (
                            <span className="flex items-center gap-1 text-gray-400">
                                <Clock size={12} /> {new Date(todo.due_date).toLocaleDateString('tr-TR')}
                            </span>
                        )}
                        {/* Public/Private Indicator ve Reaksiyonlar */}
                        <div className="flex items-center gap-2">
                             {todo.is_public !== undefined && (
                                <span className="text-gray-400">
                                    {todo.is_public ? <Globe size={12} /> : <Lock size={12} />}
                                </span>
                            )}
                            
                            {/* Reaksiyon Göstergesi (Slack Style) */}
                            {todo.reactions && todo.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 ml-2">
                                    {groupReactions(todo.reactions).map((group, idx) => (
                                        <div 
                                            key={idx}
                                            className="flex items-center gap-0.5 bg-gray-50 border border-gray-200 rounded-full px-1.5 py-0.5"
                                            title={`${group.count} kişi`}
                                        >
                                            <span className="text-[10px] leading-none">{group.code}</span>
                                            {group.count > 1 && (
                                                <span className="text-[9px] font-bold text-gray-500">
                                                    {group.count}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isOwner && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => toggleDailyStatus(todo.id, todo.is_daily)}
                        className={`p-2 rounded-lg transition-colors ${
                            listType === 'daily' 
                            ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' 
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title={listType === 'daily' ? "Backlog'a Geri Gönder" : "Bugünün Yapılacaklarına Ekle (Sprint)"}
                    >
                        {listType === 'daily' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </button>

                    <button 
                        onClick={() => handleDelete(todo.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sol Kolon: Profil Kartı */}
            <div className="md:col-span-1 space-y-6">
                
                {/* Ziyaretçi Modu Uyarısı */}
                {!isOwner && (
                     <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3 text-blue-800 text-sm shadow-sm">
                        <Shield className="w-5 h-5" />
                        <span className="font-semibold">{user?.username} profiline bakıyorsun.</span>
                     </div>
                )}

                {/* User Info */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 text-center sticky top-24">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-4xl text-white font-bold mb-4 shadow-xl">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{user?.username}</h2>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    
                    <div className="flex items-center justify-center gap-2 mt-4 bg-orange-50 py-2 rounded-lg text-orange-600 font-bold border border-orange-100">
                        <Flame className="fill-orange-500" />
                        <span>{user?.current_streak} Günlük Seri</span>
                    </div>

                    {/* Sıralama Kartı */}
                    {stats?.summary?.rank > 0 && (
                        <div className="flex items-center justify-center gap-2 mt-2 bg-yellow-50 py-2 rounded-lg text-yellow-700 font-bold border border-yellow-100 shadow-sm">
                            <span className="text-lg">🏆</span>
                            <span>Sıralama: #{stats.summary.rank}</span>
                        </div>
                    )}

                    {/* Mood Selector */}
                    <div className="mt-8 text-left">
                         <label className="text-xs font-bold text-gray-400 uppercase mb-3 block tracking-wide flex items-center gap-2">
                             <Smile size={14} /> Bugünün Modu
                         </label>
                        <div className="flex flex-wrap gap-2">
                            {moods.map((m) => (
                                <button
                                    key={m}
                                    onClick={() => handleMoodChange(m)}
                                    // Sadece sahibi tıklayabilir
                                    disabled={!isOwner}
                                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                        mood === m 
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-105' 
                                        : (isOwner ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' : 'bg-gray-50 border-gray-100 text-gray-400 cursor-default')
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* İstatistikler */}
                    {stats && (
                        <div className="mt-8 text-left border-t border-gray-100 pt-6">

                            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block tracking-wide flex items-center gap-2">
                                <PieChart size={14} /> Kategori Bazlı Tamamlanan
                            </label>
                            
                            {/* Genel İstatistik Kartı */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-4 border border-blue-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-600 text-xs font-semibold flex items-center gap-1">
                                        <TrendingUp size={12} className="text-green-500"/> Genel başarı
                                    </span>
                                    <span className="text-blue-700 font-bold text-sm">%{Math.round(stats.summary.completion_rate)}</span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-1.5 ">
                                    <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{width: `${stats.summary.completion_rate}%`}}></div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                    <span>Tamamlanan: {stats.summary.completed}</span>
                                    <span>Toplam: {stats.summary.total}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(stats.by_category).map(([cat, count]) => {
                                   if(count === 0) return null;
                                   const percentage = stats.summary.completed > 0 ? Math.round((count / stats.summary.completed) * 100) : 0;
                                   // Kategoriye göre renk belirleme (basit bir mantık)
                                   const colors = {
                                        'kişisel': 'bg-purple-500',
                                        'üniversite': 'bg-blue-500',
                                        'moodle': 'bg-orange-500',
                                        'coursera': 'bg-indigo-500',
                                        'eğlence': 'bg-pink-500'
                                    };
                                    const barColor = colors[cat.toLowerCase()] || 'bg-gray-500';

                                   return (
                                        <div key={cat} className="group">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-xs font-semibold text-gray-600 capitalize flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${barColor}`}></span>
                                                    {cat}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {count} Görev <span className="text-gray-300 text-[10px]">({percentage}%)</span>
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                                                    style={{width: `${percentage}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                   ) 
                                })}
                                {/* Hiç veri yoksa gösterilecek */}
                                {Object.values(stats.by_category).every(c => c === 0) && (
                                     <p className="text-xs text-gray-400 text-center italic py-2">Henüz tamamlanan görev yok.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sağ Kolon: Görev Yönetimi */}
            <div className="md:col-span-2 space-y-8">
                
                {/* 1. Kapsamlı Görev Ekleme Formu - Sadece Profil Sahibi Görebilir */}
                {isOwner && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <Plus className="bg-blue-100 text-blue-600 rounded p-1 w-6 h-6" />
                            Yeni Hedef Ekle
                        </h3>
                        <form onSubmit={handleAddTodo} className="space-y-4">
                            {/* Başlık */}
                            <div>
                                <input 
                                    type="text" 
                                    placeholder="Ne yapmayı planlıyorsun?" 
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                                    value={newTodoTitle}
                                    onChange={(e) => setNewTodoTitle(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Detay / Açıklama */}
                            <div className="relative">
                                <AlignLeft className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
                                <textarea 
                                    placeholder="Gerekirse detay ekle..." 
                                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm min-h-[80px]"
                                    value={newTodoDescription}
                                    onChange={(e) => setNewTodoDescription(e.target.value)}
                                />
                            </div>

                            {/* Tüm Seçenekler (Grid) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Kategori */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 font-semibold">Kategori</label>
                                    <select 
                                        value={newTodoCategory}
                                        onChange={(e) => setNewTodoCategory(e.target.value)}
                                        className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none w-full"
                                    >
                                        {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                    </select>
                                </div>

                                {/* Öncelik */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 font-semibold">Öncelik</label>
                                    <select 
                                        value={newTodoPriority}
                                        onChange={(e) => setNewTodoPriority(e.target.value)}
                                        className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none w-full"
                                    >
                                        {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>

                                {/* Tarih */}
                                <div className="flex flex-col gap-1 sm:col-span-2">
                                    <label className="text-xs text-gray-500 font-semibold">Bitiş Tarihi (Opsiyonel)</label>
                                    <input 
                                        type="date"
                                        value={newTodoDueDate}
                                        onChange={(e) => setNewTodoDueDate(e.target.value)}
                                        className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none w-full text-gray-600"
                                    />
                                </div>
                            </div>

                            {/* Checkboxlar ve Buton */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                            <div className="flex gap-6">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={isDaily} 
                                            onChange={(e) => setIsDaily(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                        />
                                        <span>Günlük Yapılacaklar</span>
                                    </label>

                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={isPublic} 
                                            onChange={(e) => setIsPublic(e.target.checked)}
                                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                                        />
                                        <span>Herkese Açık (Public)</span>
                                    </label>
                            </div>

                                <button 
                                    type="submit" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg"
                                >
                                    Oluştur
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* 2. Günlük Sprint Listesi */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-blue-50/50 border-b border-blue-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Clock className="text-blue-600 w-5 h-5"/>
                            Günlük Yapılacaklar
                        </h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{dailyTodos.length}</span>
                    </div>
                    <div className="p-4">
                        {dailyTodos.length === 0 ? (
                             <p className="text-gray-400 text-center text-sm py-4 italic">Bugün için henüz bir planın yok.</p>
                        ) : (
                            dailyTodos.map(todo => <TodoItem key={todo.id} todo={todo} listType="daily" />)
                        )}
                    </div>
                </div>

                {/* 3. Genel Backlog Listesi */}
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                             <Calendar className="text-gray-500 w-5 h-5"/>
                             Genel Yapılacaklar
                        </h3>
                        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{backlogTodos.length}</span>
                    </div>
                    <div className="p-4">
                        {backlogTodos.length === 0 ? (
                             <p className="text-gray-400 text-center text-sm py-4 italic">Backlog tertemiz!</p>
                        ) : (
                            backlogTodos.map(todo => <TodoItem key={todo.id} todo={todo} listType="backlog" />)
                        )}
                    </div>
                </div>

            </div>

            {/* Edit Modal */}
            {selectedTodo && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setSelectedTodo(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"
                        >
                            <X size={24} />
                        </button>
                        
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                             Güncelle: <span className="text-blue-600 truncate max-w-[200px]">{selectedTodo.title}</span>
                        </h3>
                        
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                             <div>
                                <label className="text-xs text-gray-500 font-semibold mb-1 block">Başlık</label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 font-semibold mb-1 block">Açıklama</label>
                                <textarea 
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm min-h-[80px]"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 font-semibold">Kategori</label>
                                    <select 
                                        value={editFormData.category}
                                        onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                                        className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none w-full"
                                    >
                                        {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 font-semibold">Öncelik</label>
                                    <select 
                                        value={editFormData.priority}
                                        onChange={(e) => setEditFormData({...editFormData, priority: e.target.value})}
                                        className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none w-full"
                                    >
                                        {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500 font-semibold">Bitiş Tarihi</label>
                                <input 
                                    type="date"
                                    value={editFormData.due_date}
                                    onChange={(e) => setEditFormData({...editFormData, due_date: e.target.value})}
                                    className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none w-full text-gray-600"
                                />
                            </div>

                            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={editFormData.is_daily} 
                                        onChange={(e) => setEditFormData({...editFormData, is_daily: e.target.checked})}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                    />
                                    <span>Günlük Yapılacaklar Listesinde</span>
                                </label>

                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={editFormData.is_public} 
                                        onChange={(e) => setEditFormData({...editFormData, is_public: e.target.checked})}
                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                                    />
                                    <span>Herkese Açık (Public)</span>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedTodo(null)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium text-sm transition"
                                >
                                    Vazgeç
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg"
                                >
                                    Değişiklikleri Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View/React Modal (Visitor Only) */}
            {viewTodo && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setViewTodo(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="mb-6">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">
                                {viewTodo.category.toUpperCase()}
                            </span>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {viewTodo.title}
                            </h3>
                            {viewTodo.description ? (
                                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {viewTodo.description}
                                </p>
                            ) : (
                                <p className="text-gray-400 text-sm italic">
                                    Açıklama girilmemiş.
                                </p>
                            )}
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block text-center">
                                Bir Tepki Bırak
                            </label>
                            <div className="flex justify-between gap-2">
                                {reactionOptions.map((option) => (
                                    <button
                                        key={option.code}
                                        onClick={() => handleReaction(option.code)}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${option.color} w-full`}
                                        title={option.label}
                                    >
                                        <span className="text-xl">{option.code}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;