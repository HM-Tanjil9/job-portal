"use client";

import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  Calendar,
  Clock,
  Receipt,
  ArrowRight,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";
import toast from "react-hot-toast";

function PaymentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tran_id = params.tran_id as string;

  const status = searchParams.get("status") || "failed";
  const amount = searchParams.get("amount") || "0";
  const days = searchParams.get("days") || "0";
  const expiry = searchParams.get("expiry");

  const isSuccess = status === "success";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  useEffect(() => {
    if (isSuccess) {
      toast.success("Subscription activated successfully!");
    } else {
      toast.error("Payment failed. Please try again.");
    }
  }, [isSuccess]);

  // Failed payment
  if (!isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="max-w-md w-full shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
              <XCircle size={40} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Payment Failed
            </h1>
            <p className="text-red-100">
              Something went wrong with your payment
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Receipt size={16} />
                  <span>Transaction ID:</span>
                </div>
                <span className="font-mono text-xs text-gray-800 break-all">
                  {tran_id}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center">
              No amount was charged. Please try again.
            </p>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
            <Link
              href="/subscribe"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Try Again
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/"
              className="block w-full border border-gray-300 text-gray-700 text-center py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Go to Home
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Successful payment
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="max-w-md w-full shadow-2xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-green-100">Your subscription is now active</p>
        </div>

        {/* Payment Details */}
        <div className="p-6 space-y-4">
          {/* Transaction ID */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Receipt size={16} />
                <span>Transaction ID:</span>
              </div>
              <span className="font-mono text-xs text-gray-800 break-all">
                {tran_id}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="text-2xl font-bold text-blue-600">
                {amount} BDT
              </span>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              Subscription Details
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>Duration:</span>
                </div>
                <span className="font-semibold">
                  {days} Day{parseInt(days) !== 1 ? "s" : ""}
                </span>
              </div>

              {expiry && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <span>Expires on:</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {formatDate(expiry)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
          <Link
            href="/account"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Go to Account
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/jobs"
            className="block w-full border border-gray-300 text-gray-700 text-center py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Browse Jobs
          </Link>
        </div>
      </Card>
    </div>
  );
}

// Loading fallback while Suspense resolves
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading payment details...</p>
      </div>
    </div>
  );
}

// Wrap with Suspense — required by Next.js for useSearchParams
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentContent />
    </Suspense>
  );
}
