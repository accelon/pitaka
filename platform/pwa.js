let deferredPrompt;
/*
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt')
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  // showInstallPromotion();
  // Optionally, send analytics event that PWA install promo was shown.
  console.log(`'beforeinstallprompt' event was fired.`);
});

export async  function installPWA(){
  // Hide the app provided install promotion
//   hideInstallPromotion();
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  // Optionally, send analytics event with outcome of user choice
  console.log(`User response to the install prompt: ${outcome}`);
  // We've used the prompt, and can't use it again, throw it away
  deferredPrompt = null;
};
*/
// window.addEventListener('appinstalled', () => {
    // Hide the app-provided install promotion
    // hideInstallPromotion();
    // Clear the deferredPrompt so it can be garbage collected
    // deferredPrompt = null;
    // Optionally, send analytics event to indicate successful install
    // console.log('PWA was installed');
  // });

export function getPWADisplayMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (document.referrer.startsWith('android-app://')) {
      return 'twa';
    } else if (navigator.standalone || isStandalone) {
      return 'standalone';
    }
    return 'browser';
}
export function registerServiceWorker(swfn="./sw.js"){
  const p=document.location.protocol;
  const h=document.location.hostname;
  const localhost= p=='http:' && (h=='127.0.0.1' || h=='localhost');
  if ("serviceWorker" in navigator && (localhost||p=='https:') ) {
    navigator.serviceWorker.register(swfn);
  }
}
