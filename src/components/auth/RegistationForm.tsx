"use client";
import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { register, oneClickRegister } from "@/action/register";
import { registerSchema, oneClickSchema } from "@/schema";
import { redirect, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Zap, Trophy, Dices, X } from "lucide-react";
import SweetAlert from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PrimaryButton from "../buttons/primary-button";
import { FloatingInput, FloatingLabel } from "../ui/floating-label-input";
import IconSelect from "../ui/icon-select";
import { COUNTRIES, CURRENCIES, buildBonusOptions } from "@/lib/location-data";
import {
  Form,
  FormControl,
  FormMessage,
  FormItem,
  FormField,
} from "@/components/ui/form";
import FlipText from "../FlipText";

const SweetToast = withReactContent(SweetAlert);

type Tab = "email" | "oneclick";

const FALLBACK_COUNTRY = "BD";
const FALLBACK_CURRENCY = "BDT";

type Props = {
  firstDepositBonus?: number;
  initialCountry?: string;
};

const RegistationForm = ({ firstDepositBonus = 0, initialCountry }: Props) => {
  const searchParams = useSearchParams();
  // Read both "ref" and "r" query parameters
  const promoCode = searchParams.get("ref") || searchParams.get("r") || "";

  const [tab, setTab] = useState<Tab>("email");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pending, startTransition] = useTransition();
  const [passwordType, setPasswordType] = useState<"text" | "password">(
    "password",
  );
  const [confirmPasswordType, setConfirmPasswordType] = useState<
    "text" | "password"
  >("password");

  const resolveInitial = () => {
    const code = initialCountry ?? FALLBACK_COUNTRY;
    const match = COUNTRIES.find((c) => c.code === code);
    return {
      country: match?.code ?? FALLBACK_COUNTRY,
      currencyCode: match?.currency ?? FALLBACK_CURRENCY,
    };
  };
  const initial = resolveInitial();

  const getBonusOptions = (curr: string) => {
    const rawOptions = buildBonusOptions(firstDepositBonus, curr);

    const normalizeToEnumValue = (val: string): "FIRST_PAYIN" | "NO_BONUS" => {
      const v = String(val || "").toUpperCase();
      if (
        v.includes("REJECT") ||
        v.includes("NO_BONUS") ||
        v.includes("NONE") ||
        v.includes("WITHOUT")
      ) {
        return "NO_BONUS";
      }
      return "FIRST_PAYIN";
    };

    const getIcon = (enumValue: "FIRST_PAYIN" | "NO_BONUS", rawVal: string) => {
      const v = String(rawVal || "").toUpperCase();
      if (enumValue === "NO_BONUS") {
        return <X className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />;
      }
      if (v.includes("INVITATION") || v.includes("CASINO")) {
        return <Dices className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />;
      }
      return <Trophy className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />;
    };

    if (Array.isArray(rawOptions) && rawOptions.length > 0) {
      return rawOptions.map((opt: any) => {
        const rawVal = String(opt.value ?? opt.id ?? "FIRST_PAYIN");
        const value = normalizeToEnumValue(rawVal);
        return {
          value,
          label: opt.label ?? opt.title ?? "Sports Bonus",
          subLabel: opt.subLabel ?? opt.description ?? "",
          icon: getIcon(value, rawVal),
        };
      });
    }

    return [
      {
        value: "FIRST_PAYIN",
        label: "Bonus for sports",
        subLabel: `First deposit bonus (${curr})`,
        icon: <Trophy className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />,
      },
      {
        value: "NO_BONUS",
        label: "No bonus",
        subLabel: "Make selection later",
        icon: <X className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />,
      },
    ];
  };

  const initialBonusOptions = getBonusOptions(initial.currencyCode);
  const initialDefaultBonusValue =
    initialBonusOptions[0]?.value || "FIRST_PAYIN";

  const form = useForm<zod.infer<typeof registerSchema>>({
    defaultValues: {
      email: "",
      country: initial.country,
      password: "",
      promo: promoCode,
      confirmPassword: "",
      currencyCode: initial.currencyCode,
      bonusType: initialDefaultBonusValue,
    },
    resolver: zodResolver(registerSchema),
  });

  const oneClickForm = useForm<zod.infer<typeof oneClickSchema>>({
    defaultValues: {
      country: initial.country,
      currencyCode: initial.currencyCode,
      promo: promoCode,
      bonusType: initialDefaultBonusValue,
    },
    resolver: zodResolver(oneClickSchema),
  });

  // Sync query ref parameter to forms whenever it changes
  useEffect(() => {
    if (promoCode) {
      form.setValue("promo", promoCode);
      oneClickForm.setValue("promo", promoCode);
    }
  }, [promoCode, form, oneClickForm]);

  const currencyCode = form.watch("currencyCode");
  const oneClickCurrencyCode = oneClickForm.watch("currencyCode");

  const bonusOptions = getBonusOptions(currencyCode);
  const oneClickBonusOptions = getBonusOptions(oneClickCurrencyCode);

  const defaultBonusValue = bonusOptions[0]?.value || "FIRST_PAYIN";
  const defaultOneClickBonusValue =
    oneClickBonusOptions[0]?.value || "FIRST_PAYIN";

  useEffect(() => {
    const current = form.getValues("bonusType");
    const stillValid = bonusOptions.some((o) => o.value === current);
    if (!current || !stillValid) {
      form.setValue("bonusType", defaultBonusValue);
    }
  }, [currencyCode]);

  useEffect(() => {
    const current = oneClickForm.getValues("bonusType");
    const stillValid = oneClickBonusOptions.some((o) => o.value === current);
    if (!current || !stillValid) {
      oneClickForm.setValue("bonusType", defaultOneClickBonusValue);
    }
  }, [oneClickCurrencyCode]);

  const syncCurrencyToCountry = (
    countryCode: string,
    setValue: (name: "currencyCode", value: string) => void,
  ) => {
    const match = COUNTRIES.find((c) => c.code === countryCode);
    if (match) setValue("currencyCode", match.currency);
  };

  const togglePasswordType = () =>
    setPasswordType((p) => (p === "text" ? "password" : "password"));
  const toggleConfirmPasswordType = () =>
    setConfirmPasswordType((p) => (p === "text" ? "password" : "password"));

  const goNext = async () => {
    if (step === 1) {
      const ok = await form.trigger("email");
      if (ok) setStep(2);
    } else if (step === 2) {
      const ok = await form.trigger("country");
      if (ok) setStep(3);
    }
  };
  const goBack = () => setStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2)));

  const handleRegistration = (data: zod.infer<typeof registerSchema>) => {
    const payload = {
      ...data,
      bonusType: data.bonusType || defaultBonusValue,
    };

    startTransition(() => {
      register(payload).then((res) => {
        if (res.success) {
          SweetToast.fire({
            icon: "success",
            title: res.success,
            showConfirmButton: false,
            timer: 2000,
          });
          redirect("/login");
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

  const handleOneClick = (data: zod.infer<typeof oneClickSchema>) => {
    const payload = {
      ...data,
      bonusType: data.bonusType || defaultOneClickBonusValue,
    };

    startTransition(() => {
      oneClickRegister(payload).then((res) => {
        if (res.success) {
          SweetToast.fire({
            icon: "success",
            title: "Account created",
            html: `Your player ID: <b>${res.playerId}</b><br/>Your password: <b>${res.generatedPassword}</b><br/>Save this now — it won't be shown again.`,
            showConfirmButton: true,
          }).then(() => redirect("/login"));
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

  return (
    <div className="w-full md:w-[400px] md:mx-auto h-screen ">
      <div className="grid grid-cols-2 gap-3 mb-2">
        <button
          type="button"
          onClick={() => setTab("email")}
          className={`flex flex-col items-center gap-2 py-3 rounded-md ${
            tab === "email"
              ? "bg-[#2b2b2b] text-white "
              : "bg-white text-[#3b3b3b] shadow-sm"
          }`}
        >
          <Mail className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setTab("oneclick")}
          className={`flex flex-col items-center gap-2 py-3 rounded-md ${
            tab === "oneclick"
              ? "bg-[#2b2b2b] text-white"
              : "bg-white text-[#3b3b3b] shadow-sm"
          }`}
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-2 text-center text-sm mb-6">
        <span className={"text-[#414141]"}>By e-mail</span>
        <span className={"text-[#414141]"}>One-click</span>
      </div>

      {tab === "email" ? (
        <>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3].map((n) => (
              <React.Fragment key={n}>
                <div
                  className={`w-3 h-3 rounded-full flex items-center justify-center text-xs ${
                    n < step
                      ? "bg-[#a02020] text-white"
                      : n === step
                        ? "border border-[#a02020]"
                        : "bg-[#d9d9d9]"
                  }`}
                >
                  {n < step ? "✓" : ""}
                </div>
                {n < 3 && (
                  <div
                    className={`w-16 h-[2px] ${n < step ? "bg-[#a02020]" : "bg-[#d9d9d9]"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-sm mb-6 text-black/90">
            Step {step} of 3
          </p>

          <div className=" bg-white p-3 rounded-md">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRegistration)}>
                {step === 1 && (
                  <>
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

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        className="flex-1 bg-[#bfbfbf] rounded-md py-2"
                        disabled
                      >
                        Back
                      </button>
                      <PrimaryButton
                        type="button"
                        onClick={goNext}
                        className="flex-1 text-white rounded-md py-2"
                      >
                        Next
                      </PrimaryButton>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <FormField
                      name="country"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <IconSelect
                              placeholder="Select country"
                              value={field.value}
                              onChange={(v) => {
                                field.onChange(v);
                                syncCurrencyToCountry(v, form.setValue);
                              }}
                              options={COUNTRIES.map((c) => ({
                                value: c.code,
                                label: c.name,
                                icon: (
                                  <span className="flex items-center justify-center w-full h-full bg-[#f0f0f0] text-base">
                                    {c.flag}
                                  </span>
                                ),
                              }))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={goBack}
                        className="flex-1 bg-[#bfbfbf] rounded-md py-2"
                      >
                        Back
                      </button>
                      <PrimaryButton
                        type="button"
                        onClick={goNext}
                        className="flex-1 text-white rounded-md py-2"
                      >
                        Next
                      </PrimaryButton>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <FormField
                      name="currencyCode"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <IconSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={true}
                              options={CURRENCIES.map((c) => ({
                                value: c.code,
                                label: c.code,
                                subLabel: `(${c.name})`,
                              }))}
                              placeholder="Select currency"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="my-3" />

                    <FormField
                      name="password"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center border border-border rounded-md">
                              <div className="relative flex-1">
                                <FloatingInput
                                  {...field}
                                  type={passwordType}
                                  disabled={pending}
                                  id="floating-password"
                                  className="border-none text-[#3b3b3b]"
                                />
                                <FloatingLabel
                                  htmlFor="floating-password"
                                  className="font-normal text-[#3b3b3b]"
                                >
                                  Password
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
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center border border-border rounded-md">
                              <div className="relative flex-1">
                                <FloatingInput
                                  {...field}
                                  type={confirmPasswordType}
                                  id="floating-confirm-password"
                                  className="border-none text-[#3b3b3b]"
                                  disabled={pending}
                                />
                                <FloatingLabel
                                  htmlFor="floating-confirm-password"
                                  className="font-normal text-[#3b3b3b]"
                                >
                                  Re-enter your password
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

                    <div className="my-3" />

                    <FormField
                      name="promo"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <FloatingInput
                                {...field}
                                type="text"
                                id="floating-promo"
                                disabled={pending}
                                className="text-[#3b3b3b] py-6 bg-white rounded-md"
                              />
                              <FloatingLabel
                                htmlFor="floating-promo"
                                className="font-normal text-[#3b3b3b]"
                              >
                                Promo code (if you have one)
                              </FloatingLabel>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="my-3" />

                    <FormField
                      name="bonusType"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <IconSelect
                              value={field.value ?? defaultBonusValue}
                              defaultValue={defaultBonusValue}
                              onChange={(val) => {
                                const selected =
                                  typeof val === "string"
                                    ? val
                                    : (val?.value ?? defaultBonusValue);
                                field.onChange(selected);
                              }}
                              disabled={pending}
                              options={bonusOptions}
                              placeholder="Select bonus"
                            />
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
                          <FlipText
                            text="WinrxBet"
                            className="font-bold text-white"
                          />
                        ) : (
                          "Register"
                        )}
                      </PrimaryButton>
                      <button
                        type="button"
                        onClick={goBack}
                        disabled={pending}
                        className="w-full bg-[#bfbfbf] rounded-md py-2 mt-3"
                      >
                        Back
                      </button>
                    </div>

                    <p className="text-xs text-center text-[#3b3b3b] mt-5">
                      By pressing the &quot;Register&quot; button, you confirm
                      that you have read and agree to the company&apos;s{" "}
                      <Link href="/terms" className="underline">
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="underline">
                        Privacy Policy
                      </Link>{" "}
                      and that you are of legal age.
                    </p>
                  </>
                )}
              </form>
            </Form>
          </div>
        </>
      ) : (
        <div className="bg-white p-3 rounded-md">
          <Form {...oneClickForm}>
            <form onSubmit={oneClickForm.handleSubmit(handleOneClick)}>
              <FormField
                name="country"
                control={oneClickForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <IconSelect
                        placeholder="Select country"
                        value={field.value}
                        onChange={(v) => {
                          field.onChange(v);
                          syncCurrencyToCountry(v, oneClickForm.setValue);
                        }}
                        options={COUNTRIES.map((c) => ({
                          value: c.code,
                          label: c.name,
                          icon: (
                            <span className="flex items-center justify-center w-full h-full bg-[#f0f0f0] text-base">
                              {c.flag}
                            </span>
                          ),
                        }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="my-3" />

              <FormField
                name="currencyCode"
                control={oneClickForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <IconSelect
                        value={field.value}
                        onChange={field.onChange}
                        disabled={true}
                        options={CURRENCIES.map((c) => ({
                          value: c.code,
                          label: c.code,
                          subLabel: `(${c.name})`,
                        }))}
                        placeholder="Select currency"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="my-3" />

              <FormField
                name="promo"
                control={oneClickForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <FloatingInput
                          {...field}
                          type="text"
                          id="floating-oneclick-promo"
                          disabled={pending}
                          className="text-[#3b3b3b] py-6 bg-white rounded-md"
                        />
                        <FloatingLabel
                          htmlFor="floating-oneclick-promo"
                          className="font-normal text-[#3b3b3b]"
                        >
                          Promo code (if you have one)
                        </FloatingLabel>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="my-3" />

              <FormField
                name="bonusType"
                control={oneClickForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <IconSelect
                        value={field.value ?? defaultOneClickBonusValue}
                        defaultValue={defaultOneClickBonusValue}
                        onChange={(val) => {
                          const selected =
                            typeof val === "string"
                              ? val
                              : (val?.value ?? defaultOneClickBonusValue);
                          field.onChange(selected);
                        }}
                        disabled={pending}
                        options={oneClickBonusOptions}
                        placeholder="Select bonus"
                      />
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
                    <FlipText
                      text="WinrxBet"
                      className="font-bold text-white"
                    />
                  ) : (
                    "Register"
                  )}
                </PrimaryButton>
              </div>

              <p className="text-xs text-center text-[#3b3b3b] mt-5">
                By pressing the &quot;Register&quot; button, you confirm that
                you have read and agree to the company&apos;s{" "}
                <Link href="/terms" className="underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline">
                  Privacy Policy
                </Link>{" "}
                and that you are of legal age.
              </p>
            </form>
          </Form>
        </div>
      )}

      <div className="my-5 flex justify-center">
        <div className="w-full md:w-[300px] bg-border h-[1px]"></div>
      </div>
      <p className="text-xs text-center text-[#3b3b3b]">
        Already have an account?{" "}
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

export default RegistationForm;
