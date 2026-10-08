'use client';

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
  if (!/^\/(?:kaart|oefenen|over|impressum|privacy|diploma|les\/(?:[0-9]|1[0-9]|2[0-5])|regio\/(?:grot|dorp|velden|woud|toppen|zee|kasteel))?\/?$/.test(path)) {
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
        default: 'nl',
        translations: {
          nl: {
            consentModal: {
              title: 'Jij kiest wat we meten.',
              description: 'Met jouw toestemming telt OpenPanel welke pagina’s worden bezocht, zodat we Lettoria kunnen verbeteren. Je getypte tekst, voortgang en naam blijven op je apparaat. Ook zonder analyse kun je alles gebruiken. <a href="/privacy" class="cc__link">Privacy & cookies</a>',
              acceptAllBtn: 'Analyse toestaan',
              acceptNecessaryBtn: 'Alleen noodzakelijk',
              showPreferencesBtn: 'Instellingen',
            },
            preferencesModal: {
              title: 'Jouw privacyinstellingen',
              acceptAllBtn: 'Analyse toestaan',
              acceptNecessaryBtn: 'Alleen noodzakelijk',
              savePreferencesBtn: 'Keuze opslaan',
              closeIconLabel: 'Sluiten',
              sections: [
                {
                  title: 'Noodzakelijke functies',
                  description: 'Onthouden je privacykeuze en bewaren je lesvoortgang, oefencijfers, spelrecords, grotversiering en weergave- en geluidsinstellingen op dit apparaat. Altijd actief.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Gebruiksanalyse',
                  description: 'OpenPanel telt paginaweergaven, alleen met jouw toestemming. Geen opname van je scherm, geen getypte tekst en geen naam op je diploma. Uitschakelen herlaadt de pagina; lesvoortgang en spelrecords blijven bewaard, een lopende oefening begint opnieuw.',
                  linkedCategory: 'analytics',
                },
                {
                  title: 'Meer informatie',
                  description: '<a href="/privacy" class="cc__link">Lees onze privacyverklaring</a>. Je kunt deze instellingen altijd opnieuw openen via de footer.',
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

export function PrivacySettingsButton({ className, children = 'Privacyinstellingen' }: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={() => CookieConsent.showPreferences()}>
      {children}
    </button>
  );
}
