import ProductForm from "@/components/admin/ProductForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "New Product · Admin" };

export default function NewProductPage() {
  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold text-white">
        Create a new product
      </h2>
      <ProductForm />
    </div>
  );
}
