import React, { useEffect, useState } from 'react';
import { getSocialFeed, reactToTodo } from '../services/api';
import UserCard from './UserCard';
import { Loader2, X, MessageSquare, ThumbsUp, Heart, Star, Flame, CloudLightning } from 'lucide-react';

const SocialFeed = () => {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTodo, setSelectedTodo] = useState(null);

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            const data = await getSocialFeed();
            setFeed(data);
        } catch (error) {
            console.error("Akış yüklenemedi", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (userId) => {
        window.location.hash = `#profile/${userId}`;
    };

    const handleTodoClick = (todo) => {
        setSelectedTodo(todo);
    };

    const handleReaction = async (emojiCode) => {
        if (!selectedTodo) return;
        try {
            await reactToTodo(selectedTodo.id, emojiCode);
            // Reaksiyon eklendikten sonra UI'ı güncellemek için feed'i tekrar çekebiliriz
            // veya manuel update yapabiliriz (daha performanslı olur ama şimdilik fetch yeterli)
            await fetchFeed();
            setSelectedTodo(null); // Modalı kapat
        } catch (error) {
            console.error("Tepki verilemedi", error);
        }
    };

    const reactionOptions = [
        { code: "🔥", label: "Harika", icon: Flame, color: "text-orange-500 bg-orange-50" },
        { code: "👍", label: "Beğen", icon: ThumbsUp, color: "text-blue-500 bg-blue-50" },
        { code: "❤️", label: "Sevdim", icon: Heart, color: "text-red-500 bg-red-50" },
        { code: "⭐", label: "Süper", icon: Star, color: "text-yellow-500 bg-yellow-50" },
        { code: "⚡", label: "Hızlı", icon: CloudLightning, color: "text-green-600 bg-green-50" },
    ];

    if (loading) {
        return (
            <div className="flex justify-center p-10">
                <Loader2 className="animate-spin text-blue-500 h-10 w-10" />
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feed.map((user) => (
                    <UserCard 
                        key={user.id} 
                        user={user} 
                        onUserClick={() => handleUserClick(user.id)}
                        onTodoClick={handleTodoClick}
                    />
                ))}
                {feed.length === 0 && (
                    <div className="col-span-3 text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm dark:bg-gray-900 dark:text-gray-400 dark:border dark:border-gray-800">
                        Henüz takip ettiğin kimse yok veya arkadaşların bugünlük bir şey paylaşmamış.
                    </div>
                )}
            </div>

            {/* Todo Detay ve Reaksiyon Modalı */}
            {selectedTodo && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm dark:bg-black/70">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200 dark:bg-gray-900 dark:border dark:border-gray-800">
                        <button 
                            onClick={() => setSelectedTodo(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition dark:hover:bg-gray-800 dark:hover:text-gray-300"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="mb-6">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block dark:bg-blue-900/20 dark:text-blue-400">
                                {selectedTodo.category.toUpperCase()}
                            </span>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 dark:text-gray-100">
                                {selectedTodo.title}
                            </h3>
                            {selectedTodo.description ? (
                                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                                    {selectedTodo.description}
                                </p>
                            ) : (
                                <p className="text-gray-400 text-sm italic dark:text-gray-500">
                                    Açıklama girilmemiş.
                                </p>
                            )}
                        </div>

                        <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block text-center dark:text-gray-500">
                                Bir Tepki Bırak
                            </label>
                            <div className="flex justify-between gap-2">
                                {reactionOptions.map((option) => (
                                    <button
                                        key={option.code}
                                        onClick={() => handleReaction(option.code)}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${option.color} w-full dark:bg-opacity-10 dark:text-opacity-90`}
                                        title={option.label}
                                    >
                                        <span className="text-xl">{option.code}</span>
                                        {/* <option.icon size={16} /> */}
                                        {/* <span className="text-[10px] font-bold">{option.label}</span> */}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SocialFeed;