import RoleGuard from "../../components/shared/RoleGuard.jsx";

export default function DoctorLayout({
  children
}){

  return(

    <RoleGuard
      requiredRole="doctor"
    >

      {children}

    </RoleGuard>

  )

}