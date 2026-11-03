import React, { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import { Expense, ExpenseCategory } from '../types';
import {
  Wallet,
  Plus,
  Trash2,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  DollarSign,
  PieChart,
  Calendar,
  CheckCircle,
} from 'lucide-react';

interface BudgetViewProps {
  onOpenAddExpenseModal: () => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ onOpenAddExpenseModal }) => {
  const {
    activeTrip,
    activeTripExpenses,
    activeTripShoppingItems,
    deleteExpense,
    budgetSummary,
    updateTrip,
  } = useTrip();

  const [customRate, setCustomRate] = useState<number>(activeTrip?.exchangeRate || 9.15);
  const [isEditingRate, setIsEditingRate] = useState(false);

  const categoryLabels: Record<ExpenseCategory, string> = {
    FLIGHT: '항공권',
    HOTEL: '숙소',
    TRANSPORT: '교통비',
    FOOD: '식비',
    CAFE: '카페/디저트',
    SHOPPING: '쇼핑',
    TOUR: '관광/입장료',
    ETC: '기타',
  };

  const categoryColors: Record<ExpenseCategory, string> = {
    FLIGHT: '#3D5A80',
    HOTEL: '#6D597A',
    TRANSPORT: '#4A7C59',
    FOOD: '#C85A32',
    CAFE: '#B87A3E',
    SHOPPING: '#E07A5F',
    TOUR: '#81B29A',
    ETC: '#9C9487',
  };

  // Group by category
  const categoryTotals = useMemo(() => {
    const totals: Record<ExpenseCategory, number> = {
      FLIGHT: 0,
      HOTEL: 0,
      TRANSPORT: 0,
      FOOD: 0,
      CAFE: 0,
      SHOPPING: 0,
      TOUR: 0,
      ETC: 0,
    };
    activeTripExpenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amountKRW;
    });
    return totals;
  }, [activeTripExpenses]);

  // Group by payer
  const payerTotals = useMemo(() => {
    const map: Record<string, number> = {};
    activeTripExpenses.forEach((e) => {
      const p = e.payer || '나 (Me)';
      map[p] = (map[p] || 0) + e.amountKRW;
    });
    return map;
  }, [activeTripExpenses]);

  // Handle rate update
  const handleSaveRate = () => {
    if (activeTrip && customRate > 0) {
      updateTrip(activeTrip.id, { exchangeRate: customRate });
      setIsEditingRate(false);
    }
  };

  const unpurchasedWishlist = activeTripShoppingItems.filter((i) => !i.purchased);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C8275] uppercase tracking-wider">
            <span>Financial & Currency Management</span>
            <span>·</span>
            <span>{activeTrip?.city} 경비 아카이브</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mt-1">
            여행 예산 & 실제 지출 관리
          </h1>
          <p className="text-xs text-[#7A7265] mt-1 font-light max-w-2xl">
            전체 예산과 1인당 예산을 배분하고, 쇼핑 무드보드에 담긴 위시리스트의 예상 지출을 함께 반영하여 스마트하게 관리하세요.
          </p>
        </div>

        <button
          onClick={onOpenAddExpenseModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E1E1E] hover:bg-[#C85A32] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>지출 내역 등록</span>
        </button>
      </div>

      {/* Currency Exchange Rate Bar */}
      <div className="bg-[#FAF8F3] border border-[#E8E2D5] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-[#E0D8C8]">
            <DollarSign className="w-4 h-4 text-[#C85A32]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1E1E1E]">현지 통화 환율 설정</p>
            <p className="text-[11px] text-[#7A7265]">
              현재 기준: 1 {activeTrip?.currency || 'JPY'} = {activeTrip?.exchangeRate || 9.15} KRW
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditingRate ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={customRate}
                onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 text-xs bg-white border border-[#C85A32] rounded focus:outline-none"
              />
              <button
                onClick={handleSaveRate}
                className="px-3 py-1 bg-[#C85A32] text-white text-xs rounded hover:bg-[#b04b25] cursor-pointer"
              >
                저장
              </button>
              <button
                onClick={() => setIsEditingRate(false)}
                className="px-2 py-1 text-xs text-[#7A7265] hover:text-[#1E1E1E]"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingRate(true)}
              className="text-xs text-[#C85A32] font-medium hover:underline cursor-pointer"
            >
              환율 직접 수정
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl border border-[#E8E2D5] shadow-xs">
          <p className="text-[11px] font-mono tracking-wider uppercase text-[#8C8476]">전체 예산</p>
          <p className="text-xl sm:text-2xl font-display font-bold text-[#1E1E1E] mt-1 tabular-nums">
            {budgetSummary.totalBudget.toLocaleString()}
            <span className="text-xs font-normal text-[#8C8476] ml-1">원</span>
          </p>
          <p className="text-[11px] text-[#7A7265] mt-1">
            1인당: {budgetSummary.perPersonBudget.toLocaleString()}원
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E2D5] shadow-xs">
          <p className="text-[11px] font-mono tracking-wider uppercase text-[#8C8476]">현재 실제 지출</p>
          <p className="text-xl sm:text-2xl font-display font-bold text-[#1E1E1E] mt-1 tabular-nums">
            {budgetSummary.actualSpent.toLocaleString()}
            <span className="text-xs font-normal text-[#8C8476] ml-1">원</span>
          </p>
          <p className="text-[11px] text-[#7A7265] mt-1">
            1인당: {budgetSummary.perPersonSpent.toLocaleString()}원
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E2D5] shadow-xs">
          <p className="text-[11px] font-mono tracking-wider uppercase text-[#8C8476]">쇼핑 위시 예정액</p>
          <p className="text-xl sm:text-2xl font-display font-bold text-[#C85A32] mt-1 tabular-nums">
            +{budgetSummary.pendingWishlistAmount.toLocaleString()}
            <span className="text-xs font-normal text-[#8C8476] ml-1">원</span>
          </p>
          <p className="text-[11px] text-[#7A7265] mt-1">미구매 {unpurchasedWishlist.length}건 합산</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E2D5] shadow-xs">
          <p className="text-[11px] font-mono tracking-wider uppercase text-[#8C8476]">예상 총지출</p>
          <p
            className={`text-xl sm:text-2xl font-display font-bold mt-1 tabular-nums ${
              budgetSummary.projectedTotalSpent > budgetSummary.totalBudget
                ? 'text-[#C85A32]'
                : 'text-emerald-700'
            }`}
          >
            {budgetSummary.projectedTotalSpent.toLocaleString()}
            <span className="text-xs font-normal text-[#8C8476] ml-1">원</span>
          </p>
          <p className="text-[11px] text-[#7A7265] mt-1">
            {budgetSummary.remainingBudget >= 0
              ? `남은 예산: ${budgetSummary.remainingBudget.toLocaleString()}원`
              : `예산 초과: ${Math.abs(budgetSummary.remainingBudget).toLocaleString()}원`}
          </p>
        </div>
      </div>

      {/* Over Budget Notice */}
      {budgetSummary.isOverBudget && (
        <div className="p-4 bg-[#FFF5F2] border border-[#F8D4C8] rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#C85A32] shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-[#A53818]">설정된 총 예산을 초과했습니다!</p>
            <p className="text-[#BF4A26] mt-0.5">
              현재 실제 지출이 예산보다{' '}
              {Math.abs(budgetSummary.remainingBudget).toLocaleString()}원 많습니다. 지출 항목을 검토해보세요.
            </p>
          </div>
        </div>
      )}

      {/* Breakdown: Categories & Payers Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-[#E8E2D5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
            <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">카테고리별 지출 비중</h3>
            <span className="text-xs font-mono text-[#8C8476]">
              실지출 {activeTripExpenses.length}건
            </span>
          </div>

          <div className="space-y-3">
            {(Object.keys(categoryTotals) as ExpenseCategory[]).map((cat) => {
              const amount = categoryTotals[cat];
              if (amount === 0) return null;
              const percent = Math.round((amount / Math.max(1, budgetSummary.actualSpent)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#1E1E1E] flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: categoryColors[cat] }}
                      />
                      {categoryLabels[cat]}
                    </span>
                    <span className="text-[#6B6457] tabular-nums">
                      {amount.toLocaleString()}원 ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EFECE4] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: categoryColors[cat],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Companions & Payers Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-[#E8E2D5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
            <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">결제자별 지출 분담</h3>
            <span className="text-xs font-mono text-[#8C8476]">
              동행 {activeTrip?.companions?.length || 1}명
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(payerTotals).map(([payer, amount]) => {
              const percent = Math.round((amount / Math.max(1, budgetSummary.actualSpent)) * 100);
              return (
                <div key={payer} className="p-3 bg-[#FAF8F3] rounded-lg border border-[#EDE7DC]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1E1E1E]">{payer}</span>
                    <span className="font-mono text-[#C85A32] font-semibold tabular-nums">
                      {amount.toLocaleString()}원 ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EFECE4] rounded-full h-1.5 overflow-hidden mt-2">
                    <div
                      className="bg-[#1E1E1E] h-full rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expense Records List */}
      <div className="bg-white rounded-xl p-6 border border-[#E8E2D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">지출 상세 내역</h3>
            <p className="text-xs text-[#7A7265] mt-0.5">
              원화 및 현지 통화({activeTrip?.currency}) 기록
            </p>
          </div>
          <button
            onClick={onOpenAddExpenseModal}
            className="flex items-center gap-1 text-xs text-[#C85A32] font-medium hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>지출 추가</span>
          </button>
        </div>

        {activeTripExpenses.length === 0 ? (
          <p className="text-xs text-[#8C8476] py-8 text-center">아직 등록된 지출 내역이 없습니다.</p>
        ) : (
          <div className="divide-y divide-[#F2EEE6]">
            {activeTripExpenses.map((exp) => (
              <div
                key={exp.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F3] px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-[#8C8476]">
                    <span className="font-mono font-medium">{exp.date}</span>
                    <span>·</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] text-white"
                      style={{ backgroundColor: categoryColors[exp.category] }}
                    >
                      {categoryLabels[exp.category]}
                    </span>
                    <span>·</span>
                    <span>{exp.payer}</span>
                    <span>·</span>
                    <span className="font-mono">{exp.paymentMethod}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-[#1E1E1E] mt-1 flex items-center gap-2">
                    <span>{exp.title}</span>
                    {exp.isShoppingItem && (
                      <span className="text-[10px] font-mono text-[#C85A32] bg-[#FDF2ED] px-1.5 py-0.5 rounded">
                        MOODBOARD LINK
                      </span>
                    )}
                  </h4>

                  {exp.notes && (
                    <p className="text-xs text-[#6B6457] mt-0.5">{exp.notes}</p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1E1E1E] tabular-nums">
                      {exp.amountKRW.toLocaleString()}원
                    </p>
                    {exp.currency !== 'KRW' && (
                      <p className="text-[11px] font-mono text-[#8C8476]">
                        {exp.currency} {exp.amount.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`'${exp.title}' 지출 항목을 삭제하시겠습니까?`)) {
                        deleteExpense(exp.id);
                      }
                    }}
                    className="p-1.5 text-[#9C9487] hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
