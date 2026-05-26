"use client";

import { useI18n } from "@/app/components/i18n";

export default function SkipLink() {
  const { t } = useI18n();

  return (
    <a className="skip-link" href="#main-content">
      {t("a11y.skipToContent")}
    </a>
  );
}
