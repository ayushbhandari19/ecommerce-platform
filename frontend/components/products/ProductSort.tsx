"use client";

import { useRouter } from "next/navigation";

type ProductSortProps = {
  category?: string;
  sort?: string;
};

export default function ProductSort({
  category,
  sort,
}: ProductSortProps) {
  const router = useRouter();

  function handleSort(value: string) {
    const params = new URLSearchParams();

    if (category) {
      params.set("category", category);
    }

    if (value) {
      params.set("sort", value);
    }

    router.push(
      `/products${params.toString() ? `?${params.toString()}` : ""}`
    );
  }

  return (
    <select
      value={sort ?? ""}
      onChange={(event) => handleSort(event.target.value)}
      className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600 outline-none transition hover:border-neutral-400 focus:border-black"
    >
      <option value="">Featured</option>
      <option value="price-asc">Price: Low → High</option>
      <option value="price-desc">Price: High → Low</option>
      <option value="name-asc">Name: A → Z</option>
    </select>
  );
}