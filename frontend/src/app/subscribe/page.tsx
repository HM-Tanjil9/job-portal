"use client";

import useSslcommerz from "@/components/scriptLoader";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { payment_service } from "@/context/AppContext";
import Loading from "@/components/loading";

const SubscriptionPage = () => {
  const sslcommerzLoaded = useSslcommerz();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);
  const [error, setError] = useState("");

  const PRICE_PER_DAY = 10;
  const totalAmount = selectedDays * PRICE_PER_DAY;

  const plans = [
    { days: 1, price: 10, label: "1 Day" },
    { days: 7, price: 70, label: "7 Days" },
    { days: 30, price: 300, label: "30 Days" },
  ];

  const handleSubscribe = async () => {
    const token = Cookies.get("token");

    if (!token) {
      setError("Please login to continue");
      router.push("/login");
      return;
    }

    if (!sslcommerzLoaded) {
      setError("Payment gateway is loading. Please wait...");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare payment data
      const options = {
        days: selectedDays,
      };

      // Initiate payment with your backend
      const { data } = await axios.post(
        `${payment_service}/api/payment/checkout`,
        options,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Check if payment initiation was successful
      if (data.success && data.gatewayUrl) {
        // Open SSLCommerz popup
        if (window.SslCommerz) {
          window.SslCommerz({
            url: data.gatewayUrl,
            onSuccess: (response: any) => {
              console.log("Payment Success:", response);
              // Redirect to success page
              router.push(`/payment/success/${response.tran_id}?status=success`);
            },
            onFailure: (response: any) => {
              console.log("Payment Failed:", response);
              setError("Payment failed. Please try again.");
              setLoading(false);
            },
            onCancel: () => {
              console.log("Payment Cancelled");
              setError("Payment was cancelled");
              setLoading(false);
            },
            onClose: () => {
              setLoading(false);
            },
          });
        } else {
          // Fallback to redirect if popup not available
          window.location.href = data.gatewayUrl;
        }
      } else {
        setError(data.message || "Failed to initiate payment");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  // Show loading while SSLCommerz script loads
  if (!sslcommerzLoaded) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="mt-2 text-gray-600">
            Get premium access to all features
          </p>
        </div>

        {/* Price Display */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center relative">
            <div className="text-8xl font-bold text-blue-600 z-10">
              ৳ {totalAmount}
            </div>

            {/* <p className="text-gray-500 mt-1">
              for {selectedDays} day{selectedDays > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {PRICE_PER_DAY} BDT per day
            </p> */}
          </div>
        </div>

        {/* Plan Options */}
        <div className="space-y-3 mb-6">
          {plans.map((plan) => (
            <div
              key={plan.days}
              onClick={() => setSelectedDays(plan.days)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedDays === plan.days
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{plan.label}</h3>
                  <p className="text-sm text-gray-500">
                    {plan.days} day{plan.days > 1 ? "s" : ""} access
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">
                    {plan.price} BDT
                  </div>
                  <div className="text-xs text-gray-400">
                    {plan.price / plan.days} BDT/day
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Premium Features:
          </h3>
          <ul className="space-y-2">
            <li className="flex items-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Your application will shown first
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Priority support
            </li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            loading
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Pay ${totalAmount} BDT`
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Secure payment powered by SSLCommerz
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPage;
