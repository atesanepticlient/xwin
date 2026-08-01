"use client";

import React, { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginByEmail, loginByPhone } from "@/action/login";
import { loginEmailSchema, loginPhoneSchema } from "@/schema";
import Link from "next/link";
import { Eye, EyeOff, Mail, Smartphone, Check } from "lucide-react";
import SweetAlert from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PrimaryButton from "../buttons/primary-button";
import { FloatingInput, FloatingLabel } from "../ui/floating-label-input";
import PhoneCodeSelect from "../ui/phone-code-select";
import { PHONE_COUNTRIES } from "@/lib/location-data";
import {
  Form,
  FormControl,
  FormMessage,
  FormItem,
  FormField,
} from "@/components/ui/form";
import FlipText from "../FlipText";

const SweetToast = withReactContent(SweetAlert);

type Tab = "email" | "phone" | "social";

const LoginForm = () => {
  const searchParams = useSearchParams();
  // Get the redirect query parameter set by middleware (/login?redirect=/target-path)
  const redirectParam = searchParams.get("redirect");
  const targetUrl = redirectParam ? decodeURIComponent(redirectParam) : "/";

  const [tab, setTab] = useState<Tab>("email");
  const [pending, startTransition] = useTransition();
  const [passwordType, setPasswordType] = useState<"text" | "password">(
    "password",
  );

  const emailForm = useForm<zod.infer<typeof loginEmailSchema>>({
    defaultValues: { identifier: "", password: "", remember: true },
    resolver: zodResolver(loginEmailSchema),
  });

  const phoneForm = useForm<zod.infer<typeof loginPhoneSchema>>({
    defaultValues: {
      dialCode: PHONE_COUNTRIES[0].dialCode, // BD by default
      phone: "",
      password: "",
      remember: true,
    },
    resolver: zodResolver(loginPhoneSchema),
  });

  const togglePasswordType = () =>
    setPasswordType((p) => (p === "text" ? "password" : "text"));

  const handleError = (res: { error?: string }) => {
    if (res.error) {
      SweetToast.fire({
        icon: "error",
        title: res.error,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const handleSuccessAndRedirect = (successMessage?: string) => {
    SweetToast.fire({
      icon: "success",
      title: successMessage || "Login successful!",
      showConfirmButton: false,
      timer: 1200,
    }).then(() => {
      // Perform full page reload to clear auth state and navigate to target
      window.location.href = targetUrl;
    });
  };

  const handleEmailLogin = (data: zod.infer<typeof loginEmailSchema>) => {
    startTransition(() => {
      loginByEmail(data).then((res) => {
        if (res?.success) {
          handleSuccessAndRedirect(res.success);
        } else {
          handleError(res);
        }
      });
    });
  };

  const handlePhoneLogin = (data: zod.infer<typeof loginPhoneSchema>) => {
    startTransition(() => {
      loginByPhone(data).then((res) => {
        if (res?.success) {
          handleSuccessAndRedirect(res.success);
        } else {
          handleError(res);
        }
      });
    });
  };

  const tabButtonClass = (active: boolean) =>
    `flex flex-col items-center gap-2 py-3 rounded-md ${
      active ? "bg-[#2b2b2b] text-white" : "bg-white text-[#3b3b3b] shadow-sm"
    }`;

  return (
    <div className="w-full md:w-[400px] md:mx-auto h-screen ">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <button
          type="button"
          onClick={() => setTab("email")}
          className={tabButtonClass(tab === "email")}
        >
          <Mail className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setTab("phone")}
          className={tabButtonClass(tab === "phone")}
        >
          <Smartphone className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-2 text-center text-sm mb-6">
        <span className="text-[#414141]">By email</span>
        <span className="text-[#414141]">By phone</span>
      </div>

      {tab === "email" && (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(handleEmailLogin)}>
            <FormField
              name="identifier"
              control={emailForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <FloatingInput
                        {...field}
                        type="text"
                        id="floating-identifier"
                        disabled={pending}
                        className="text-[#3b3b3b] py-5 rounded-sm bg-white"
                      />
                      <FloatingLabel
                        htmlFor="floating-identifier"
                        className="font-normal text-[#3b3b3b]"
                      >
                        E-mail or ID*
                      </FloatingLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="my-3" />

            <FormField
              name="password"
              control={emailForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center border border-border rounded-md bg-white">
                      <div className="relative flex-1">
                        <FloatingInput
                          {...field}
                          type={passwordType}
                          disabled={pending}
                          id="floating-login-password"
                          className="border-none text-[#3b3b3b]"
                        />
                        <FloatingLabel
                          htmlFor="floating-login-password"
                          className="font-normal text-[#3b3b3b]"
                        >
                          Password*
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

            <RememberMeAndSubmit
              control={emailForm.control}
              pending={pending}
            />
          </form>
        </Form>
      )}

      {tab === "phone" && (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(handlePhoneLogin)}>
            <div className="flex gap-3">
              <FormField
                name="dialCode"
                control={phoneForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PhoneCodeSelect
                        options={PHONE_COUNTRIES}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={pending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="phone"
                control={phoneForm.control}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <FloatingInput
                          {...field}
                          type="tel"
                          id="floating-phone-number"
                          disabled={pending}
                          className="text-[#3b3b3b] py-5 rounded-sm bg-white"
                        />
                        <FloatingLabel
                          htmlFor="floating-phone-number"
                          className="font-normal text-[#3b3b3b]"
                        >
                          Phone number
                        </FloatingLabel>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="my-3" />

            <FormField
              name="password"
              control={phoneForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center border border-border rounded-md bg-white">
                      <div className="relative flex-1">
                        <FloatingInput
                          {...field}
                          type={passwordType}
                          disabled={pending}
                          id="floating-login-phone-password"
                          className="border-none text-[#3b3b3b]"
                        />
                        <FloatingLabel
                          htmlFor="floating-login-phone-password"
                          className="font-normal text-[#3b3b3b]"
                        >
                          Password*
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

            <RememberMeAndSubmit
              control={phoneForm.control}
              pending={pending}
            />
          </form>
        </Form>
      )}

      {tab === "social" && (
        <div className="text-center text-sm text-[#8a8a8a] py-10">
          Social network login isn&apos;t in the screens you shared yet — happy
          to build it once you know which providers (Google, Facebook, etc.) you
          want to support.
        </div>
      )}

      {tab !== "social" && (
        <>
          <div className="my-5 flex justify-center">
            <div className="w-full md:w-[300px] bg-border h-[1px]"></div>
          </div>
          <p className="text-xs text-center text-[#3b3b3b]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#266210] font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </>
      )}
    </div>
  );
};

// Shared "Remember me" checkbox + submit button
const RememberMeAndSubmit = ({
  control,
  pending,
}: {
  control: any;
  pending: boolean;
}) => (
  <>
    <FormField
      name="remember"
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <label className="flex items-center gap-3 mt-5 cursor-pointer select-none">
              <span
                className="w-6 h-6 rounded-md border border-border flex items-center justify-center bg-white"
                onClick={() => field.onChange(!field.value)}
              >
                {field.value && <Check className="w-4 h-4 text-[#2b2b2b]" />}
              </span>
              <span className="text-sm text-[#3b3b3b]">Remember me</span>
            </label>
          </FormControl>
        </FormItem>
      )}
    />

    <div className="mt-6">
      <PrimaryButton type="submit" className="w-full py-3" disabled={pending}>
        {pending ? (
          <FlipText
            text="WinpariBet"
            className="font-bold text-white text-xs"
          />
        ) : (
          "LOG IN"
        )}
      </PrimaryButton>
    </div>

    <p className="text-center mt-4">
      <Link
        href="/forgot-password"
        className="text-sm underline text-[#3b3b3b]"
      >
        Forgot your password?
      </Link>
    </p>
  </>
);

export default LoginForm;
