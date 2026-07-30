/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, resetPasswordSchema } from "@/schema";
import { FloatingInput, FloatingLabel } from "../ui/floating-label-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import PrimaryButton from "../buttons/primary-button";
import { ScaleLoader } from "react-spinners";
import SweetToast from "../ui/SweetToast";
import zod from "zod";
import Link from "next/link";
import {
  sendPasswordResetEmail,
  verifyOtpAndResetPassword,
} from "@/action/forgot-password";
import { Eye, EyeOff } from "lucide-react";

const ForgotPasswordForm = () => {
  const [pending, startTransition] = useTransition();
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");

  const form = useForm<zod.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetForm = useForm<zod.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [passwordType, setPasswordType] = useState<"text" | "password">(
    "password",
  );
  const [confirmPasswordType, setConfirmPasswordType] = useState<
    "text" | "password"
  >("password");

  const handleSendOtp = (data: zod.infer<typeof forgotPasswordSchema>) => {
    startTransition(() => {
      sendPasswordResetEmail(data.email).then((res) => {
        if (res.success) {
          SweetToast.fire({
            icon: "success",
            title: res.success,
            showConfirmButton: false,
            timer: 2000,
          });
          setOtpSent(true);
          setEmail(data.email);
          resetForm.reset({
            email: data.email,
            otp: "",
            newPassword: "",
            confirmPassword: "",
          });
        } else if (res.error) {
          SweetToast.fire({
            icon: "error",
            title: res.error,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      });
    });
  };

  const handleResendOtp = () => {
    if (!email) return;
    startTransition(() => {
      sendPasswordResetEmail(email).then((res) => {
        if (res.success) {
          SweetToast.fire({
            icon: "success",
            title: res.success,
            showConfirmButton: false,
            timer: 2000,
          });
        } else if (res.error) {
          SweetToast.fire({
            icon: "error",
            title: res.error,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      });
    });
  };

  const handleResetPassword = (data: zod.infer<typeof resetPasswordSchema>) => {
    startTransition(() => {
      verifyOtpAndResetPassword(data).then((res) => {
        if (res.success) {
          SweetToast.fire({
            icon: "success",
            title: res.success,
            showConfirmButton: false,
            timer: 2000,
          });
          window.location.href = "/login";
        } else if (res.error) {
          SweetToast.fire({
            icon: "error",
            title: res.error,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      });
    });
  };

  const goBackToEmail = () => {
    setOtpSent(false);
  };

  const togglePasswordType = () => {
    setPasswordType((prev) => (prev === "text" ? "password" : "text"));
  };

  const toggleConfirmPasswordType = () => {
    setConfirmPasswordType((prev) => (prev === "text" ? "password" : "text"));
  };

  return (
    <div className="w-full md:w-[400px] md:mx-auto">
      <p className="text-center text-sm mb-6 text-black/90">
        {otpSent
          ? `Enter the OTP sent to ${email}`
          : "Enter your email to reset your password"}
      </p>

      <div className="bg-white p-3 rounded-md">
        {!otpSent ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendOtp)}>
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <FloatingInput
                          {...field}
                          type="email"
                          id="floating-email"
                          disabled={pending}
                          className="text-[#3b3b3b] py-5 rounded-sm bg-white"
                        />
                        <FloatingLabel
                          htmlFor="floating-email"
                          className="font-normal text-[#3b3b3b]"
                        >
                          Email
                        </FloatingLabel>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-6">
                <PrimaryButton
                  type="submit"
                  className="w-full py-3"
                  disabled={pending}
                >
                  {pending ? (
                    <ScaleLoader color="#fff" cssOverride={{ scale: 0.5 }} />
                  ) : (
                    "Send OTP"
                  )}
                </PrimaryButton>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(handleResetPassword)}>
              {/* Hidden email field - kept in the form but not shown */}
              <FormField
                name="email"
                control={resetForm.control}
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="otp"
                control={resetForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <FloatingInput
                          {...field}
                          type="text"
                          id="floating-otp"
                          disabled={pending}
                          className="text-[#3b3b3b] py-5 rounded-sm bg-white"
                        />
                        <FloatingLabel
                          htmlFor="floating-otp"
                          className="font-normal text-[#3b3b3b]"
                        >
                          Enter OTP
                        </FloatingLabel>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs mt-1 text-[#3b3b3b]">
                Didn&apos;t receive OTP?{" "}
                <button
                  type="button"
                  className="text-[#FFB805] hover:underline"
                  onClick={handleResendOtp}
                  disabled={pending}
                >
                  Resend
                </button>
              </p>

              <div className="my-3" />

              <FormField
                name="newPassword"
                control={resetForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center border border-border rounded-md">
                        <div className="relative flex-1">
                          <FloatingInput
                            {...field}
                            type={passwordType}
                            id="floating-new-password"
                            disabled={pending}
                            className="border-none text-[#3b3b3b]"
                          />
                          <FloatingLabel
                            htmlFor="floating-new-password"
                            className="font-normal text-[#3b3b3b]"
                          >
                            New Password
                          </FloatingLabel>
                        </div>
                        <button
                          type="button"
                          className="p-3"
                          onClick={togglePasswordType}
                          disabled={pending}
                        >
                          {passwordType === "text" ? (
                            <EyeOff className="text-[#3b3b3b] w-4 h-4" />
                          ) : (
                            <Eye className="text-[#3b3b3b] w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="my-3" />

              <FormField
                name="confirmPassword"
                control={resetForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center border border-border rounded-md">
                        <div className="relative flex-1">
                          <FloatingInput
                            {...field}
                            type={confirmPasswordType}
                            id="floating-confirm-password"
                            disabled={pending}
                            className="border-none text-[#3b3b3b]"
                          />
                          <FloatingLabel
                            htmlFor="floating-confirm-password"
                            className="font-normal text-[#3b3b3b]"
                          >
                            Confirm Password
                          </FloatingLabel>
                        </div>
                        <button
                          type="button"
                          className="p-3"
                          onClick={toggleConfirmPasswordType}
                          disabled={pending}
                        >
                          {confirmPasswordType === "text" ? (
                            <EyeOff className="text-[#3b3b3b] w-4 h-4" />
                          ) : (
                            <Eye className="text-[#3b3b3b] w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-6">
                <PrimaryButton
                  type="submit"
                  className="w-full py-3"
                  disabled={pending}
                >
                  {pending ? (
                    <ScaleLoader color="#fff" cssOverride={{ scale: 0.5 }} />
                  ) : (
                    "Reset Password"
                  )}
                </PrimaryButton>
                <button
                  type="button"
                  onClick={goBackToEmail}
                  disabled={pending}
                  className="w-full bg-[#bfbfbf] rounded-md py-2 mt-3"
                >
                  Back
                </button>
              </div>
            </form>
          </Form>
        )}
      </div>

      <div className="my-5 flex justify-center">
        <div className="w-full md:w-[300px] bg-border h-[1px]"></div>
      </div>
      <p className="text-xs text-center text-[#3b3b3b]">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-[#266210] font-medium hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
