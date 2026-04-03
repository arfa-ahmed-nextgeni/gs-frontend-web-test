import { getStoresConfig } from "@/lib/actions/config/get-stores-config";
import { CountryCode, DOMAIN_TO_COUNTRY_CODE } from "@/lib/constants/i18n";

export async function getHostKeyFromRequest(
  reqHeadersHost: string,
  preferredLanguage: "ar" | "en" = "en"
): Promise<string> {
  const requestHosts = getComparableHosts(reqHeadersHost);
  const requestHostname = requestHosts[0];

  if (!requestHostname) return "";

  const storesConfigResult = await getStoresConfig();
  const storesPayload = storesConfigResult.data?.[0]?.stores;

  if (!storesPayload) {
    return "";
  }

  const stores = Object.values(storesPayload);

  const candidateByCheckoutHost = stores.filter((store) => {
    const storeHost = getHostnameFromUrl(store.checkout_url);
    if (!storeHost) return false;
    const storeHosts = getComparableHosts(storeHost);
    return storeHosts.some((host) => requestHosts.includes(host));
  });

  const countryCode = getCountryCodeFromDomain(requestHosts);
  const candidateByCountry = countryCode
    ? stores.filter((store) => store.country_code === countryCode)
    : [];

  const candidateStores =
    candidateByCheckoutHost.length > 0
      ? candidateByCheckoutHost
      : candidateByCountry;

  const preferred =
    candidateStores.find((store) =>
      store.storeview_code?.toLowerCase().startsWith(`${preferredLanguage}_`)
    ) || candidateStores[0];

  if (!preferred?.storeview_code) return "";

  return preferred.storeview_code.toLowerCase();
}

function getComparableHosts(hostHeader: string) {
  const host = hostHeader.trim().toLowerCase();
  if (!host) return [];

  const withoutPort = host.split(":")[0] || "";
  if (!withoutPort) return [];

  return Array.from(new Set([host, withoutPort]));
}

function getCountryCodeFromDomain(requestHosts: string[]) {
  const localhostHost = requestHosts.find((host) =>
    host.includes(".localhost")
  );
  if (localhostHost) {
    const subdomain = localhostHost.split(".")[0];
    const localMap: Record<string, CountryCode> = {
      ae: CountryCode.Emirates,
      bh: CountryCode.Bahrain,
      global: CountryCode.Global,
      iq: CountryCode.Iraq,
      kw: CountryCode.Kuwait,
      localhost: CountryCode.Saudi,
      om: CountryCode.Oman,
      sa: CountryCode.Saudi,
    };
    if (localMap[subdomain]) return localMap[subdomain];
  }

  const matchingDomain = Object.keys(DOMAIN_TO_COUNTRY_CODE).find((domain) => {
    const domainHosts = getComparableHosts(domain);
    return domainHosts.some((host) => requestHosts.includes(host));
  });

  if (!matchingDomain) return undefined;
  return DOMAIN_TO_COUNTRY_CODE[
    matchingDomain as keyof typeof DOMAIN_TO_COUNTRY_CODE
  ];
}

function getHostnameFromUrl(url: string) {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return "";
  }
}
