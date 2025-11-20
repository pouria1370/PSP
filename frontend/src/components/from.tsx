import apiClient from "@/configes/axios.js";
import { useForm, SubmitHandler } from "react-hook-form";

type PaymentFormInputs = {
  name: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
};

export default function PaymentForm() {
  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm<PaymentFormInputs>();

  const onSubmit: SubmitHandler<PaymentFormInputs> = async (data) => {
    console.log("Payment Request:", data);

    // Example: send to payment API
    // const res = await api.post("/payments", data) ;
    try {
      const res = await apiClient.post("merchant/create", {
        name: "pouria",
        apiKey: 123456,
        isActive: true,
        id: 15472222,
      });
      alert("Payment submitted!");
    } catch (error) {
      alert("Payment failed!");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md space-y-4 p-4 rounded-xl shadow bg-white"
    >
      <h2 className="text-xl font-semibold">Payment Details</h2>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium">Full Name</label>
        <input
          className="w-full border p-2 rounded"
          {...register("name", { required: "Name is required" })}
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="text-red-600 text-sm">{errors.name.message}</p>
        )}
      </div>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium">Card Number</label>
        <input
          className="w-full border p-2 rounded"
          {...register("cardNumber", {
            required: "Card number is required",
            pattern: {
              value: /^[0-9]{16}$/,
              message: "Card number must be 16 digits",
            },
          })}
          maxLength={16}
          placeholder="1234 5678 9012 3456"
        />
        {errors.cardNumber && (
          <p className="text-red-600 text-sm">{errors.cardNumber.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        {/* Expiry Date */}
        <div className="flex-1">
          <label className="block text-sm font-medium">Expiry (MM/YY)</label>
          <input
            className="w-full border p-2 rounded"
            {...register("expiry", {
              required: "Expiry date is required",
              pattern: {
                value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                message: "Invalid expiry format",
              },
            })}
            placeholder="08/27"
          />
          {errors.expiry && (
            <p className="text-red-600 text-sm">{errors.expiry.message}</p>
          )}
        </div>

        {/* CVV */}
        <div className="flex-1">
          <label className="block text-sm font-medium">CVV</label>
          <input
            className="w-full border p-2 rounded"
            {...register("cvv", {
              required: "CVV is required",
              pattern: {
                value: /^[0-9]{3,4}$/,
                message: "Invalid CVV",
              },
            })}
            maxLength={4}
            placeholder="123"
          />
          {errors.cvv && (
            <p className="text-red-600 text-sm">{errors.cvv.message}</p>
          )}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium">Amount ($)</label>
        <input
          type="number"
          className="w-full border p-2 rounded"
          {...register("amount", {
            required: "Amount is required",
            min: { value: 1, message: "Minimum amount is $1" },
          })}
          placeholder="50"
        />
        {errors.amount && (
          <p className="text-red-600 text-sm">{errors.amount.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        {isSubmitting ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}
