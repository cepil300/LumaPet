import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { getTranslations } from '../i18n/translations';
import {
  AppLanguage,
  BATH_ITEMS,
  BathItemId,
  CAT_ACCESSORIES,
  CAT_BATHTUBS,
  CAT_BEDS,
  CAT_TOYS,
  CatAccessoryId,
  CatBathtubId,
  CatBedId,
  CatHudSnapshot,
  CatToyId,
  ConsumableInventory,
  FOOD_ITEMS,
  FoodItemId,
  ROOM_BACKGROUNDS,
  RoomBackgroundId,
} from '../types/game';
import {
  AccessoryIcon,
  BathItemIcon,
  FoodItemIcon,
  OrnateCornerFlourishes,
  PixelStarBadgeIcon,
  RoomBgIcon,
  ShopBathTabIcon,
  ShopBedTabIcon,
  ShopHouseTabIcon,
  ShopShirtTabIcon,
  ToyIcon,
} from './CuteGameIcons';
import { CatEarsHeaderPlaque } from './WoodPanelChrome';

interface ShopDrawerProps {
  open: boolean;
  hud: CatHudSnapshot;
  language?: AppLanguage;
  onClose: () => void;
  onFeedItem: (foodId: FoodItemId) => void;
  onBuyFoodItem: (foodId: Exclude<FoodItemId, 'snack'>, useImmediately?: boolean) => void;
  onUseBathItem: (bathId: BathItemId) => void;
  onBuyBathItem: (bathId: Exclude<BathItemId, 'basic_soap'>, useImmediately?: boolean) => void;
  onSelectBackground: (bgId: RoomBackgroundId) => void;
  onSelectBed: (bedId: CatBedId) => void;
  onSelectBathtub: (tubId: CatBathtubId) => void;
  onSelectToy: (toyId: CatToyId) => void;
  onSelectAccessory: (accId: CatAccessoryId) => void;
  onUnequipAllAccessories: () => void;
}

type ShopTab = 'makanan' | 'mandi' | 'mainan' | 'kostum' | 'rumah' | 'kasur';
type CostumeFilter = 'all' | 'hat' | 'glasses';
type BathShopFilter = 'all' | 'tub' | 'consumable';

function renderTabIcon(tab: ShopTab) {
  switch (tab) {
    case 'makanan':
      return (
        <img
          src="/assets/ui/icon_feed.png"
          alt=""
          className="w-5 h-5 sm:w-6 sm:h-6 short:w-4 short:h-4 object-contain shrink-0"
          draggable={false}
        />
      );
    case 'mandi':
      return <ShopBathTabIcon className="w-5 h-5 sm:w-6 sm:h-6 short:w-4 short:h-4 shrink-0" />;
    case 'mainan':
      return (
        <img
          src="/assets/ui/icon_ball.png"
          alt=""
          className="w-5 h-5 sm:w-6 sm:h-6 short:w-4 short:h-4 object-contain shrink-0"
          draggable={false}
        />
      );
    case 'kostum':
      return <ShopShirtTabIcon className="w-5 h-5 sm:w-6 sm:h-6 short:w-4 short:h-4 shrink-0" />;
    case 'rumah':
      return <ShopHouseTabIcon className="w-5 h-5 sm:w-6 sm:h-6 short:w-4 short:h-4 shrink-0" />;
    case 'kasur':
      return <ShopBedTabIcon className="w-5 h-5 sm:w-6 sm:h-6 short:w-4 short:h-4 shrink-0" />;
  }
}

function formatCooldownMMSS(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export const ShopDrawer: React.FC<ShopDrawerProps> = ({
  open,
  hud,
  language = 'id',
  onClose,
  onFeedItem,
  onBuyFoodItem,
  onUseBathItem,
  onBuyBathItem,
  onSelectBackground,
  onSelectBed,
  onSelectBathtub,
  onSelectToy,
  onSelectAccessory,
  onUnequipAllAccessories,
}) => {
  const [activeTab, setActiveTab] = useState<ShopTab>('makanan');
  const [costumeFilter, setCostumeFilter] = useState<CostumeFilter>('all');
  const [bathFilter, setBathFilter] = useState<BathShopFilter>('all');
  const t = getTranslations(language);

  if (!open) return null;

  const isSleeping = hud.behavior === 'SLEEPING' || hud.sleepMode !== 'none';

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex items-center justify-end p-3 sm:p-5 short:p-2.5 safe-inset-hud">
      <div className="pointer-events-auto relative w-full max-w-[640px] short:max-w-[550px] mt-5 short:mt-3">
        {/* Top Overlapping Header Plaque (with Cat Ears) */}
        <div className="absolute -top-6 sm:-top-7 short:-top-4 left-4 sm:left-6 z-30">
          <CatEarsHeaderPlaque title={t.shop.title} />
        </div>

        {/* Top-Right Overlapping Red Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-4 -right-2 sm:-top-4 sm:-right-3 short:-top-3 short:-right-2 z-30 w-11 h-11 short:w-9 short:h-9 rounded-full bg-gradient-to-b from-[#EF5350] to-[#C62828] border-[3px] short:border-2 border-[#5E2F12] ring-2 ring-[#FFF8E8] shadow-[0_3px_0_#5E2F12] flex items-center justify-center text-white hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer"
          aria-label={t.shop.closeAria}
          title={t.shop.closeAria}
        >
          <X className="w-6 h-6 short:w-4 short:h-4 stroke-[3]" />
        </button>

        {/* Outer Wooden Plank Frame */}
        <div className="wood-modal-frame rounded-3xl short:rounded-2xl p-2.5 sm:p-3 short:p-2 border-[3px] short:border-2 border-[#5E2F12] shadow-[inset_0_2px_0_rgba(255,235,205,0.45),0_8px_0_rgba(58,28,10,0.45)]">
          {/* Inner Warm Cream Board */}
          <div className="relative rounded-2xl short:rounded-xl bg-[#FFF4DC] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFDF8] flex flex-col max-h-[82dvh] short:max-h-[88dvh] pt-6 sm:pt-7 short:pt-4 px-3.5 pb-3.5 short:px-2.5 short:pb-2">
            {/* Coin Balance Pill aligned right under top rim */}
            <div className="flex items-center justify-end mb-2.5 short:mb-1.5 pr-6 sm:pr-7 short:pr-5">
              <div className="inline-flex items-center gap-1.5 short:gap-1 px-3.5 py-1 short:px-2.5 short:py-0.5 rounded-full bg-[#FFFDF8] border-2 border-[#7A4928] shadow-[inset_0_1px_0_#FFFFFF,0_2px_0_#D8B78C]">
                <img
                  src="/assets/ui/icon_coin.png"
                  alt=""
                  className="w-5 h-5 short:w-3.5 short:h-3.5 object-contain"
                  draggable={false}
                />
                <span className="font-display font-extrabold text-sm short:text-xs text-[#5A2D12] tabular-nums">
                  {hud.coins} {t.common.coins}
                </span>
              </div>
            </div>

            {/* 6 Icon Category Tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 short:gap-1 mb-2.5 short:mb-1.5">
              {(
                [
                  { id: 'makanan', label: t.shop.tabs.makanan },
                  { id: 'mandi', label: t.shop.tabs.mandi },
                  { id: 'mainan', label: t.shop.tabs.mainan },
                  { id: 'kostum', label: t.shop.tabs.kostum },
                  { id: 'rumah', label: t.shop.tabs.rumah },
                  { id: 'kasur', label: t.shop.tabs.kasur },
                ] as Array<{ id: ShopTab; label: string }>
              ).map((tab) => {
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-1.5 short:py-1 px-1.5 short:px-1 rounded-xl short:rounded-lg border-2 flex items-center justify-center gap-1 short:gap-0.5 text-[11px] sm:text-xs short:text-[10px] font-extrabold transition-all whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] short:min-h-[32px] ${
                      selected
                        ? 'bg-gradient-to-b from-[#FDE29B] to-[#F5B959] border-[#7A4928] text-[#5A2D12] shadow-[inset_0_1px_0_#FFFBEB,0_2.5px_0_#9A5A2B]'
                        : 'bg-[#FFF9EB] border-[#B68D5E]/65 text-[#7A4928] hover:bg-[#FCECC8] hover:text-[#5A2D12]'
                    }`}
                  >
                    {renderTabIcon(tab.id)}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Inner Cream Showcase Container */}
            <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl short:rounded-xl bg-[#FFFBF2] border-2 border-[#B68D5E] shadow-[inset_0_2px_4px_rgba(122,73,40,0.08)] p-3 short:p-2">
              {activeTab === 'makanan' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 short:gap-2">
                  {FOOD_ITEMS.map((item) => {
                    const foodLoc = t.catalog.foodItems[item.id];
                    const stock = item.isFree
                      ? 0
                      : hud.inventory[item.id as keyof ConsumableInventory] ?? 0;
                    const canAfford = hud.coins >= item.price;
                    const statLines = foodLoc.description.split(' · ');
                    const isHungerFull = hud.hunger >= 100;
                    const snackCd = item.isFree ? hud.cooldownsSec.snack : 0;
                    const freeFoodBlocked = snackCd > 0;
                    const freeFoodLabel =
                      snackCd > 0 ? `CD ${formatCooldownMMSS(snackCd)}` : t.common.giveFree;

                    return (
                      <div
                        key={item.id}
                        className="relative rounded-xl short:rounded-lg bg-[#FFFDF7] border-2 border-[#C79C69] shadow-[0_3px_0_#E5D1AD] p-3 short:p-2 flex flex-col items-center text-center justify-between"
                      >
                        <OrnateCornerFlourishes className="short:w-3 short:h-3" />

                        <div className="w-full aspect-[4/3] short:aspect-[16/10] rounded-lg bg-[#EFE4CE] border border-[#D8C29D] flex items-center justify-center p-2 short:p-1 mb-2 short:mb-1">
                          <FoodItemIcon
                            variant={item.id}
                            className="w-16 h-16 short:w-11 short:h-11"
                          />
                        </div>

                        <p className="font-display font-extrabold text-sm short:text-xs text-[#5A2D12] leading-tight mb-1.5">
                          {foodLoc.shortName}
                        </p>

                        <div className="w-full space-y-0.5 mb-2.5 short:mb-1.5">
                          {statLines.map((line, idx) => (
                            <p
                              key={line}
                              className={`text-xs short:text-[10px] font-bold text-[#2D6A4F] leading-tight ${
                                idx > 0 ? 'pt-0.5 border-t border-[#E5D1AD]/80' : ''
                              }`}
                            >
                              {line}
                            </p>
                          ))}
                        </div>

                        {item.isFree ? (
                          <button
                            type="button"
                            disabled={freeFoodBlocked}
                            onClick={() => {
                              if (freeFoodBlocked) return;
                              onFeedItem('snack');
                            }}
                            className={`w-full py-1.5 short:py-1 px-3 min-h-[40px] short:min-h-[34px] rounded-full border-2 font-display font-black text-xs sm:text-sm short:text-xs tabular-nums transition-all whitespace-nowrap ${
                              freeFoodBlocked
                                ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                                : 'bg-gradient-to-b from-[#4B9B59] to-[#2E6F3E] border-[#1E4627] text-white shadow-[inset_0_2px_0_#86EFAC,0_3px_0_#1E4627] hover:brightness-105 active:translate-y-0.5 cursor-pointer'
                            }`}
                          >
                            {freeFoodLabel}
                          </button>
                        ) : (
                          <div className="w-full space-y-1.5">
                            {stock > 0 && (
                              <button
                                type="button"
                                disabled={isHungerFull}
                                onClick={() => {
                                  if (isHungerFull) return;
                                  onFeedItem(item.id);
                                }}
                                className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-extrabold text-xs short:text-[11px] tabular-nums transition-all whitespace-nowrap ${
                                  isHungerFull
                                    ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                                    : 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722] hover:bg-[#D4E6DA] cursor-pointer'
                                }`}
                              >
                                {isHungerFull
                                  ? t.hud.hungerFull(stock)
                                  : t.hud.useWithStock(stock)}
                              </button>
                            )}
                              <button
                                type="button"
                                disabled={!canAfford}
                                onClick={() =>
                                  onBuyFoodItem(item.id as Exclude<FoodItemId, 'snack'>, false)
                                }
                                className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-black text-xs sm:text-sm short:text-xs tabular-nums transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${
                                  canAfford
                                    ? 'bg-gradient-to-b from-[#FBBF49] to-[#E5861F] border-[#6E3B1B] text-[#5A2D12] shadow-[inset_0_2px_0_#FDE68A,0_3px_0_#6E3B1B] hover:brightness-105 active:translate-y-0.5 cursor-pointer'
                                    : 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                                }`}
                              >
                                <img
                                  src="/assets/ui/icon_coin.png"
                                  alt=""
                                  className="w-4 h-4 short:w-3.5 short:h-3.5 object-contain"
                                  draggable={false}
                                />
                                <span>
                                  {t.common.buy} · {item.price}
                                </span>
                              </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'mandi' && (
                <div className="space-y-3 short:space-y-2">
                  {isSleeping && (
                    <p className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#60A5FA] text-xs short:text-[10px] font-extrabold text-[#1E3A8A] text-center">
                      {t.shop.sleepingNotice}
                    </p>
                  )}
                  {hud.isBathing && (
                    <p className="px-3 py-1.5 rounded-lg bg-[#E0F2FE] border border-[#38BDF8] text-xs short:text-[10px] font-extrabold text-[#0369A1] text-center">
                      {t.shop.bathingNotice}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1 flex-wrap">
                      {(
                        [
                          { id: 'all', label: t.shop.bathFilters.all },
                          { id: 'tub', label: t.shop.bathFilters.tub },
                          { id: 'consumable', label: t.shop.bathFilters.consumable },
                        ] as Array<{ id: BathShopFilter; label: string }>
                      ).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setBathFilter(f.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] short:text-[10px] font-extrabold border transition-colors cursor-pointer ${
                            bathFilter === f.id
                              ? 'bg-[#6E3B1B] border-[#6E3B1B] text-[#FFFDF8]'
                              : 'bg-[#FFFDF8] border-[#B68D5E] text-[#7A4928] hover:bg-[#FCE8C3]'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(bathFilter === 'all' || bathFilter === 'tub') && (
                    <div className="space-y-2 short:space-y-1.5">
                      <p className="text-xs short:text-[10px] font-bold text-[#7A4928] text-center">
                        {t.shop.bathTip}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 short:grid-cols-3 gap-3 short:gap-2">
                        {CAT_BATHTUBS.map((tub) => {
                          const tubLoc = t.catalog.bathtubs[tub.id];
                          const unlocked = hud.unlockedBathtubs.includes(tub.id);
                          const isEquipped = hud.activeBathtub === tub.id;
                          const canAfford = hud.coins >= tub.price;

                          return (
                            <div
                              key={tub.id}
                              className={`relative rounded-xl short:rounded-lg border-2 shadow-[0_3px_0_#E5D1AD] p-3 short:p-2 flex flex-col items-center text-center justify-between ${
                                isEquipped
                                  ? 'bg-[#F2FBF5] border-[#2D6A4F]/70'
                                  : 'bg-[#FFFDF7] border-[#C79C69]'
                              }`}
                            >
                              <OrnateCornerFlourishes className="short:w-3 short:h-3" />
                              <PixelStarBadgeIcon className="w-5 h-5 short:w-4 short:h-4 mb-1 short:mb-0.5" />

                              <div className="w-full aspect-[4/3] short:aspect-[16/10] rounded-lg bg-[#E6F4FE] border border-[#93C5FD] flex items-center justify-center p-2 short:p-1 mb-2 short:mb-1">
                                <img
                                  src={tub.imgSrc}
                                  alt={tubLoc.name}
                                  className="w-full h-full object-contain"
                                  draggable={false}
                                />
                              </div>

                              <p className="font-display font-extrabold text-sm short:text-xs text-[#5A2D12] leading-tight mb-1">
                                {tubLoc.name}
                              </p>
                              <p className="text-[10px] short:text-[9px] font-medium text-[#6B5749] leading-snug mb-2 short:mb-1.5 line-clamp-2">
                                {tubLoc.description}
                              </p>

                              {unlocked ? (
                                <button
                                  type="button"
                                  disabled={isEquipped}
                                  onClick={() => onSelectBathtub(tub.id)}
                                  className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-extrabold text-xs short:text-[11px] transition-all inline-flex items-center justify-center gap-1 ${
                                    isEquipped
                                      ? 'bg-gradient-to-b from-[#4B9B59] to-[#2E6F3E] border-[#1E4627] text-white cursor-default'
                                      : 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722] hover:bg-[#D4E6DA] cursor-pointer'
                                  }`}
                                >
                                  {isEquipped ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>{t.common.usedEquipped}</span>
                                    </>
                                  ) : (
                                    <span>{t.common.use}</span>
                                  )}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!canAfford}
                                  onClick={() => onSelectBathtub(tub.id)}
                                  className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-black text-sm short:text-xs tabular-nums transition-all inline-flex items-center justify-center gap-1.5 ${
                                    canAfford
                                      ? 'bg-gradient-to-b from-[#FBBF49] to-[#E5861F] border-[#6E3B1B] text-[#5A2D12] shadow-[inset_0_2px_0_#FDE68A,0_3px_0_#6E3B1B] hover:brightness-105 active:translate-y-0.5 cursor-pointer'
                                      : 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                                  }`}
                                >
                                  <img
                                    src="/assets/ui/icon_coin.png"
                                    alt=""
                                    className="w-4 h-4 short:w-3.5 short:h-3.5 object-contain"
                                    draggable={false}
                                  />
                                  <span>{tub.price}</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(bathFilter === 'all' || bathFilter === 'consumable') && (
                    <div className="space-y-2 short:space-y-1.5">
                      {bathFilter === 'all' && (
                        <p className="font-display font-extrabold text-xs short:text-[11px] text-[#5A2D12] pt-1 border-t-2 border-[#E5D1AD]/70">
                          {t.shop.bathConsumablesHeading}
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 short:gap-2">
                        {BATH_ITEMS.map((item) => {
                          const bathLoc = t.catalog.bathItems[item.id];
                          const stock = item.isFree
                            ? 0
                            : hud.inventory[item.id as keyof ConsumableInventory] ?? 0;
                          const canAfford = hud.coins >= item.price;
                          const statLines = bathLoc.description.split(' · ');
                          const isCleanFull = hud.cleanliness >= 100;
                          const soapCd = item.isFree ? hud.cooldownsSec.basicSoap : 0;
                          const freeBathBlocked =
                            isSleeping || hud.isBathing || isCleanFull || soapCd > 0;
                          const freeBathLabel = hud.isBathing
                            ? t.shop.bathingBtn
                            : isSleeping
                            ? t.shop.sleepingBtn
                            : isCleanFull
                            ? t.hud.cleanFull()
                            : soapCd > 0
                            ? `CD ${formatCooldownMMSS(soapCd)}`
                            : t.common.useFree;
                          const useBathBlocked = isSleeping || hud.isBathing || isCleanFull;

                          return (
                            <div
                              key={item.id}
                              className="relative rounded-xl short:rounded-lg bg-[#FFFDF7] border-2 border-[#C79C69] shadow-[0_3px_0_#E5D1AD] p-3 short:p-2 flex flex-col items-center text-center justify-between"
                            >
                              <OrnateCornerFlourishes className="short:w-3 short:h-3" />

                              <div className="w-full aspect-[4/3] short:aspect-[16/10] rounded-lg bg-[#E6F4FE] border border-[#93C5FD] flex items-center justify-center p-2 short:p-1 mb-2 short:mb-1">
                                <BathItemIcon
                                  variant={item.id}
                                  className="w-16 h-16 short:w-11 short:h-11"
                                />
                              </div>

                              <p className="font-display font-extrabold text-sm short:text-xs text-[#5A2D12] leading-tight mb-1.5">
                                {bathLoc.shortName}
                              </p>

                              <div className="w-full space-y-0.5 mb-2.5 short:mb-1.5">
                                {statLines.map((line, idx) => (
                                  <p
                                    key={line}
                                    className={`text-xs short:text-[10px] font-bold text-[#0369A1] leading-tight ${
                                      idx > 0 ? 'pt-0.5 border-t border-[#E5D1AD]/80' : ''
                                    }`}
                                  >
                                    {line}
                                  </p>
                                ))}
                              </div>

                              {item.isFree ? (
                                <button
                                  type="button"
                                  disabled={freeBathBlocked}
                                  onClick={() => {
                                    if (freeBathBlocked) return;
                                    onUseBathItem('basic_soap');
                                  }}
                                  className={`w-full py-1.5 short:py-1 px-3 min-h-[40px] short:min-h-[34px] rounded-full border-2 font-display font-black text-xs sm:text-sm short:text-xs tabular-nums transition-all whitespace-nowrap ${
                                    freeBathBlocked
                                      ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                                      : 'bg-gradient-to-b from-[#4B9B59] to-[#2E6F3E] border-[#1E4627] text-white shadow-[inset_0_2px_0_#86EFAC,0_3px_0_#1E4627] hover:brightness-105 active:translate-y-0.5 cursor-pointer'
                                  }`}
                                >
                                  {freeBathLabel}
                                </button>
                              ) : (
                                <div className="w-full space-y-1.5">
                                  {stock > 0 && (
                                    <button
                                      type="button"
                                      disabled={useBathBlocked}
                                      onClick={() => {
                                        if (useBathBlocked) return;
                                        onUseBathItem(item.id);
                                      }}
                                      className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-extrabold text-xs short:text-[11px] tabular-nums transition-all whitespace-nowrap ${
                                        useBathBlocked
                                          ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                                          : 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722] hover:bg-[#D4E6DA] cursor-pointer'
                                      }`}
                                    >
                                      {hud.isBathing
                                        ? t.shop.bathingBtn
                                        : isSleeping
                                        ? t.shop.sleepingBtn
                                        : isCleanFull
                                        ? t.hud.cleanFull(stock)
                                        : t.hud.useWithStock(stock)}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    disabled={!canAfford}
                                    onClick={() =>
                                      onBuyBathItem(item.id as Exclude<BathItemId, 'basic_soap'>, false)
                                    }
                                    className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-black text-xs sm:text-sm short:text-xs tabular-nums transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${
                                      canAfford
                                        ? 'bg-gradient-to-b from-[#FBBF49] to-[#E5861F] border-[#6E3B1B] text-[#5A2D12] shadow-[inset_0_2px_0_#FDE68A,0_3px_0_#6E3B1B] hover:brightness-105 active:translate-y-0.5 cursor-pointer'
                                        : 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                                    }`}
                                  >
                                    <img
                                      src="/assets/ui/icon_coin.png"
                                      alt=""
                                      className="w-4 h-4 short:w-3.5 short:h-3.5 object-contain"
                                      draggable={false}
                                    />
                                    <span>
                                      {t.common.buy} · {item.price}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'mainan' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 short:grid-cols-3 gap-3 short:gap-2">
                  {CAT_TOYS.map((toy) => {
                    const toyLoc = t.catalog.toys[toy.id];
                    const unlocked = hud.unlockedToys.includes(toy.id);
                    const isEquipped = hud.activeToy === toy.id;
                    const canAfford = hud.coins >= toy.price;
                    const bonusLines = toyLoc.bonusText.split(' · ');

                    return (
                      <div
                        key={toy.id}
                        className={`relative rounded-xl short:rounded-lg border-2 shadow-[0_3px_0_#E5D1AD] p-3 short:p-2 flex flex-col items-center text-center justify-between ${
                          isEquipped
                            ? 'bg-[#F2FBF5] border-[#2D6A4F]/70'
                            : 'bg-[#FFFDF7] border-[#C79C69]'
                        }`}
                      >
                        <OrnateCornerFlourishes className="short:w-3 short:h-3" />

                        <div className="w-full aspect-[4/3] short:aspect-[16/10] rounded-lg bg-[#EFE4CE] border border-[#D8C29D] flex items-center justify-center p-2 short:p-1 mb-2 short:mb-1">
                          <ToyIcon variant={toy.id} className="w-14 h-14 short:w-10 short:h-10" />
                        </div>

                        <p className="font-display font-extrabold text-sm short:text-xs text-[#5A2D12] leading-tight mb-1.5">
                          {toyLoc.name}
                        </p>

                        <div className="w-full space-y-0.5 mb-2.5 short:mb-1.5">
                          {bonusLines.map((line, idx) => (
                            <p
                              key={line}
                              className={`text-xs short:text-[10px] font-bold text-[#2D6A4F] leading-tight ${
                                idx > 0 ? 'pt-0.5 border-t border-[#E5D1AD]/80' : ''
                              }`}
                            >
                              {line}
                            </p>
                          ))}
                        </div>

                        {unlocked ? (
                          <button
                            type="button"
                            disabled={isEquipped}
                            onClick={() => onSelectToy(toy.id)}
                            className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-extrabold text-xs short:text-[11px] transition-all inline-flex items-center justify-center gap-1 ${
                              isEquipped
                                ? 'bg-gradient-to-b from-[#4B9B59] to-[#2E6F3E] border-[#1E4627] text-white cursor-default'
                                : 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722] hover:bg-[#D4E6DA] cursor-pointer'
                            }`}
                          >
                            {isEquipped ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{t.common.usedEquipped}</span>
                              </>
                            ) : (
                              <span>{t.common.use}</span>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => onSelectToy(toy.id)}
                            className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-black text-sm short:text-xs tabular-nums transition-all inline-flex items-center justify-center gap-1.5 ${
                              canAfford
                                ? 'bg-gradient-to-b from-[#FBBF49] to-[#E5861F] border-[#6E3B1B] text-[#5A2D12] shadow-[inset_0_2px_0_#FDE68A,0_3px_0_#6E3B1B] hover:brightness-105 active:translate-y-0.5 cursor-pointer'
                                : 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                            }`}
                          >
                            <img
                              src="/assets/ui/icon_coin.png"
                              alt=""
                              className="w-4 h-4 short:w-3.5 short:h-3.5 object-contain"
                              draggable={false}
                            />
                            <span>{toy.price}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'kostum' &&
                (() => {
                  const hasAnyEquipped =
                    hud.equippedHat !== 'none' ||
                    hud.equippedGlasses !== 'none' ||
                    hud.equippedScarf !== 'default';
                  const filtered =
                    costumeFilter === 'all'
                      ? CAT_ACCESSORIES
                      : CAT_ACCESSORIES.filter((a) => a.slot === costumeFilter);

                  return (
                    <div className="space-y-2.5 short:space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          {(
                            [
                              { id: 'all', label: t.shop.costumeFilters.all },
                              { id: 'hat', label: t.shop.costumeFilters.hat },
                              { id: 'glasses', label: t.shop.costumeFilters.glasses },
                            ] as Array<{ id: CostumeFilter; label: string }>
                          ).map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setCostumeFilter(f.id)}
                              className={`px-2.5 py-1 rounded-full text-[11px] short:text-[10px] font-extrabold border transition-colors cursor-pointer ${
                                costumeFilter === f.id
                                  ? 'bg-[#6E3B1B] border-[#6E3B1B] text-[#FFFDF8]'
                                  : 'bg-[#FFFDF8] border-[#B68D5E] text-[#7A4928] hover:bg-[#FCE8C3]'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>

                        {hasAnyEquipped && (
                          <button
                            type="button"
                            onClick={onUnequipAllAccessories}
                            className="px-2.5 py-1 rounded-full text-[11px] short:text-[10px] font-extrabold bg-[#FEF2F2] border border-[#DC2626]/40 text-[#B91C1C] hover:bg-[#FEE2E2] whitespace-nowrap cursor-pointer shrink-0"
                          >
                            {t.common.unequipAll}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 short:grid-cols-3 gap-3 short:gap-2">
                        {filtered.map((acc) => {
                          const accLoc = t.catalog.accessories[acc.id];
                          const unlocked = hud.unlockedAccessories.includes(acc.id);
                          const isEquipped =
                            hud.equippedHat === acc.id ||
                            hud.equippedGlasses === acc.id ||
                            hud.equippedScarf === acc.id;
                          const canAfford = hud.coins >= acc.price;
                          const slotLabel =
                            acc.slot === 'hat'
                              ? t.shop.slotLabels.hat
                              : acc.slot === 'glasses'
                              ? t.shop.slotLabels.glasses
                              : t.shop.slotLabels.scarf;

                          return (
                            <div
                              key={acc.id}
                              className={`relative rounded-xl short:rounded-lg border-2 shadow-[0_3px_0_#E5D1AD] p-3 short:p-2 flex flex-col items-center text-center justify-between ${
                                isEquipped
                                  ? 'bg-[#F2FBF5] border-[#2D6A4F]/70'
                                  : 'bg-[#FFFDF7] border-[#C79C69]'
                              }`}
                            >
                              <OrnateCornerFlourishes className="short:w-3 short:h-3" />
                              <PixelStarBadgeIcon className="w-5 h-5 short:w-4 short:h-4 mb-1 short:mb-0.5" />

                              <div className="w-full aspect-[4/3] short:aspect-[16/10] rounded-lg bg-[#EFE4CE] border border-[#D8C29D] flex items-center justify-center p-2 short:p-1 mb-2 short:mb-1">
                                <AccessoryIcon
                                  variant={acc.id}
                                  className="w-14 h-14 short:w-10 short:h-10"
                                />
                              </div>

                              <p className="font-display font-extrabold text-sm short:text-xs text-[#5A2D12] leading-tight">
                                {accLoc.name}
                              </p>
                              <p className="text-[10px] short:text-[9px] font-bold text-[#9A4D18] mt-0.5 mb-2 short:mb-1">
                                {slotLabel}
                              </p>

                              {unlocked ? (
                                <button
                                  type="button"
                                  onClick={() => onSelectAccessory(acc.id)}
                                  className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-extrabold text-xs short:text-[11px] transition-all inline-flex items-center justify-center gap-1 cursor-pointer ${
                                    isEquipped
                                      ? 'bg-[#FEE2E2] border-[#B91C1C] text-[#991B1B] hover:bg-[#FECACA]'
                                      : 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722] hover:bg-[#D4E6DA]'
                                  }`}
                                >
                                  <span>{isEquipped ? t.common.unequip : t.common.equip}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!canAfford}
                                  onClick={() => onSelectAccessory(acc.id)}
                                  className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-black text-sm short:text-xs tabular-nums transition-all inline-flex items-center justify-center gap-1.5 ${
                                    canAfford
                                      ? 'bg-gradient-to-b from-[#FBBF49] to-[#E5861F] border-[#6E3B1B] text-[#5A2D12] shadow-[inset_0_2px_0_#FDE68A,0_3px_0_#6E3B1B] hover:brightness-105 active:translate-y-0.5 cursor-pointer'
                                      : 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                                  }`}
                                >
                                  <img
                                    src="/assets/ui/icon_coin.png"
                                    alt=""
                                    className="w-4 h-4 short:w-3.5 short:h-3.5 object-contain"
                                    draggable={false}
                                  />
                                  <span>{acc.price}</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

              {activeTab === 'rumah' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 short:grid-cols-3 gap-3 short:gap-2">
                  {ROOM_BACKGROUNDS.map((bg) => {
                    const bgLoc = t.catalog.backgrounds[bg.id];
                    const unlocked = hud.unlockedBackgrounds.includes(bg.id);
                    const isEquipped = hud.activeBackground === bg.id;
                    const canAfford = hud.coins >= bg.price;

                    return (
                      <div
                        key={bg.id}
                        className={`relative rounded-xl short:rounded-lg border-2 shadow-[0_3px_0_#E5D1AD] p-3 short:p-2 flex flex-col items-center text-center justify-between ${
                          isEquipped
                            ? 'bg-[#F2FBF5] border-[#2D6A4F]/70'
                            : 'bg-[#FFFDF7] border-[#C79C69]'
                        }`}
                      >
                        <OrnateCornerFlourishes className="short:w-3 short:h-3" />
                        <PixelStarBadgeIcon className="w-5 h-5 short:w-4 short:h-4 mb-1 short:mb-0.5" />

                        <div className="w-full aspect-[4/3] short:aspect-[16/10] rounded-lg bg-[#EFE4CE] border border-[#D8C29D] flex items-center justify-center p-2 short:p-1 mb-2 short:mb-1">
                          <RoomBgIcon
                            variant={bg.id}
                            className="w-16 h-12 short:w-11 short:h-9"
                          />
                        </div>

                        <p className="font-display font-extrabold text-sm short:text-xs text-[#5A2D12] leading-tight mb-1">
                          {bgLoc.name}
                        </p>
                        <p className="text-[10px] short:text-[9px] font-medium text-[#6B5749] leading-snug mb-2 short:mb-1.5 line-clamp-2">
                          {bgLoc.description}
                        </p>

                        {unlocked ? (
                          <button
                            type="button"
                            disabled={isEquipped}
                            onClick={() => onSelectBackground(bg.id)}
                            className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-extrabold text-xs short:text-[11px] transition-all inline-flex items-center justify-center gap-1 ${
                              isEquipped
                                ? 'bg-gradient-to-b from-[#4B9B59] to-[#2E6F3E] border-[#1E4627] text-white cursor-default'
                                : 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722] hover:bg-[#D4E6DA] cursor-pointer'
                            }`}
                          >
                            {isEquipped ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{t.common.usedEquipped}</span>
                              </>
                            ) : (
                              <span>{t.common.use}</span>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => onSelectBackground(bg.id)}
                            className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-black text-sm short:text-xs tabular-nums transition-all inline-flex items-center justify-center gap-1.5 ${
                              canAfford
                                ? 'bg-gradient-to-b from-[#FBBF49] to-[#E5861F] border-[#6E3B1B] text-[#5A2D12] shadow-[inset_0_2px_0_#FDE68A,0_3px_0_#6E3B1B] hover:brightness-105 active:translate-y-0.5 cursor-pointer'
                                : 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                            }`}
                          >
                            <img
                              src="/assets/ui/icon_coin.png"
                              alt=""
                              className="w-4 h-4 short:w-3.5 short:h-3.5 object-contain"
                              draggable={false}
                            />
                            <span>{bg.price}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'kasur' && (
                <div className="space-y-2.5 short:space-y-1.5">
                  <p className="text-xs short:text-[10px] font-bold text-[#7A4928] text-center">
                    {t.shop.bedTip}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 short:grid-cols-3 gap-3 short:gap-2">
                    {CAT_BEDS.map((bed) => {
                      const bedLoc = t.catalog.beds[bed.id];
                      const unlocked = hud.unlockedBeds.includes(bed.id);
                      const isEquipped = hud.activeBed === bed.id;
                      const canAfford = hud.coins >= bed.price;

                      return (
                        <div
                          key={bed.id}
                          className={`relative rounded-xl short:rounded-lg border-2 shadow-[0_3px_0_#E5D1AD] p-3 short:p-2 flex flex-col items-center text-center justify-between ${
                            isEquipped
                              ? 'bg-[#F2FBF5] border-[#2D6A4F]/70'
                              : 'bg-[#FFFDF7] border-[#C79C69]'
                          }`}
                        >
                          <OrnateCornerFlourishes className="short:w-3 short:h-3" />
                          <PixelStarBadgeIcon className="w-5 h-5 short:w-4 short:h-4 mb-1 short:mb-0.5" />

                          <div className="w-full aspect-[4/3] short:aspect-[16/10] rounded-lg bg-[#EFE4CE] border border-[#D8C29D] flex items-center justify-center p-2 short:p-1 mb-2 short:mb-1">
                            <img
                              src={bed.imgSrc}
                              alt={bedLoc.name}
                              className="w-full h-full object-contain"
                              draggable={false}
                            />
                          </div>

                          <p className="font-display font-extrabold text-sm short:text-xs text-[#5A2D12] leading-tight mb-1">
                            {bedLoc.name}
                          </p>
                          <p className="text-[10px] short:text-[9px] font-medium text-[#6B5749] leading-snug mb-2 short:mb-1.5 line-clamp-2">
                            {bedLoc.description}
                          </p>

                          {unlocked ? (
                            <button
                              type="button"
                              disabled={isEquipped}
                              onClick={() => onSelectBed(bed.id)}
                              className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-extrabold text-xs short:text-[11px] transition-all inline-flex items-center justify-center gap-1 ${
                                isEquipped
                                  ? 'bg-gradient-to-b from-[#4B9B59] to-[#2E6F3E] border-[#1E4627] text-white cursor-default'
                                  : 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722] hover:bg-[#D4E6DA] cursor-pointer'
                              }`}
                            >
                              {isEquipped ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{t.common.usedEquipped}</span>
                                </>
                              ) : (
                                <span>{t.common.use}</span>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!canAfford}
                              onClick={() => onSelectBed(bed.id)}
                              className={`w-full py-1.5 short:py-1 px-3 min-h-[38px] short:min-h-[32px] rounded-full border-2 font-display font-black text-sm short:text-xs tabular-nums transition-all inline-flex items-center justify-center gap-1.5 ${
                                canAfford
                                  ? 'bg-gradient-to-b from-[#FBBF49] to-[#E5861F] border-[#6E3B1B] text-[#5A2D12] shadow-[inset_0_2px_0_#FDE68A,0_3px_0_#6E3B1B] hover:brightness-105 active:translate-y-0.5 cursor-pointer'
                                  : 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                              }`}
                            >
                              <img
                                src="/assets/ui/icon_coin.png"
                                alt=""
                                className="w-4 h-4 short:w-3.5 short:h-3.5 object-contain"
                                draggable={false}
                              />
                              <span>{bed.price}</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
