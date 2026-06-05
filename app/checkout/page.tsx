import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string; id?: string }>;
}) {
  const params = await searchParams;
  const id = params.id || "";
  const type = params.type === "product" ? "product" : "service";
  if (!id) notFound();

  if (type === "product") {
    const product = await prisma.brandProduct.findUnique({
      where: { id },
      include: { brandProfile: true }
    });
    if (!product || product.status !== "APPROVED") notFound();
    return (
      <main className="page">
        <section className="section legal-page">
          <CheckoutForm
            type="product"
            id={product.id}
            title={`${product.name} · ${product.brandProfile.businessName}`}
            amount={Number(product.price)}
            stock={product.stock}
          />
        </section>
      </main>
    );
  }

  const service = await prisma.service.findUnique({
    where: { id },
    include: { category: true }
  });
  if (!service || service.status !== "APPROVED") notFound();
  return (
    <main className="page">
      <section className="section legal-page">
        <CheckoutForm
          type="service"
          id={service.id}
          title={`${service.name} · ${service.category.name}`}
          amount={Number(service.price)}
        />
      </section>
    </main>
  );
}
