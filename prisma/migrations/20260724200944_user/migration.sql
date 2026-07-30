-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AGENT', 'USER');

-- CreateEnum
CREATE TYPE "UserReference" AS ENUM ('ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "SignupMethod" AS ENUM ('EMAIL', 'ONE_CLICK');

-- CreateEnum
CREATE TYPE "AgentEarningWithdrawReqStatus" AS ENUM ('CLEARED', 'PENDING', 'UNCLEARED');

-- CreateEnum
CREATE TYPE "WithdrawStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TrxType" AS ENUM ('SENDMONEY', 'CASHOUT', 'PAYMENT');

-- CreateEnum
CREATE TYPE "PaymentHistoryStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentHistoryType" AS ENUM ('DEPOSIT', 'WITHDRAW');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "playerId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "password" TEXT NOT NULL,
    "casinoPassword" TEXT NOT NULL,
    "referId" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "isNewUser" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "getBouns" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT,
    "signupMethod" "SignupMethod" NOT NULL DEFAULT 'EMAIL',
    "optInBonus" BOOLEAN NOT NULL DEFAULT true,
    "bonusType" TEXT,
    "referredById" TEXT,
    "agentId" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" TEXT,
    "verificationCodeExpiresAt" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BettingRecord" (
    "id" TEXT NOT NULL,
    "totalBet" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalWin" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BettingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsersTurnOver" (
    "id" TEXT NOT NULL,
    "totalTurnOver" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "activeTurnOver" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UsersTurnOver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "hasInactive" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusWallet" (
    "id" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "turnOver" DECIMAL(65,30) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "hasInactive" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BonusWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "twoFAEmail" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "documents" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "promo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetTokenAgent" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetTokenAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentEarningWithdrawReq" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "wdAmount" DECIMAL(65,30) NOT NULL,
    "dpAmount" DECIMAL(65,30) NOT NULL,
    "agentId" TEXT NOT NULL,
    "status" "AgentEarningWithdrawReqStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentEarningWithdrawReq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentWithdrawAddress" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postOffice" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentId" TEXT NOT NULL,

    CONSTRAINT "AgentWithdrawAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentDepositRecord" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentDepositRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentWithdrawRecord" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "withdrawCode" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "status" "WithdrawStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentWithdrawRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agentWallet" (
    "id" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "hasInactive" BOOLEAN NOT NULL DEFAULT false,
    "agentId" TEXT NOT NULL,

    CONSTRAINT "agentWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adminEmailVerificationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expire" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adminEmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eWallet" (
    "id" TEXT NOT NULL,
    "walletName" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "eWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgEWallet" (
    "id" TEXT NOT NULL,
    "deposit" JSONB NOT NULL,
    "withdraw" JSONB NOT NULL,
    "eWalletId" TEXT NOT NULL,
    "isRecommended" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "agentId" TEXT NOT NULL,

    CONSTRAINT "AgEWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdEWallet" (
    "id" TEXT NOT NULL,
    "deposit" JSONB NOT NULL,
    "withdraw" JSONB NOT NULL,
    "eWalletId" TEXT NOT NULL,
    "isRecommended" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "AdEWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositEWallet" (
    "id" TEXT NOT NULL,
    "walletName" TEXT NOT NULL,
    "walletImage" TEXT NOT NULL,
    "walletNumber" TEXT NOT NULL,
    "minDeposit" DECIMAL(65,30) NOT NULL,
    "maxDeposit" DECIMAL(65,30) NOT NULL,
    "rules" TEXT,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "trxType" "TrxType" NOT NULL DEFAULT 'SENDMONEY',

    CONSTRAINT "DepositEWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawEWallet" (
    "id" TEXT NOT NULL,
    "walletName" TEXT NOT NULL,
    "walletImage" TEXT NOT NULL,
    "isRecommended" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rules" TEXT,

    CONSTRAINT "WithdrawEWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "payFrom" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ewalletId" TEXT NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APayDeposit" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "trxId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "APayDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdraw" (
    "id" TEXT NOT NULL,
    "paymentWalletNumber" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawEWalletID" TEXT,

    CONSTRAINT "Withdraw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APayWithdraw" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "trxId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "APayWithdraw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" TEXT NOT NULL,
    "amount" INTEGER,
    "type" "PaymentHistoryType" NOT NULL,
    "status" "PaymentHistoryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "depositId" TEXT,
    "withdrawId" TEXT,

    CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "telegram" TEXT,
    "email" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "youtube" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "firstDepositBonus" DECIMAL(65,30) DEFAULT 0,
    "referBonuseMainUser" DECIMAL(65,30) DEFAULT 0,
    "referBonuseRefererUser" DECIMAL(65,30) DEFAULT 0,
    "maxWithdraw" DECIMAL(65,30) DEFAULT 0,
    "minWithdraw" DECIMAL(65,30) DEFAULT 0,
    "maxAgWithdraw" DECIMAL(65,30) DEFAULT 0,
    "minAgWithdraw" DECIMAL(65,30) DEFAULT 0,
    "maxAgDeposit" DECIMAL(65,30) DEFAULT 0,
    "minAgDeposit" DECIMAL(65,30) DEFAULT 0,
    "turnover" DECIMAL(65,30) DEFAULT 0,
    "minAgentPayout" DECIMAL(65,30) DEFAULT 0,
    "maxAgentPayout" DECIMAL(65,30) DEFAULT 0,
    "agentDepositEarning" DECIMAL(65,30) DEFAULT 0,
    "agentWithdrawEarning" DECIMAL(65,30) DEFAULT 0,
    "minAgentSecurityMoney" DECIMAL(65,30) DEFAULT 0,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_playerId_key" ON "Users"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_playerId_key" ON "Users"("email", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "BettingRecord_userId_key" ON "BettingRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_email_key" ON "VerificationToken"("email");

-- CreateIndex
CREATE INDEX "VerificationToken_email_idx" ON "VerificationToken"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UsersTurnOver_userId_key" ON "UsersTurnOver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_userId_key" ON "Referral"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_userId_key" ON "wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BonusWallet_userId_key" ON "BonusWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agent_email_key" ON "agent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agent_phone_key" ON "agent"("phone");

-- CreateIndex
CREATE INDEX "PasswordResetTokenAgent_token_idx" ON "PasswordResetTokenAgent"("token");

-- CreateIndex
CREATE INDEX "PasswordResetTokenAgent_agentId_idx" ON "PasswordResetTokenAgent"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentWithdrawAddress_storeName_key" ON "AgentWithdrawAddress"("storeName");

-- CreateIndex
CREATE UNIQUE INDEX "AgentWithdrawAddress_token_key" ON "AgentWithdrawAddress"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AgentWithdrawAddress_agentId_key" ON "AgentWithdrawAddress"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "agentWallet_agentId_key" ON "agentWallet"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "AgEWallet_eWalletId_key" ON "AgEWallet"("eWalletId");

-- CreateIndex
CREATE UNIQUE INDEX "AdEWallet_eWalletId_key" ON "AdEWallet"("eWalletId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentHistory_depositId_key" ON "PaymentHistory"("depositId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentHistory_withdrawId_key" ON "PaymentHistory"("withdrawId");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Referral"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BettingRecord" ADD CONSTRAINT "BettingRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersTurnOver" ADD CONSTRAINT "UsersTurnOver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusWallet" ADD CONSTRAINT "BonusWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetTokenAgent" ADD CONSTRAINT "PasswordResetTokenAgent_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentEarningWithdrawReq" ADD CONSTRAINT "AgentEarningWithdrawReq_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentWithdrawAddress" ADD CONSTRAINT "AgentWithdrawAddress_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDepositRecord" ADD CONSTRAINT "AgentDepositRecord_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDepositRecord" ADD CONSTRAINT "AgentDepositRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentWithdrawRecord" ADD CONSTRAINT "AgentWithdrawRecord_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentWithdrawRecord" ADD CONSTRAINT "AgentWithdrawRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agentWallet" ADD CONSTRAINT "agentWallet_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgEWallet" ADD CONSTRAINT "AgEWallet_eWalletId_fkey" FOREIGN KEY ("eWalletId") REFERENCES "eWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgEWallet" ADD CONSTRAINT "AgEWallet_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdEWallet" ADD CONSTRAINT "AdEWallet_eWalletId_fkey" FOREIGN KEY ("eWalletId") REFERENCES "eWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdEWallet" ADD CONSTRAINT "AdEWallet_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_ewalletId_fkey" FOREIGN KEY ("ewalletId") REFERENCES "DepositEWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APayDeposit" ADD CONSTRAINT "APayDeposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdraw" ADD CONSTRAINT "Withdraw_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdraw" ADD CONSTRAINT "Withdraw_withdrawEWalletID_fkey" FOREIGN KEY ("withdrawEWalletID") REFERENCES "WithdrawEWallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APayWithdraw" ADD CONSTRAINT "APayWithdraw_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_withdrawId_fkey" FOREIGN KEY ("withdrawId") REFERENCES "Withdraw"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
