"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Wallet, Github, FileText, History, X, Eye } from "lucide-react"; // 添加History、X和Eye图标
import Link from "next/link"; // 导入Link组件用于导航
import { useRouter } from "next/router"; // 导入router用于导航

// 定义历史记录项的类型
interface HistoryRecord {
  id: string;
  timestamp: number;
  formData: any;
  value: number;
  assessment: string;
  assessmentColor: string;
  dailySalary: string;
  isYuan: boolean;
  workDaysPerYear: number;
}

const SalaryCalculator = () => {
  // 添加历史记录状态
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 添加滚动位置保存的引用
  const scrollPositionRef = useRef(0);

  // 添加自动重定向逻辑
  useEffect(() => {
    // 在所有环境中执行重定向
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (
        hostname !== "worthjob.zippland.com" &&
        hostname !== "localhost" &&
        !hostname.includes("127.0.0.1")
      ) {
        window.location.href =
          "https://worthjob.zippland.com" + window.location.pathname;
      }
    }
  }, []);

  // 从本地存储加载历史记录
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedHistory = localStorage.getItem("worthCalculatorHistory");
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          setHistoryRecords(parsedHistory);
        }
      } catch (error) {
        console.error("Error loading history:", error);
      }
    }
  }, []);

  // 添加用于创建分享图片的引用
  const shareResultsRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    annualSalary: "", // 年薪
    pppFactor: "4.19", // 购买力平价转换因子，默认为中国大陆
    country: "china", // 国家/地区，默认为中国
    workDaysPerWeek: "5", // 每周工作天数
    wfhDaysPerWeek: "0", // 每周居家办公天数
    annualLeave: "5", // 年假天数
    paidSickLeave: "12", // 带薪病假天数
    publicHolidays: "13", // 法定节假日
    workHours: "10", // 工作时长
    commuteHours: "2", // 通勤时长
    restTime: "2", // 休息时间（午休+摸鱼）
    workEnvironment: "1.0", // 工作环境系数
    leadership: "1.0", // 领导/老板系数
    teamwork: "1.0", // 同事环境系数
    degreeType: "bachelor", // 学位类型，改为本科
    schoolType: "elite", // 学校类型
    bachelorType: "elite", // 新增：本科背景类型
    education: "1.2", // 学历系数，修改为对应本科985/211的系数
    cityFactor: "1.0", // 城市系数，默认为三线城市
    homeTown: "no", // 新增：是否在家乡工作，默认不在
    shuttle: "1.0", // 班车系数
    canteen: "1.0", // 食堂系数
    workYears: "0", // 新增：工作年限
    jobStability: "private", // 新增：工作稳定度/类型
  });

  // 添加滚动位置保存和恢复逻辑
  useEffect(() => {
    const handleBeforeStateChange = () => {
      // 保存当前滚动位置
      if (typeof window !== "undefined") {
        scrollPositionRef.current = window.scrollY;
      }
    };

    const handleAfterStateChange = () => {
      // 恢复滚动位置
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.scrollTo(0, scrollPositionRef.current);
        }, 0);
      }
    };

    // 添加到全局事件
    window.addEventListener("beforeStateChange", handleBeforeStateChange);
    window.addEventListener("afterStateChange", handleAfterStateChange);

    return () => {
      // 清理事件监听器
      window.removeEventListener("beforeStateChange", handleBeforeStateChange);
      window.removeEventListener("afterStateChange", handleAfterStateChange);
    };
  }, []);

  const calculateWorkingDays = useCallback(() => {
    const weeksPerYear = 52;
    const totalWorkDays = weeksPerYear * Number(formData.workDaysPerWeek); // 确保转换为数字
    const totalLeaves =
      Number(formData.annualLeave) +
      Number(formData.publicHolidays) +
      Number(formData.paidSickLeave) * 0.6; // 带薪病假按70%权重计算
    return Math.max(totalWorkDays - totalLeaves, 0);
  }, [
    formData.workDaysPerWeek,
    formData.annualLeave,
    formData.publicHolidays,
    formData.paidSickLeave,
  ]);

  const calculateDailySalary = useCallback(() => {
    if (!formData.annualSalary) return 0;
    const workingDays = calculateWorkingDays();

    // 应用PPP转换因子标准化薪资
    // 中国地区直接使用默认值4.19，其他地区使用用户输入的PPP
    const pppFactor =
      formData.country === "china" ? 4.19 : Number(formData.pppFactor) || 4.19;
    const standardizedSalary =
      Number(formData.annualSalary) * (4.19 / pppFactor);

    return standardizedSalary / workingDays; // 除 0 不管, Infinity(爽到爆炸)!
  }, [
    formData.annualSalary,
    formData.pppFactor,
    formData.country,
    calculateWorkingDays,
  ]);

  // 新增：获取显示用的日薪（转回原始货币）
  const getDisplaySalary = useCallback(() => {
    const dailySalaryInCNY = calculateDailySalary();
    if (formData.country === "china") {
      return dailySalaryInCNY.toFixed(2);
    } else {
      // 非中国地区，转回本地货币
      const pppFactor = Number(formData.pppFactor) || 4.19;
      return ((dailySalaryInCNY * pppFactor) / 4.19).toFixed(2);
    }
  }, [calculateDailySalary, formData.country, formData.pppFactor]);

  const handleInputChange = useCallback((name: string, value: string) => {
    // 触发自定义事件，保存滚动位置
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("beforeStateChange"));
    }

    // 直接设置值，不进行任何验证
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 在状态更新后，触发恢复滚动位置事件
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("afterStateChange"));
      }
    }, 0);
  }, []);

  const calculateValue = () => {
    if (!formData.annualSalary) return 0;

    const dailySalary = calculateDailySalary();
    const workHours = Number(formData.workHours);
    const commuteHours = Number(formData.commuteHours);
    const restTime = Number(formData.restTime);

    // 确保正确转换为数字，使用parseFloat可以更可靠地处理字符串转数字
    const workDaysPerWeek = parseFloat(formData.workDaysPerWeek) || 5;

    // 允许wfhDaysPerWeek为空字符串，计算时才处理为0
    const wfhInput = formData.wfhDaysPerWeek.trim();
    const wfhDaysPerWeek =
      wfhInput === ""
        ? 0
        : Math.min(parseFloat(wfhInput) || 0, workDaysPerWeek);

    // 确保有办公室工作天数时才计算比例，否则设为0
    const officeDaysRatio =
      workDaysPerWeek > 0
        ? (workDaysPerWeek - wfhDaysPerWeek) / workDaysPerWeek
        : 0;

    // 在计算结果中添加一个小的日志输出，以便调试
    console.log("WFH计算:", {
      workDaysPerWeek,
      wfhDaysPerWeek,
      officeDaysRatio,
      effectiveCommute: commuteHours * officeDaysRatio,
    });

    // 通勤时间按办公室工作比例计算，并考虑班车因素
    const shuttleFactor = Number(formData.shuttle);
    const effectiveCommuteHours =
      commuteHours * officeDaysRatio * shuttleFactor;

    // 工作环境因素，包含食堂和家乡因素
    const canteenFactor = Number(formData.canteen);
    // 在家乡工作有额外加成
    const homeTownFactor = formData.homeTown === "yes" ? 1.4 : 1.0;
    const environmentFactor =
      Number(formData.workEnvironment) *
      Number(formData.leadership) *
      Number(formData.teamwork) *
      Number(formData.cityFactor) *
      canteenFactor *
      homeTownFactor;

    // 根据工作年限计算经验薪资倍数
    const workYears = Number(formData.workYears);
    let experienceSalaryMultiplier = 1.0;

    // 基准薪资增长曲线（适用于私企）
    let baseSalaryMultiplier = 1.0;
    if (workYears === 0) baseSalaryMultiplier = 1.0; // 应届生基准值
    else if (workYears === 1)
      baseSalaryMultiplier = 1.5; // 1年：1.50-2.00，取中间值
    else if (workYears <= 3)
      baseSalaryMultiplier = 2.2; // 2-3年：2.20-2.50，取中间值
    else if (workYears <= 5)
      baseSalaryMultiplier = 2.7; // 4-5年：2.70-3.00，取中间值
    else if (workYears <= 8)
      baseSalaryMultiplier = 3.2; // 6-8年：3.20-3.50，取中间值
    else if (workYears <= 10)
      baseSalaryMultiplier = 3.6; // 9-10年：3.60-3.80，取中间值
    else baseSalaryMultiplier = 3.9; // 11-13年：3.90-4.20，取中间值

    // 工作单位类型对涨薪幅度的影响系数
    let salaryGrowthFactor = 1.0; // 私企基准
    if (formData.jobStability === "foreign") {
      salaryGrowthFactor = 0.8; // 外企涨薪幅度为私企的80%
    } else if (formData.jobStability === "state") {
      salaryGrowthFactor = 0.4; // 央/国企涨薪幅度为私企的30%（原先为50%）
    } else if (formData.jobStability === "government") {
      salaryGrowthFactor = 0.2; // 体制内涨薪幅度为私企的15%（原先为30%）
    }

    // 根据公式: 1 + (对应幅度-1) * 工作单位系数，计算最终薪资倍数
    experienceSalaryMultiplier =
      1 + (baseSalaryMultiplier - 1) * salaryGrowthFactor;

    // 薪资满意度应该受到经验薪资倍数的影响
    // 相同薪资，对于高经验者来说价值更低，对应的计算公式需要考虑经验倍数
    return (
      (dailySalary * environmentFactor) /
      (35 *
        (workHours + effectiveCommuteHours - 0.5 * restTime) *
        Number(formData.education) *
        experienceSalaryMultiplier)
    );
  };

  const value = calculateValue();

  const getValueAssessment = () => {
    if (!formData.annualSalary)
      return { text: "请输入年薪", color: "text-gray-500" };
    if (value < 0.6) return { text: "惨绝人寰", color: "text-pink-800" };
    if (value < 1.0) return { text: "略惨", color: "text-red-500" };
    if (value <= 1.8) return { text: "一般", color: "text-orange-500" };
    if (value <= 2.5) return { text: "还不错", color: "text-blue-500" };
    if (value <= 3.2) return { text: "很爽", color: "text-green-500" };
    if (value <= 4.0) return { text: "爽到爆炸", color: "text-purple-500" };
    return { text: "人生巅峰", color: "text-yellow-400" };
  };

  // 保存当前结果到本地存储
  const saveToHistory = () => {
    if (!formData.annualSalary) return; // 如果没有输入年薪，不保存

    try {
      const assessment = getValueAssessment();
      const newRecord: HistoryRecord = {
        id: Date.now().toString(), // 使用时间戳作为唯一ID
        timestamp: Date.now(),
        formData: { ...formData },
        value: value,
        assessment: assessment.text,
        assessmentColor: assessment.color,
        dailySalary: getDisplaySalary(),
        isYuan: formData.country === "china",
        workDaysPerYear: calculateWorkingDays(),
      };

      // 添加到历史记录
      const updatedHistory = [newRecord, ...historyRecords].slice(0, 10); // 只保留最近10条
      setHistoryRecords(updatedHistory);

      // 保存到本地存储
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "worthCalculatorHistory",
          JSON.stringify(updatedHistory)
        );
      }

      return newRecord;
    } catch (error) {
      console.error("Error saving to history:", error);
      return null;
    }
  };

  // 从历史记录中加载
  const loadFromHistory = (record: HistoryRecord) => {
    setFormData(record.formData);
    setShowHistory(false); // 关闭历史记录面板
  };

  // 删除历史记录项
  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止点击传播到父元素

    const updatedHistory = historyRecords.filter((item) => item.id !== id);
    setHistoryRecords(updatedHistory);

    // 更新本地存储
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "worthCalculatorHistory",
        JSON.stringify(updatedHistory)
      );
    }
  };

  // 预览历史记录
  const previewHistoryItem = (record: HistoryRecord, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止点击传播到父元素

    // 构建查询参数
    const formData = record.formData;
    const query = {
      value: record.value.toFixed(2),
      assessment: record.assessment,
      assessmentColor: record.assessmentColor,
      cityFactor: formData.cityFactor,
      workHours: formData.workHours,
      commuteHours: formData.commuteHours,
      restTime: formData.restTime,
      dailySalary: record.dailySalary,
      isYuan: record.isYuan ? "true" : "false",
      workDaysPerYear: record.workDaysPerYear.toString(),
      workDaysPerWeek: formData.workDaysPerWeek,
      wfhDaysPerWeek: formData.wfhDaysPerWeek,
      annualLeave: formData.annualLeave,
      paidSickLeave: formData.paidSickLeave,
      publicHolidays: formData.publicHolidays,
      workEnvironment: formData.workEnvironment,
      leadership: formData.leadership,
      teamwork: formData.teamwork,
      degreeType: formData.degreeType,
      schoolType: formData.schoolType,
      education: formData.education,
      homeTown: formData.homeTown,
      shuttle: formData.shuttle,
      canteen: formData.canteen,
      workYears: formData.workYears,
      jobStability: formData.jobStability,
      bachelorType: formData.bachelorType,
    };

    // 构建URL并导航
    const queryString = new URLSearchParams(query as any).toString();
    window.open(`/share?${queryString}`, "_blank");
  };

  const RadioGroup = ({
    label,
    name,
    value,
    onChange,
    options,
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    options: Array<{ label: string; value: string }>;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="grid grid-cols-4 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            className={`px-3 py-2 rounded-md text-sm transition-colors
              ${
                value === option.value
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium"
                  : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
              }`}
            onClick={(e) => {
              e.preventDefault(); // 阻止默认行为
              e.stopPropagation(); // 阻止事件冒泡
              onChange(name, option.value);
            }}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // 根据学位类型和学校类型计算教育系数
  const calculateEducationFactor = useCallback(() => {
    const degreeType = formData.degreeType;
    const schoolType = formData.schoolType;
    const bachelorType = formData.bachelorType;

    // 使用更简单的方式计算系数，避免复杂的索引类型问题
    let factor = 1.0; // 默认值

    // 专科及以下固定为0.8
    if (degreeType === "belowBachelor") {
      factor = 0.8;
    }
    // 本科学历
    else if (degreeType === "bachelor") {
      if (schoolType === "secondTier") factor = 0.9; // 二本三本
      else if (schoolType === "firstTier") factor = 1.0; // 双非/QS100/USnews50
      else if (schoolType === "elite") factor = 1.2; // 985/211/QS30/USnews20
    }
    // 硕士学历 - 考虑本科背景
    else if (degreeType === "masters") {
      // 先获取本科背景的基础系数
      let bachelorBaseCoefficient = 0;
      if (bachelorType === "secondTier")
        bachelorBaseCoefficient = 0.9; // 二本三本
      else if (bachelorType === "firstTier")
        bachelorBaseCoefficient = 1.0; // 双非/QS100/USnews50
      else if (bachelorType === "elite") bachelorBaseCoefficient = 1.2; // 985/211/QS30/USnews20

      // 再计算硕士学校的加成系数
      let mastersBonus = 0;
      if (schoolType === "secondTier") mastersBonus = 0.4; // 二本三本硕士
      else if (schoolType === "firstTier")
        mastersBonus = 0.5; // 双非/QS100/USnews50硕士
      else if (schoolType === "elite") mastersBonus = 0.6; // 985/211/QS30/USnews20硕士

      // 最终学历系数 = 本科基础 + 硕士加成
      factor = bachelorBaseCoefficient + mastersBonus;
    }
    // 博士学历
    else if (degreeType === "phd") {
      if (schoolType === "secondTier") factor = 1.6; // 二本三本博士
      else if (schoolType === "firstTier")
        factor = 1.8; // 双非/QS100/USnews50博士
      else if (schoolType === "elite") factor = 2.0; // 985/211/QS30/USnews20博士
    }

    // 更新education字段
    if (formData.education !== String(factor)) {
      // 这里不使用handleInputChange以避免触发滚动保存/恢复逻辑
      setFormData((prev) => ({
        ...prev,
        education: String(factor),
      }));
    }

    return factor;
  }, [
    formData.degreeType,
    formData.schoolType,
    formData.bachelorType,
    formData.education,
  ]);

  // 在组件初始化和学历选择变化时计算教育系数
  useEffect(() => {
    calculateEducationFactor();
  }, [formData.degreeType, formData.schoolType, calculateEducationFactor]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 text-gray-900 dark:text-white">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          这b班上得值不值·测算版
          <span className="ml-2 text-xs align-top text-gray-500 dark:text-gray-400">
            v4.4.1
          </span>
        </h1>

        {/* GitHub 链接和访问量计数 */}
        <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {/* 第一排: GitHub、Email、小红书 */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/zippland/worth-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Star on</span>
              <span>GitHub</span>
            </a>

            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
            <a
              href="mailto:zylanjian@outlook.com"
              className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>Email</span>
            </a>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
            <a
              href="https://www.xiaohongshu.com/user/profile/623e8b080000000010007721?xsec_token=YBdeHZTp_aVwi1Ijmras5CgTN9fhmJ9fwVRviTyiF_EAs%3D&xsec_source=app_share&xhsshare=CopyLink&appuid=623e8b080000000010007721&apptime=1742023486&share_id=48e7c11a2abe404494693a24218213ae&share_channel=copy_link"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M12 22c5.421 0 10-4.579 10-10S17.421 2 12 2 2 6.579 2 12s4.579 10 10 10zm0-18c4.337 0 8 3.663 8 8s-3.663 8-8 8-8-3.663-8-8 3.663-8 8-8z" />
                <path d="M17 8.4c0-1.697-1.979-2.709-3.489-1.684-1.628-1.028-3.639.045-3.511 1.68-1.579-.104-2.702 1.74-1.614 3.079-1.191.974-.401 3.062 1.394 3.062.966 1.269 2.902.941 3.614-.335 1.53.503 3.204-.812 2.604-2.802 1.468-.572.905-2.749-.998-3.001z" />
              </svg>
              <span>小红书</span>
            </a>
          </div>

          {/* 第二排: "持续更新中..."和欢迎建议文字 */}
          <div className="flex items-center gap-2">
            <span className="text-blue-500 dark:text-blue-400 font-medium">
              <span className="animate-pulse">✨</span>
              已自动跳转，新网址无需科学上网
              <span className="animate-pulse">✨</span>
            </span>
          </div>

          {/* 第三排: 访问量 */}
          <div className="flex items-center justify-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span id="busuanzi_container_site_pv" style={{ display: "none" }}>
                访问量:{" "}
                <span id="busuanzi_value_site_pv" className="hidden"></span>
                <span id="adjusted_pv">--</span>
              </span>
              <span className="mx-1">|</span>
              <span id="busuanzi_container_site_uv" style={{ display: "none" }}>
                访客数:{" "}
                <span id="busuanzi_value_site_uv" className="hidden"></span>
                <span id="adjusted_uv">--</span>
              </span>
            </span>
          </div>
          {/* 添加访问量调整脚本 */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // 由于seeyoufarm计数器服务停用导致原有200万访问量数据被清零
                // 手动添加历史访问量数据以保持统计连续性
                const historicalPV = 1997500; // 历史PV数据
                const historicalUV = 580000;  // 估算历史UV数据
                
                // 初始隐藏所有计数器
                document.getElementById('busuanzi_container_site_pv').style.display = 'none';
                document.getElementById('busuanzi_container_site_uv').style.display = 'none';
                
                // 检查并添加历史数据
                const checkAndUpdateStats = () => {
                  const pvElement = document.getElementById('busuanzi_value_site_pv');
                  const uvElement = document.getElementById('busuanzi_value_site_uv');
                  const adjustedPV = document.getElementById('adjusted_pv');
                  const adjustedUV = document.getElementById('adjusted_uv');
                  const pvContainer = document.getElementById('busuanzi_container_site_pv');
                  const uvContainer = document.getElementById('busuanzi_container_site_uv');
                  
                  if (pvElement && pvElement.textContent && pvElement.textContent !== '0') {
                    const currentPV = parseInt(pvElement.textContent, 10) || 0;
                    adjustedPV.textContent = (historicalPV + currentPV).toLocaleString();
                    pvContainer.style.display = 'inline';
                  }
                  
                  if (uvElement && uvElement.textContent && uvElement.textContent !== '0') {
                    const currentUV = parseInt(uvElement.textContent, 10) || 0;
                    adjustedUV.textContent = (historicalUV + currentUV).toLocaleString();
                    uvContainer.style.display = 'inline';
                  }
                  
                  // 如果尚未加载成功，继续尝试
                  if (adjustedPV.textContent === '--' || adjustedUV.textContent === '--') {
                    setTimeout(checkAndUpdateStats, 500);
                  }
                };
                
                // 页面加载后开始检查
                window.addEventListener('load', () => {
                  // 等待不蒜子加载完成
                  setTimeout(checkAndUpdateStats, 1000);
                });
              `,
            }}
          />

          {/* 第四排: 历史记录 */}
          <div className="flex items-center justify-center">
            {/* 添加历史记录按钮 */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="ml-4 inline-flex items-center text-sm text-blue-500 hover:text-blue-700 focus:outline-none"
              aria-label="查看历史记录"
            >
              <History className="w-4 h-4 mr-1" />
              <span className="text-xs">历史记录</span>
            </button>
          </div>

          {/* 历史记录弹出面板 */}
          {showHistory && (
            <div
              className="fixed inset-0 z-50 overflow-y-auto"
              aria-labelledby="历史记录"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                  aria-hidden="true"
                  onClick={() => setShowHistory(false)}
                ></div>

                <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        历史记录
                      </h3>
                      <button
                        type="button"
                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => setShowHistory(false)}
                      >
                        <X className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {historyRecords.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                          暂无历史记录
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {historyRecords.map((record) => (
                            <div
                              key={record.id}
                              onClick={() => loadFromHistory(record)}
                              className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors relative"
                            >
                              <div className="grid grid-cols-3 gap-2 mb-1">
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    性价比
                                  </span>
                                  <p
                                    className={`font-medium ${record.assessmentColor}`}
                                  >
                                    {record.value.toFixed(2)} (
                                    {record.assessment})
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    日薪
                                  </span>
                                  <p className="font-medium">
                                    {record.isYuan ? "¥" : "$"}
                                    {record.dailySalary}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    年收入
                                  </span>
                                  <p className="font-medium">
                                    {record.isYuan ? "¥" : "$"}
                                    {(
                                      Number(record.dailySalary) *
                                      record.workDaysPerYear
                                    ).toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(record.timestamp).toLocaleString()}
                              </div>
                              {/* 操作按钮区域 */}
                              <div className="absolute top-3 right-3 flex gap-2">
                                {/* 预览按钮 */}
                                <button
                                  className="text-blue-500 hover:text-blue-700 transition-colors"
                                  onClick={(e) => previewHistoryItem(record, e)}
                                  title="预览报告"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {/* 删除按钮 */}
                                <button
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  onClick={(e) =>
                                    deleteHistoryItem(record.id, e)
                                  }
                                  title="删除记录"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowHistory(false)}
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-black/30">
        <div className="p-6 space-y-8">
          {/* 薪资与工作时间 section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {formData.country === "china"
                  ? "年薪总包（元）"
                  : "年薪总包（当地货币）"}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="number"
                  value={formData.annualSalary}
                  onChange={(e) =>
                    handleInputChange("annualSalary", e.target.value)
                  }
                  placeholder={
                    formData.country === "china" ? "税前年薪" : "使用当地货币"
                  }
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center mt-2">
                <input
                  id="non-china"
                  type="checkbox"
                  checked={formData.country !== "china"}
                  onChange={(e) =>
                    handleInputChange(
                      "country",
                      e.target.checked ? "other" : "china"
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="non-china"
                  className="ml-2 text-xs text-gray-500 dark:text-gray-400"
                >
                  非中国地区薪资
                </label>
              </div>
            </div>

            {formData.country === "other" && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  购买力平价(PPP)转换因子
                  <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300 cursor-pointer group relative">
                    ?
                    <span className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full mb-1 left-1/2 transform -translate-x-1/2 w-48 sm:w-64">
                      PPP转换因子是将各国货币购买力标准化的指标。例如中国为4.19，表示1美元在美国的购买力等同于4.19元人民币在中国的购买力。
                    </span>
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pppFactor}
                  onChange={(e) =>
                    handleInputChange("pppFactor", e.target.value)
                  }
                  placeholder="请输入购买力平价转换因子"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  常见地区：中国大陆:4.19, 日本:102.59, 美国:1.00, 新加坡:0.84
                  <a
                    href="https://zh.wikipedia.org/wiki/%E8%B4%AD%E4%B9%B0%E5%8A%9B%E5%B9%B3%E4%BB%B7%E8%BD%AC%E6%8D%A2%E5%9B%A0%E5%AD%90"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-500 hover:underline"
                  >
                    查看更多
                  </a>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  每周工作天数/d
                </label>
                <input
                  type="number"
                  value={formData.workDaysPerWeek}
                  onChange={(e) =>
                    handleInputChange("workDaysPerWeek", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  周WFH天数/d
                  <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300 cursor-pointer group relative">
                    ?
                    <span className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full mb-1 left-1/2 transform -translate-x-1/2 w-48 sm:w-64">
                      WFH指居家办公(Work From
                      Home)，这里填写的是前面工作天数中有多少天是在家办公的。
                    </span>
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.workDaysPerWeek}
                  step="1"
                  value={formData.wfhDaysPerWeek}
                  onChange={(e) =>
                    handleInputChange("wfhDaysPerWeek", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  年假天数/d
                </label>
                <input
                  type="number"
                  value={formData.annualLeave}
                  onChange={(e) =>
                    handleInputChange("annualLeave", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  法定假日/d
                </label>
                <input
                  type="number"
                  value={formData.publicHolidays}
                  onChange={(e) =>
                    handleInputChange("publicHolidays", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  带薪病假/d
                </label>
                <input
                  type="number"
                  value={formData.paidSickLeave}
                  onChange={(e) =>
                    handleInputChange("paidSickLeave", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  工时/h
                  <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300 cursor-pointer group relative">
                    ?
                    <span className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full mb-1 left-1/2 transform -translate-x-1/2 w-48 sm:w-64">
                      工时：是指&quot;下班时间-上班时间&quot;的总时间，包括吃饭、午休、加班等（不含通勤）。
                    </span>
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.workHours}
                  onChange={(e) =>
                    handleInputChange("workHours", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  通勤/h
                  <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300 cursor-pointer group relative">
                    ?
                    <span className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full mb-1 left-1/2 transform -translate-x-1/2 w-48 sm:w-64">
                      通勤时长是指上下班往返的总时间，即家到公司和公司回家的时间总和。
                    </span>
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.commuteHours}
                  onChange={(e) =>
                    handleInputChange("commuteHours", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  午休&摸鱼/h
                </label>
                <input
                  type="number"
                  value={formData.restTime}
                  onChange={(e) =>
                    handleInputChange("restTime", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

          {/* 环境系数 */}
          <div className="space-y-4">
            {/* 添加工作类型RadioGroup */}
            <RadioGroup
              label="合同类型"
              name="jobStability"
              value={formData.jobStability}
              onChange={handleInputChange}
              options={[
                { label: "私企续签", value: "private" },
                { label: "外企续签", value: "foreign" },
                { label: "长期雇佣", value: "state" },
                { label: "永久编制", value: "government" },
              ]}
            />

            <RadioGroup
              label="工作环境"
              name="workEnvironment"
              value={formData.workEnvironment}
              onChange={handleInputChange}
              options={[
                { label: "偏僻的工厂/工地/户外", value: "0.8" },
                { label: "工厂/工地/户外", value: "0.9" },
                { label: "普通环境", value: "1.0" },
                { label: "CBD", value: "1.1" },
              ]}
            />

            <RadioGroup
              label="所在城市（按生活成本选择）"
              name="cityFactor"
              value={formData.cityFactor}
              onChange={handleInputChange}
              options={[
                { label: "一线城市", value: "0.70" },
                { label: "新一线", value: "0.80" },
                { label: "二线城市", value: "1.0" },
                { label: "三线城市", value: "1.10" },
                { label: "四线城市", value: "1.25" },
                { label: "县城", value: "1.40" },
                { label: "乡镇", value: "1.50" },
              ]}
            />

            <RadioGroup
              label="是否在家乡工作"
              name="homeTown"
              value={formData.homeTown}
              onChange={handleInputChange}
              options={[
                { label: "不在家乡", value: "no" },
                { label: "在家乡", value: "yes" },
              ]}
            />

            <RadioGroup
              label="领导/老板"
              name="leadership"
              value={formData.leadership}
              onChange={handleInputChange}
              options={[
                { label: "对我不爽", value: "0.7" },
                { label: "管理严格", value: "0.9" },
                { label: "中规中矩", value: "1.0" },
                { label: "善解人意", value: "1.1" },
                { label: "我是嫡系", value: "1.3" },
              ]}
            />

            <RadioGroup
              label="同事环境"
              name="teamwork"
              value={formData.teamwork}
              onChange={handleInputChange}
              options={[
                { label: "都是傻逼", value: "0.9" },
                { label: "萍水相逢", value: "1.0" },
                { label: "和和睦睦", value: "1.1" },
                { label: "私交甚好", value: "1.2" },
              ]}
            />

            <RadioGroup
              label="班车服务（加分项）"
              name="shuttle"
              value={formData.shuttle}
              onChange={handleInputChange}
              options={[
                { label: "无班车", value: "1.0" },
                { label: "班车不便", value: "0.9" },
                { label: "便利班车", value: "0.7" },
                { label: "班车直达", value: "0.5" },
              ]}
            />

            <RadioGroup
              label="食堂情况（加分项）"
              name="canteen"
              value={formData.canteen}
              onChange={handleInputChange}
              options={[
                { label: "无食堂/很难吃", value: "1.0" },
                { label: "食堂一般", value: "1.05" },
                { label: "食堂不错", value: "1.1" },
                { label: "食堂超赞", value: "1.15" },
              ]}
            />

            {/* 学历和工作年限 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  个人学历水平
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      学位类型
                    </label>
                    <select
                      value={formData.degreeType}
                      onChange={(e) =>
                        handleInputChange("degreeType", e.target.value)
                      }
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="belowBachelor">专科及以下</option>
                      <option value="bachelor">本科</option>
                      <option value="masters">硕士</option>
                      <option value="phd">博士</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      学校类型
                    </label>
                    <select
                      value={formData.schoolType}
                      onChange={(e) =>
                        handleInputChange("schoolType", e.target.value)
                      }
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      disabled={formData.degreeType === "belowBachelor"}
                    >
                      <option value="secondTier">二本三本</option>
                      {formData.degreeType === "bachelor" ? (
                        <>
                          <option value="firstTier">
                            双非/ QS200/ USnews80
                          </option>
                          <option value="elite">985211/ QS50/ USnews30</option>
                        </>
                      ) : (
                        <>
                          <option value="firstTier">
                            双非/ QS100/ USnews50
                          </option>
                          <option value="elite">985211/ QS30/ USnews20</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* 硕士显示本科背景选项 */}
                {formData.degreeType === "masters" && (
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      本科背景
                    </label>
                    <select
                      value={formData.bachelorType}
                      onChange={(e) =>
                        handleInputChange("bachelorType", e.target.value)
                      }
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="secondTier">二本三本</option>
                      <option value="firstTier">双非/ QS200/ USnews80</option>
                      <option value="elite">985211/ QS50/ USnews30</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 工作年限选择 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  工作年限
                </label>
                <select
                  value={formData.workYears}
                  onChange={(e) =>
                    handleInputChange("workYears", e.target.value)
                  }
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="0">应届生</option>
                  <option value="1">1-3年</option>
                  <option value="2">3-5年</option>
                  <option value="4">5-8年</option>
                  <option value="6">8-10年</option>
                  <option value="10">10-12年</option>
                  <option value="15">12年以上</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 结果卡片优化 */}
      <div
        ref={shareResultsRef}
        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-inner"
      >
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              年工作天数
            </div>
            <div className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
              {calculateWorkingDays()}天
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              平均日薪
            </div>
            <div className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
              {formData.country === "china" ? "¥" : "$"}
              {getDisplaySalary()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              工作性价比
            </div>
            <div
              className={`text-2xl font-semibold mt-1 ${
                getValueAssessment().color
              }`}
            >
              {value.toFixed(2)}
              <span className="text-base ml-2">
                ({getValueAssessment().text})
              </span>
            </div>
          </div>
        </div>

        {/* 修改分享按钮为链接到分享页面并保存到本地存储 */}
        <div className="mt-6 flex justify-end">
          <Link
            href={{
              pathname: "/share",
              query: {
                value: value.toFixed(2),
                assessment: getValueAssessment().text,
                assessmentColor: getValueAssessment().color,
                cityFactor: formData.cityFactor,
                workHours: formData.workHours,
                commuteHours: formData.commuteHours,
                restTime: formData.restTime,
                dailySalary: getDisplaySalary(),
                isYuan: formData.country === "china" ? "true" : "false",
                workDaysPerYear: calculateWorkingDays().toString(),
                workDaysPerWeek: formData.workDaysPerWeek,
                wfhDaysPerWeek: formData.wfhDaysPerWeek,
                annualLeave: formData.annualLeave,
                paidSickLeave: formData.paidSickLeave,
                publicHolidays: formData.publicHolidays,
                workEnvironment: formData.workEnvironment,
                leadership: formData.leadership,
                teamwork: formData.teamwork,
                degreeType: formData.degreeType,
                schoolType: formData.schoolType,
                education: formData.education,
                homeTown: formData.homeTown,
                shuttle: formData.shuttle,
                canteen: formData.canteen,
                workYears: formData.workYears,
                jobStability: formData.jobStability,
                bachelorType: formData.bachelorType,
              },
            }}
            onClick={() => saveToHistory()}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${
                formData.annualSalary
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
              }`}
          >
            <FileText className="w-4 h-4" />
            查看我的工作性价比报告
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;
