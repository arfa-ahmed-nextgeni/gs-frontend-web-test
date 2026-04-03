import Script from "next/script";

const NR_ENABLED = process.env.NEXT_PUBLIC_NEW_RELIC_ENABLED === "true";

export function NewRelicBrowserAgent() {
  if (!NR_ENABLED) return null;

  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: `;window.NREUM||(NREUM={});NREUM.init={session_replay:{enabled:true,block_selector:'',mask_text_selector:'*',sampling_rate:10.0,error_sampling_rate:100.0,mask_all_inputs:true,collect_fonts:true,inline_images:false,inline_stylesheet:true,fix_stylesheets:true,preload:false,mask_input_options:{}},distributed_tracing:{enabled:true},performance:{capture_measures:true},browser_consent_mode:{enabled:false},privacy:{cookies_enabled:true},ajax:{deny_list:["bam.nr-data.net"],capture_payloads:'none'}};
NREUM.loader_config={accountID:"6358401",trustKey:"6358401",agentID:"1103488140",licenseKey:"NRJS-0434ba33c29501de0e5",applicationID:"1103488140"};
NREUM.info={beacon:"bam.nr-data.net",errorBeacon:"bam.nr-data.net",licenseKey:"NRJS-0434ba33c29501de0e5",applicationID:"1103488140",sa:1};`,
        }}
        id="nr-config"
        strategy="afterInteractive"
      />
      <Script
        id="nr-loader"
        src="/scripts/nr-loader-spa-1.310.1.min.js"
        strategy="afterInteractive"
      />
    </>
  );
}
