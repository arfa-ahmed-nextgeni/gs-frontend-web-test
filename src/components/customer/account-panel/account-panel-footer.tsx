import { useTranslations } from "next-intl";

export const AccountPanelFooter = () => {
  const t = useTranslations("AccountPage.footer");

  return (
    <div className="mb-7.5 mt-12.5 text-text-placeholder mx-auto w-[70vw] text-center text-sm font-medium lg:hidden">
      <p>
        © {new Date().getFullYear()} {t("copyright")}
      </p>
      <p>{t("legal")}</p>
    </div>
  );
};
