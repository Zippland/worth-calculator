"use client";

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import { LanguageProvider } from '@/components/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// 动态导入ShareCard组件，禁用SSR
const ShareCard = dynamic(() => import('@/components/ShareCard'), { ssr: false });

// 一个包装组件，负责从URL参数获取数据
function ShareCardWrapper() {
  const searchParams = useSearchParams();
  
  // 从URL参数中获取数据 - 基础数据
  const value = searchParams.get('value') || '0';
  const assessment = searchParams.get('assessment') || '请输入年薪';
  const assessmentColor = searchParams.get('assessmentColor') || 'text-gray-500';
  const cityFactor = searchParams.get('cityFactor') || '1.0';
  const workHours = searchParams.get('workHours') || '10';
  const commuteHours = searchParams.get('commuteHours') || '2';
  const restTime = searchParams.get('restTime') || '2';
  const dailySalary = searchParams.get('dailySalary') || '0';
  const isYuan = searchParams.get('isYuan') || 'true';
  const workDaysPerYear = searchParams.get('workDaysPerYear') || '250';
  const countryCode = searchParams.get('countryCode') || 'CN';
  const countryName = searchParams.get('countryName') || '中国';
  const currencySymbol = searchParams.get('currencySymbol') || '¥';
  
  // 额外参数 - 详细工作信息
  const workDaysPerWeek = searchParams.get('workDaysPerWeek') || '5';
  const wfhDaysPerWeek = searchParams.get('wfhDaysPerWeek') || '0';
  const annualLeave = searchParams.get('annualLeave') || '5';
  const paidSickLeave = searchParams.get('paidSickLeave') || '12';
  const publicHolidays = searchParams.get('publicHolidays') || '13';
  
  // 额外参数 - 工作环境
  const workEnvironment = searchParams.get('workEnvironment') || '1.0';
  const leadership = searchParams.get('leadership') || '1.0';
  const teamwork = searchParams.get('teamwork') || '1.0';
  const homeTown = searchParams.get('homeTown') || 'no';
  const shuttle = searchParams.get('shuttle') || '1.0';
  const canteen = searchParams.get('canteen') || '1.0';
  const climate = searchParams.get('climate') || '1.0';
  const hasShuttle = searchParams.get('hasShuttle') === 'true';
  const hasCanteen = searchParams.get('hasCanteen') === 'true';
  const hasClimate = searchParams.get('hasClimate') === 'true';
  
  // 额外参数 - 学历和工作经验
  const degreeType = searchParams.get('degreeType') || 'bachelor';
  const schoolType = searchParams.get('schoolType') || 'elite';
  const bachelorType = searchParams.get('bachelorType') || 'elite';
  const education = searchParams.get('education') || '1.2';
  const workYears = searchParams.get('workYears') || '0';
  const jobStability = searchParams.get('jobStability') || 'private';
  
  return (
    <div>
      <ShareCard
        // 基础数据
        value={value}
        assessment={assessment}
        assessmentColor={assessmentColor}
        cityFactor={cityFactor}
        workHours={workHours}
        commuteHours={commuteHours}
        restTime={restTime}
        dailySalary={dailySalary}
        isYuan={isYuan}
        workDaysPerYear={workDaysPerYear}
        countryCode={countryCode}
        countryName={countryName}
        currencySymbol={currencySymbol}
        
        // 详细工作信息
        workDaysPerWeek={workDaysPerWeek}
        wfhDaysPerWeek={wfhDaysPerWeek}
        annualLeave={annualLeave}
        paidSickLeave={paidSickLeave}
        publicHolidays={publicHolidays}
        
        // 工作环境
        workEnvironment={workEnvironment}
        leadership={leadership}
        teamwork={teamwork}
        homeTown={homeTown}
        shuttle={shuttle}
        canteen={canteen}
        climate={climate}
        hasShuttle={hasShuttle}
        hasCanteen={hasCanteen}
        hasClimate={hasClimate}
        
        // 学历和工作经验
        degreeType={degreeType}
        schoolType={schoolType}
        bachelorType={bachelorType}
        education={education}
        workYears={workYears}
        jobStability={jobStability}
      />
    </div>
  );
}

// 加载过程中显示的组件
function ShareLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="mb-2">正在加载报告...</div>
      <div>Loading report...</div>
    </div>
  );
}

// 主页面组件
export default function SharePage() {
  return (
    <LanguageProvider>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-4">
            <LanguageSwitcher />
          </div>
          <Suspense fallback={<ShareLoading />}>
            <ShareCardWrapper />
          </Suspense>
        </div>
      </main>
    </LanguageProvider>
  );
} 