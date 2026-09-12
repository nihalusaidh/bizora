export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ slug: "placeholder" }];
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
