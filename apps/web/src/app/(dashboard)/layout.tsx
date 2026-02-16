export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>{/* Dashboard navigation will be added here */}</nav>
      <main>{children}</main>
    </div>
  );
}
