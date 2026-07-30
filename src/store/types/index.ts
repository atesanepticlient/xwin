export interface Deposit {
  wallet: string;
  minimumDeposit: number;
  depositRange?: Array<number>;
  maximumDeposit: number;
}

export interface Withdraw {
  minimumWithdraw: number;
  maximumWithdraw: number;
}

export interface PaymentWallet {
  walletName: string;
  image: string;
  deposit?: Deposit;
  withdraw?: Withdraw;
  isActive: boolean;
}

export interface PaymentMethod {
  methodName: string;
  wallets: PaymentWallet[];
}


export interface Wallet {
  id: string;
  name: string;
  label: string;
  image: string;
  isActive: boolean;
  isRecommended: boolean;
  type?: string;
  minDeposit?: number | string;
  maxDeposit?: number | string;
  minWithdraw?: number | string;
  maxWithdraw?: number | string;
}

export interface MethodGroup {
  methodName: string;
  wallets: Wallet[];
}

export interface PaymentMethodsState {
  type?: "withdraw" | "deposit";
  allMethods: MethodGroup[];
  methods: MethodGroup[];
  currentMethod: string;
  setAllMethods: (methods: MethodGroup[]) => void;
  setMethod: (methodName: string) => void;
  setType: (type: "withdraw" | "deposit") => void;
}