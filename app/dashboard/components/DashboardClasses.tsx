"use client";

import type { OwnedClass, CenterClass, CenterData } from "./DashboardTypes";

type TutorProps = {
  mode: "tutor";
  classes: OwnedClass[];
  deleteClass: (formData: FormData) => Promise<void>;
  centerData?: undefined;
  isMobile: boolean;
};

type CenterProps = {
  mode: "center";
  classes: CenterClass[];
  centerData: CenterData;
  deleteClass?: undefined;
  isMobile: boolean;
};

type Props = TutorProps | CenterProps;

export default function DashboardClasses(_props: Props) {
  return null;
}
