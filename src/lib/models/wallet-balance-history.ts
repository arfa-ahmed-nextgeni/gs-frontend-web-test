import type {
  CurrencyEnum,
  GetCustomerRewardPointsHistoryQuery,
  RewardPointsBalanceHistoryItem,
} from "@/graphql/graphql";

export class WalletBalanceHistory {
  public balance: {
    currency?: CurrencyEnum | null;
    value?: null | number;
  };
  public items: WalletBalanceHistoryItem[];

  constructor(dto: GetCustomerRewardPointsHistoryQuery) {
    this.balance = dto.customer?.reward_points?.balance?.money || {
      currency: null,
      value: null,
    };
    this.items =
      dto.customer?.reward_points?.balance_history
        ?.filter((item): item is NonNullable<typeof item> => item !== null)
        .map((item) => new WalletBalanceHistoryItem(item)) || [];
  }
}

export class WalletBalanceHistoryItem {
  public amount: number;
  public balance: {
    money: {
      currency: null | string;
      value: null | number;
    };
    points: number;
  };
  public changeReason: string;
  public comment: null | string;
  public currency: string;
  public date: string;
  public displayOrderId: string;
  public expiryDate: null | string;
  public id: string;
  public isEarned: boolean;
  public isNameDisplay: boolean;
  public name: null | string;
  public orderId: null | string;
  public pointsChange: number;

  constructor(item: RewardPointsBalanceHistoryItem) {
    this.balance = {
      money: {
        currency: item.balance?.money?.currency || null,
        value: item.balance?.money?.value || null,
      },
      points: item.balance?.points || 0,
    };
    this.changeReason = item.change_reason || "";
    this.comment = item.comment || null;
    this.date = item.date || "";
    this.expiryDate = item.expiry_date || null;
    this.name = item.name || null;
    this.orderId = item.order_id || null;
    this.pointsChange = item.points_change || 0;

    // Computed properties
    this.isEarned = this.pointsChange > 0;
    this.currency = this.balance.money.currency || "SAR";
    this.amount = Math.abs(this.pointsChange);

    this.isNameDisplay = this.orderId === "_" || !this.orderId;
    this.id = !this.isNameDisplay
      ? `${this.orderId}-${this.date}` || this.date
      : this.date;
    this.displayOrderId = this.isNameDisplay
      ? this.name || ""
      : this.orderId || "";
  }
}
