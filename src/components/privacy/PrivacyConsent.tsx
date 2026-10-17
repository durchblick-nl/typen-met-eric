'use client';

import { t } from '@/lib/i18n';
import { BASE_PATH, IS_GERMAN } from '@/lib/course';
import { useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';

type OpenPanelCall = [method: string, ...args: unknown[]];
type OpenPanelCommand = ((...args: OpenPanelCall) => void) & { q?: OpenPanelCall[] };

interface OpenPanelEvent {
  type: string;
  payload: {
    name?: string;
    properties?: Record<string, unknown>;
    profileId?: string;
    groups?: string[];
  };
}

declare global {
  interface Window {
    op?: OpenPanelCommand;
  }
}

let consentInitialized = false;
let analyticsStarted = false;
let analyticsAllowed = false;

// Only known page paths are useful for statistics. Never transmit query strings,
// fragments, typed text, certificate names, referrers or arbitrary event data.
function filterPageView(event: OpenPanelEvent): boolean {
  if (!analyticsAllowed || !CookieConsent.acceptedCategory('analytics') ||
    event.type !== 'track' || event.payload.name !== 'screen_view') {
    return false;
  }

  const path = window.location.pathname;
  const localPath = BASE_PATH && path.startsWith(BASE_PATH + '/') ? path.slice(BASE_PATH.length) : path;
  if (!/^\/(?:kaart|oefenen|over|impressum|privacy|diploma|les\/(?:[0-9]|1[0-9]|2[0-5])|regio\/(?:grot|dorp|velden|woud|toppen|zee|kasteel))?\/?$/.test(localPath)) {
    return false;
  }

  event.payload.properties = {
    __path: `${window.location.origin}${path}`,
    __title: 'Lettoria',
  };
  delete event.payload.profileId;
  delete event.payload.groups;
  return true;
}

function startAnalytics() {
  analyticsAllowed = true;
  if (analyticsStarted) return;
  analyticsStarted = true;

  const queue: OpenPanelCall[] = [];
  const command: OpenPanelCommand = (...args) => { queue.push(args); };
  command.q = queue;
  window.op = command;
  window.op('init', {
    apiUrl: 'https://opapi.treehouse.ch',
    clientId: '66f833a3-2166-4bd3-acf5-80c5e31026bb',
    trackScreenViews: true,
    trackOutgoingLinks: false,
    trackAttributes: false,
    sessionReplay: { enabled: false },
    filter: filterPageView,
  });

  const script = document.createElement('script');
  script.src = 'https://openpanel.dev/op1.js';
  script.async = true;
  script.referrerPolicy = 'no-referrer';
  script.onerror = () => {
    analyticsStarted = false;
    delete window.op;
    script.remove();
  };
  document.head.appendChild(script);
}

export function PrivacyConsent() {
  useEffect(() => {
    if (consentInitialized) return;
    consentInitialized = true;

    void CookieConsent.run({
      // Match roger.tips: optional analytics starts after consent, not on arrival.
      mode: 'opt-in',
      revision: 1,
      cookie: { name: 'lettoria_consent', expiresAfterDays: 180, sameSite: 'Lax' },
      guiOptions: {
        consentModal: { layout: 'box inline', position: 'bottom center', equalWeightButtons: true },
        preferencesModal: { layout: 'box', equalWeightButtons: true },
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: {},
      },
      onModalReady: ({ modal }) => {
        // Keep modal typing/navigation out of the trainer's window shortcuts.
        // CookieConsent's capture listeners still handle Tab and Escape.
        modal.addEventListener('keydown', (event) => event.stopPropagation());
      },
      language: {
        default: IS_GERMAN ? 'de' : 'nl',
        translations: {
          [IS_GERMAN ? 'de' : 'nl']: {
            consentModal: {
              title: t("Jij kiest wat we meten."),
              description: (IS_GERMAN ? 'Mit deiner Zustimmung zählt OpenPanel Seitenaufrufe, damit wir Lettoria verbessern können. Getippter Text, Fortschritt und Name bleiben auf deinem Gerät. Auch ohne Analyse kannst du alles nutzen.' : 'Met jouw toestemming telt OpenPanel paginaweergaven om Lettoria te verbeteren. Je getypte tekst, voortgang en naam blijven op je apparaat. Ook zonder analyse kun je alles gebruiken.') + ` <a href="${BASE_PATH}/privacy" class="cc__link">${t('Privacy & cookies')}</a>`,
              acceptAllBtn: t("Analyse toestaan"),
              acceptNecessaryBtn: t("Alleen noodzakelijk"),
              showPreferencesBtn: t("Instellingen"),
            },
            preferencesModal: {
              title: t("Jouw privacyinstellingen"),
              acceptAllBtn: t("Analyse toestaan"),
              acceptNecessaryBtn: t("Alleen noodzakelijk"),
              savePreferencesBtn: t("Keuze opslaan"),
              closeIconLabel: t("Sluiten"),
              sections: [
                {
                  title: t("Noodzakelijke functies"),
                  description: t("Onthouden je privacykeuze en bewaren je lesvoortgang, oefencijfers, spelrecords, grotversiering en weergave- en geluidsinstellingen op dit apparaat. Altijd actief."),
                  linkedCategory: 'necessary',
                },
                {
                  title: t("Gebruiksanalyse"),
                  description: t("OpenPanel telt paginaweergaven, alleen met jouw toestemming. Geen opname van je scherm, geen getypte tekst en geen naam op je diploma. Uitschakelen herlaadt de pagina; lesvoortgang en spelrecords blijven bewaard, een lopende oefening begint opnieuw."),
                  linkedCategory: 'analytics',
                },
                {
                  title: t("Meer informatie"),
                  description: `<a href="${BASE_PATH}/privacy" class="cc__link">${IS_GERMAN ? 'Datenschutzerklärung lesen' : 'Lees onze privacyverklaring'}</a>. ${IS_GERMAN ? 'Du kannst diese Einstellungen jederzeit über die Fußzeile öffnen.' : 'Je kunt deze instellingen altijd opnieuw openen via de footer.'}`,
                },
              ],
            },
          },
        },
      },
      onConsent: () => {
        if (CookieConsent.acceptedCategory('analytics')) startAnalytics();
      },
      onChange: ({ changedCategories }) => {
        if (!changedCategories.includes('analytics')) return;
        if (CookieConsent.acceptedCategory('analytics')) {
          startAnalytics();
        } else {
          // Block new events immediately, then unload all running SDK listeners.
          // Consent is already saved; lesson and game persistence is untouched.
          analyticsAllowed = false;
          if (analyticsStarted) window.location.reload();
        }
      },
    });
  }, []);

  return null;
}

export function PrivacySettingsButton({ className, children = t("Privacyinstellingen") }: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={() => CookieConsent.showPreferences()}>
      {children}
    </button>
  );
}
