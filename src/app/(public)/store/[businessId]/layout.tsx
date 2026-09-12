export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ businessId: "placeholder" }];
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
