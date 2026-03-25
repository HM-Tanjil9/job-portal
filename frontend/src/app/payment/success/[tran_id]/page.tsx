// import { Card } from "@/components/ui/card";
// import { CheckCircle } from "lucide-react";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import React from "react";

// const PaymentVerification = () => {
//   const { id } = useParams();
//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-secondary/30">
//       <Card className="max-w-md w-full p-8 text-center shadow-lg border-2">
//         <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 mb-4">
//           <CheckCircle size={40} />
//         </div>
//         <h1 className="text-3xl font-bold mb-2">Payment successful!</h1>
//         <p className="text-base opacity-70 mb-8">
//           Your subscription is now active. Your transaction id is {id}
//         </p>
//         <Link href={"/account"}>Go to account page</Link>
//       </Card>
//     </div>
//   );
// };

// export default PaymentVerification;

"use client";

import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  Calendar,
  Clock,
  CreditCard,
  Receipt,
  Banknote,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

// Update this with your actual payment service URL
const PAYMENT_SERVICE_URL =
  process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "http://localhost:5004";

interface PaymentDetails {
  transaction_id: string;
  val_id: string;
  amount: number;
  subscription_days: number;
  expiry_date: string;
  status: string;
  card_type: string;
  bank_tran_id: string;
  tran_date: string;
  user: {
    id: number;
    name: string;
    email: string;
    subscription_expiry: string;
  };
}

const PaymentSuccessPage = () => {
  const params = useParams();
  const router = useRouter();
  const tran_id = params.tran_id as string;

  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!tran_id) {
        setError("No transaction ID found");
        setLoading(false);
        return;
      }

      console.log("🔍 Fetching payment details for:", tran_id);

      try {
        const token = Cookies.get("token");

        if (!token) {
          setError("Please login to view payment details");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
          return;
        }

        // Fetch payment details from your backend
        const response = await axios.get(
          `${PAYMENT_SERVICE_URL}/api/payment/transaction/${tran_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("📦 Payment details response:", response.data);

        if (response.data.success) {
          setPaymentDetails(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch payment details");
        }
      } catch (error: any) {
        console.error("❌ Error fetching payment:", error);
        setError(
          error.response?.data?.message || "Failed to fetch payment details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [tran_id, router]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
          <p className="text-sm text-gray-400 mt-2 font-mono">{tran_id}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">
            Unable to Load Payment Details
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6 font-mono break-all">
            {tran_id}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
            <Link
              href="/account"
              className="block w-full border border-gray-300 text-gray-700 text-center py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Go to Account
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <p className="text-gray-600">No payment details found</p>
          <Link
            href="/account"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Go to Account
          </Link>
        </Card>
      </div>
    );
  }

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
                {paymentDetails.transaction_id}
              </span>
            </div>
          </div>

          {/* Val ID - This is what you wanted! */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-blue-700">
                <Banknote size={16} />
                <span className="font-semibold">Validation ID (val_id):</span>
              </div>
              <span className="font-mono text-xs text-blue-800 font-semibold break-all">
                {paymentDetails.val_id}
              </span>
            </div>
          </div>

          {/* Bank Transaction ID */}
          {paymentDetails.bank_tran_id &&
            paymentDetails.bank_tran_id !== "N/A" && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CreditCard size={16} />
                    <span>Bank Transaction ID:</span>
                  </div>
                  <span className="font-mono text-xs text-gray-800 break-all">
                    {paymentDetails.bank_tran_id}
                  </span>
                </div>
              </div>
            )}

          {/* Amount */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="text-2xl font-bold text-blue-600">
                {paymentDetails.amount} BDT
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
                  {paymentDetails.subscription_days} Day
                  {paymentDetails.subscription_days !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span>Expires on:</span>
                </div>
                <span className="font-semibold text-blue-600">
                  {formatShortDate(paymentDetails.expiry_date)}
                </span>
              </div>

              {paymentDetails.card_type &&
                paymentDetails.card_type !== "N/A" && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard size={16} />
                      <span>Payment Method:</span>
                    </div>
                    <span className="text-sm">{paymentDetails.card_type}</span>
                  </div>
                )}

              {paymentDetails.tran_date && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <span>Payment Date:</span>
                  </div>
                  <span className="text-sm">
                    {formatShortDate(paymentDetails.tran_date)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              Account Information
            </h3>
            <p className="text-sm text-gray-600">{paymentDetails.user.name}</p>
            <p className="text-sm text-gray-500">{paymentDetails.user.email}</p>
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
};

export default PaymentSuccessPage;
