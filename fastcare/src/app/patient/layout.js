import RoleGuard from "../../components/shared/RoleGuard.jsx";

export default function PatientLayout({ children }) {
  return (
    <RoleGuard requiredRole="patient">
      {children}
    </RoleGuard>
  );
}