import { BonusTypeEnum } from "@/types";
import zod from "zod";

// ---------- Step 1 (By e-mail tab) ----------
export const emailStepSchema = zod.object({
  email: zod.string().email("Enter a valid email"),
});

// ---------- Step 2 (By e-mail tab) - also used as the top of the One-click tab ----------
export const countryStepSchema = zod.object({
  country: zod.string().min(1, "Please select a country"),
});

// ---------- Step 3 (By e-mail tab) ----------
export const finalStepSchema = zod
  .object({
    currencyCode: zod.string().min(1, "Currency code is required"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod.string().min(1, "Confirm password is required"),
    promo: zod.optional(zod.string()),
    bonusType: BonusTypeEnum.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Confirm Password did not match",
  });

// ---------- Full "By e-mail" registration payload (all 3 steps merged) ----------
export const registerSchema = zod
  .object({
    email: zod.string().email("Enter a valid email"),
    country: zod.string().min(1, "Please select a country"),
    currencyCode: zod.string().min(1, "Currency code is required"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod.string().min(1, "Confirm password is required"),
    promo: zod.optional(zod.string()),
    bonusType: BonusTypeEnum.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Confirm Password did not match",
  });

// ---------- "One-click" tab payload (image 4: no email/password/OTP at all) ----------
export const oneClickSchema = zod.object({
  country: zod.string().min(1, "Please select a country"),
  currencyCode: zod.string().min(1, "Currency code is required"),
  promo: zod.optional(zod.string()),
  bonusType: BonusTypeEnum.optional(),
});

export type RegisterInput = zod.infer<typeof registerSchema>;
export type OneClickInput = zod.infer<typeof oneClickSchema>;

export const loginEmailSchema = zod.object({
  identifier: zod.string().min(1, "Email or ID is required"), // matches by email OR playerId
  password: zod.string().min(1, "Password is required"),
  remember: zod.boolean().default(true),
});

export const loginPhoneSchema = zod.object({
  dialCode: zod.string().min(1, "Select a country code"),
  phone: zod
    .string()
    .min(6, "Enter a valid phone number")
    .regex(/^\d+$/, "Phone number should contain digits only"),
  password: zod.string().min(1, "Password is required"),
  remember: zod.boolean().default(true),
});

export type LoginEmailInput = zod.infer<typeof loginEmailSchema>;
export type LoginPhoneInput = zod.infer<typeof loginPhoneSchema>;

export const passwordChangeSchema = zod
  .object({
    currentPassword: zod.string().min(1, "Password is required"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod.string().min(1, "Confirm password is required"),
  })
  .refine(
    (data) => {
      if (data.password) {
        return data.password == data.confirmPassword;
      }
      return true;
    },
    { path: ["confirmPassword"], message: "Confirm Password did not match" },
  );

export const nameChangeSchema = zod.object({
  firstName: zod
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(10, "First namecannot be more than 6 characters long"),
  lastName: zod
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(10, "First namecannot be more than 6 characters long"),
});

export const phoneNumberChangeSchema = zod.object({
  password: zod.string().min(1, "Password is required"),
  phone: zod.string().min(1, "Phone number is required"),
});

export const makeDepositScehma = zod.object({
  payTo: zod.string().min(1, "Payment Number is required"),
  payFrom: zod.string().min(1, "Payment Number is required"),
  amount: zod.string().min(1, "Enter Amount"),
  transactionId: zod.string().min(1, "Transaction Id is require"),
});
export const makeAPayDepositScehma = zod.object({
  accountNumber: zod.optional(zod.string()),
  amount: zod.string().min(1, "Enter Amount"),
});

export const makeWithdrawScehma = zod.object({
  payTo: zod.string().min(1, "Payment Number is required"),
  amount: zod.string().min(1, "Enter Amount"),
});

export const makeAPayWithdrawScehma = zod.object({
  accountNumber: zod.string().min(1, "Account number is required"),
  amount: zod.string().min(1, "Enter Amount"),
});

export const cashWithdrawScehma = zod.object({
  address: zod.string().min(1, "Address is required"),
  amount: zod.string().min(1, "Enter Amount"),
  selectedAddress: zod.string(),
});

export const forgotPasswordSchema = zod.object({
  email: zod.string().email("Please enter a valid email"),
});

export const resetPasswordSchema = zod
  .object({
    email: zod.string().email(),
    otp: zod.string().min(6, "OTP must be 6 digits"),
    newPassword: zod.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const emailChangeSchema = zod.object({
  password: zod.string().min(1, "Password is required"),
  email: zod.string().email("Enter a valid email address"),
});
export const cryptoDepositSchema = zod.object({
  walletId: zod.string().min(1),
  amount: zod.string().min(1, "Amount is required"),
  transactionId: zod.string().min(6, "Enter a valid transaction hash"),
});

export const cryptoWithdrawSchema = zod.object({
  walletId: zod.string().min(1),
  amount: zod.string().min(1, "Amount is required"),
  address: zod.string().min(10, "Enter a valid wallet address"),
});
