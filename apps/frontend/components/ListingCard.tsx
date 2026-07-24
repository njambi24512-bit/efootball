export default function ListingCard({ title, price }: { title: string; price: number }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">${price.toFixed(2)}</p>
    </div>
  );
}
