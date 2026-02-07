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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-pixel emoji-icon">🍼</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-pixel p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="emoji-icon mb-4">🍼</div>
            <h1 className="pixel-font text-2xl sm:text-3xl mb-2 text-pink-600 text-shadow-pixel">
              분유만 먹던 내가
            </h1>
            <h2 className="pixel-font text-xl sm:text-2xl text-blue-600 text-shadow-pixel">
              이유식은 미식가?! 🍽️
            </h2>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="사용자 ID 입력"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="input-pixel w-full"
            />
            <button
              onClick={handleLogin}
              className="btn-pixel w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:from-pink-500 hover:to-pink-600"
            >
              🎮 시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="card-pixel p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="emoji-icon mb-3">🍽️</div>
            <h1 className="pixel-font text-2xl sm:text-3xl gradient-text mb-2">
              {currentUser.name}님의 이유식 노트
            </h1>
            <p className="text-gray-600 text-sm">RPG 인벤토리 스타일 기록장</p>
          </div>

          {/* Main Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => router.push('/diet')}
              className="btn-pixel bg-gradient-to-br from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">📅</span>
                <span className="pixel-font text-xl">식단표</span>
                <span className="text-xs opacity-80">오늘의 식사 기록</span>
              </div>
            </button>
            <button
              onClick={() => router.push('/inventory')}
              className="btn-pixel bg-gradient-to-br from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">🎒</span>
                <span className="pixel-font text-xl">창고</span>
                <span className="text-xs opacity-80">재료 인벤토리</span>
              </div>
            </button>
          </div>

          {/* Data Management Section */}
          <div className="border-t-4 border-gray-200 pt-6">
            <h2 className="pixel-font text-lg sm:text-xl text-gray-700 mb-4 flex items-center gap-2">
              <span>💾</span>
              데이터 관리
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="btn-pixel bg-gradient-to-r from-purple-400 to-purple-500 text-white hover:from-purple-500 hover:to-purple-600"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">💾</span>
                  <span>백업 (Export)</span>
                </div>
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
                  className="btn-pixel bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">📂</span>
                  <span>복구 (Import)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              💡 Tip: 정기적으로 데이터를 백업하세요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
