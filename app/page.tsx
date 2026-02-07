'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserId, getUserProfile, saveUserProfile, exportData, importData } from '@/lib/storage';
import type { UserProfile } from '@/lib/types';

export default function MainPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const existingUserId = getCurrentUserId();
    if (existingUserId) {
      const profile = getUserProfile(existingUserId);
      if (profile) {
        setCurrentUser(profile);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    if (!userId.trim()) {
      alert('사용자 ID를 입력해주세요.');
      return;
    }

    let profile = getUserProfile(userId);
    if (!profile) {
      profile = {
        id: userId,
        name: userId,
        theme: 'pastel-pink',
        createdAt: Date.now(),
      };
      saveUserProfile(profile);
    }
    setCurrentUser(profile);
  };

  const handleExport = () => {
    if (!currentUser) return;

    const data = exportData(currentUser.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gourmet_baby_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (confirm('기존 데이터를 덮어쓰게 됩니다. 계속하시겠습니까?')) {
          importData(data);
          const profile = getUserProfile(data.userProfile.id);
          if (profile) {
            setCurrentUser(profile);
          }
          alert('데이터를 성공적으로 가져왔습니다!');
        }
      } catch (error) {
        alert('잘못된 파일 형식입니다.');
      }
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-4 border-pink-300">
          <h1 className="text-3xl font-bold text-center mb-2 text-pink-600">
            🍼 분유만 먹던 내가
          </h1>
          <h2 className="text-2xl font-bold text-center mb-8 text-blue-600">
            이유식은 미식가?! 🍽️
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="사용자 ID 입력"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-pink-500"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold hover:bg-pink-600 transition"
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-pink-300">
          <h1 className="text-3xl font-bold text-center mb-8 text-pink-600">
            🍽️ {currentUser.name}님의 이유식 노트
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => router.push('/diet')}
              className="bg-blue-500 text-white py-6 rounded-xl font-bold text-xl hover:bg-blue-600 transition border-4 border-blue-700"
            >
              📅 식단표
            </button>
            <button
              onClick={() => router.push('/inventory')}
              className="bg-green-500 text-white py-6 rounded-xl font-bold text-xl hover:bg-green-600 transition border-4 border-green-700"
            >
              🎒 창고
            </button>
          </div>

          <div className="border-t-2 border-gray-200 pt-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-700 mb-4">데이터 관리</h2>
            <button
              onClick={handleExport}
              className="w-full bg-purple-500 text-white py-3 rounded-lg font-bold hover:bg-purple-600 transition"
            >
              💾 데이터 백업 (Export)
            </button>
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <div
                onClick={() => document.getElementById('import-file')?.click()}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition text-center cursor-pointer"
              >
                📂 데이터 복구 (Import)
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
