export type DashboardRole = "STUDENT" | "TUTOR" | "CENTER_ADMIN" | string;

export type ManagedBooking = {
  id: string;
  status: string;
  paymentStatus: string;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  amountEgp: number | null;
  paidAt: string | null;
  notes: string | null;
};

export type StudentBooking = {
  id: string;
  classId: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  class: {
    title: string;
    subject: string;
    priceEgp: number;
    schedule: string | null;
    location: string | null;
  };
};

export type OwnedClass = {
  id: string;
  title: string;
  subject: string;
  format: string;
  paymentType: string;
  priceEgp: number;
  capacity: number | null;
  gradeLevel: string | null;
  schedule: string | null;
  bookingsCount: number;
  bookings: ManagedBooking[];
};

export type CenterClass = OwnedClass & {
  ownerName: string | null;
};

export type CenterData = {
  id: string;
  name: string;
  city: string | null;
  location: string | null;
  description: string | null;
  tutors: Array<{
    id: string;
    fullName: string | null;
    name: string | null;
    email: string | null;
    subjects: string[];
    phone: string | null;
    classCount: number;
  }>;
  classes: CenterClass[];
};

export type DashData = {
  user: {
    id: string;
    role: DashboardRole;
    fullName: string | null;
    name: string | null;
    email: string | null;
    bio: string | null;
    phone: string | null;
    subjects: string[];
    centerId: string | null;
    centerName: string | null;
    isVerified?: boolean;
  };
  bookings: StudentBooking[];
  ownedClasses: OwnedClass[];
  centerData: CenterData | null;
};

export type DashboardStatsShape = {
  confirmedBookings: number;
  pendingBookings: number;
  totalBookings: number;
  totalRevenue: number;
  centerBookings: number;
  centerRevenue: number;
};
