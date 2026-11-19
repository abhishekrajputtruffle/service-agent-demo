/*
 * Demo Support Portal: embedded chat + "ask" bar.
 *
 * DEMO ONLY. DO NOT USE IN PRODUCTION.
 * The chat channel trusts the hidden pre-chat field `userId` to decide who the visitor is.
 * Here it is hard-coded to a dedicated sandbox test user, so EVERY visitor to this page
 * chats as that user and can create cases on their behalf in the sandbox.
 */
const CHAT_CONFIG = {
  orgId: '00Dhv00000056Cr',
  deploymentName: 'Demo_Support_Portal_Chat',
  siteUrl: 'https://netdocuments--prodcopy.sandbox.my.site.com/ESWDemoSupportP1793592803108',
  scrt2Url: 'https://netdocuments--prodcopy.sandbox.my.salesforce-scrt.com',
  // Sandbox test user (customer, no billing access). Demo only.
  demoUserId: '005hv000000oYcnAAE'
};

(function () {
  let ready = false;          // widget finished loading
  let greeted = false;        // agent's greeting arrived in the current conversation
  let pendingTerm = null;     // question waiting for the chat to open
  let giveUpTimer = null;

  const form = document.getElementById('askForm');
  const input = document.getElementById('askInput');
  const button = document.getElementById('askButton');
  const errorBox = document.getElementById('agentError');

  // ── Load the embedded messaging widget ──
  window.initEmbeddedMessaging = function () {
    try {
      embeddedservice_bootstrap.settings.language = 'en_US';
      embeddedservice_bootstrap.init(
        CHAT_CONFIG.orgId,
        CHAT_CONFIG.deploymentName,
        CHAT_CONFIG.siteUrl,
        { scrt2URL: CHAT_CONFIG.scrt2Url }
      );
    } catch (err) {
      console.error('[Demo Chat] init failed:', err);
      showError();
    }
  };
  const loader = document.createElement('script');
  loader.src = CHAT_CONFIG.siteUrl + '/assets/js/bootstrap.min.js';
  loader.onload = window.initEmbeddedMessaging;
  loader.onerror = function () { console.error('[Demo Chat] bootstrap script failed to load'); showError(); };
  document.body.appendChild(loader);

  // ── Widget ready: pass the demo user as the hidden pre-chat field ──
  window.addEventListener('onEmbeddedMessagingReady', function () {
    ready = true;
    clearTimeout(giveUpTimer);
    try {
      embeddedservice_bootstrap.prechatAPI.setHiddenPrechatFields({ userId: CHAT_CONFIG.demoUserId });
    } catch (err) {
      console.error('[Demo Chat] could not set hidden pre-chat fields:', err);
    }
    if (pendingTerm) proceed();
  });

  // ── Greeting arrived: send any question typed before the chat was open ──
  window.addEventListener('onEmbeddedMessagingFirstBotMessageSent', function () {
    greeted = true;
    if (pendingTerm) {
      const term = pendingTerm;
      pendingTerm = null;
      setTimeout(function () { sendNow(term); }, 300);
    } else {
      setBusy(false);
    }
  });

  // ── Conversation ended: the next question starts a new one ──
  function resetConversation() { greeted = false; pendingTerm = null; setBusy(false); }
  window.addEventListener('onEmbeddedMessagingConversationClosed', resetConversation);
  window.addEventListener('onEmbeddedMessagingSessionStatusUpdate', function (e) {
    if (e && e.detail && e.detail.status === 'Ended') resetConversation();
  });

  // ── Ask bar and example chips ──
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(input.value);
  });
  document.querySelectorAll('.hint').forEach(function (chip) {
    chip.addEventListener('click', function () { ask(chip.dataset.question); });
  });

  function ask(text) {
    const term = (text || '').trim();
    if (!term) return;
    errorBox.hidden = true;
    setBusy(true);
    pendingTerm = term;
    input.value = '';
    proceed();
  }

  function proceed() {
    if (!ready) {
      clearTimeout(giveUpTimer);
      giveUpTimer = setTimeout(function () {
        if (!ready) { pendingTerm = null; showError(); }
      }, 15000);
      return; // resumed by onEmbeddedMessagingReady
    }
    openChat();
    if (greeted && pendingTerm) {
      const term = pendingTerm;
      pendingTerm = null;
      sendNow(term);
    }
  }

  function openChat() {
    try {
      embeddedservice_bootstrap.utilAPI.launchChat(true).catch(function (err) {
        console.error('[Demo Chat] launchChat failed:', err);
        pendingTerm = null;
        showError();
      });
    } catch (err) {
      console.error('[Demo Chat] launchChat threw:', err);
      pendingTerm = null;
      showError();
    }
  }

  function sendNow(term) {
    try {
      embeddedservice_bootstrap.utilAPI.sendTextMessage(term);
    } catch (err) {
      console.error('[Demo Chat] sendTextMessage failed:', err);
    }
    setBusy(false);
  }

  function setBusy(busy) { button.disabled = busy; }

  function showError() {
    setBusy(false);
    errorBox.hidden = false;
  }
})();
