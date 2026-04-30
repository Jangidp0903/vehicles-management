import AdminShell from "@/components/AdminShell";
import { RoleProvider } from "@/lib/RoleContext";
import { NotificationProvider } from "@/lib/NotificationContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <NotificationProvider>
        <AdminShell>{children}</AdminShell>
      </NotificationProvider>
    </RoleProvider>
  );
}
