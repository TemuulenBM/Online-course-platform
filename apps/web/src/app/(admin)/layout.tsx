export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>{/* Admin navigation will be added here */}</nav>
      <main>{children}</main>
    </div>
  );
}
