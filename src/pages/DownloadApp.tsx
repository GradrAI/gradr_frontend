const APK_URL = "https://storage.googleapis.com/gradr-421618-app-downloads/android/gradrai-latest.apk";

const DownloadApp = () => {
  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Get the GradrAI app</h1>
      <p className="mb-6">
        Practise JAMB UTME and Common Entrance (NCEE) past questions on your Android phone, even without internet.
        Sign in with the same account you use on gradrai.com: practice on your phone shows up in SmartPrep on the
        web, and your web practice shows up in the app.
      </p>
      <a href={APK_URL} className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg">
        Download for Android (APK)
      </a>
      <p className="mt-2 text-sm">About 37 MB. Requires Android 7.0 or newer.</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">How to install</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Tap &quot;Download for Android (APK)&quot; on your phone.</li>
          <li>Open the downloaded file. If Android asks, allow your browser to install unknown apps, then tap Install.</li>
          <li>
            If Google Play Protect says it doesn&apos;t recognise the app, tap &quot;More details&quot;, then &quot;Install
            anyway&quot;.
          </li>
          <li>Open GradrAI and sign in, or create a free student account.</li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Google Play</h2>
        <p>
          GradrAI is coming to Google Play. If you install it from Google Play later, uninstall this version first.
          Practice that has synced stays in your GradrAI account.
        </p>
      </section>

      <p className="mt-8 text-sm">
        <a className="underline" href="/privacy-policy">
          Privacy Policy
        </a>{" "}
        ·{" "}
        <a className="underline" href="/delete-account">
          Delete your account
        </a>
      </p>
    </div>
  );
};

export default DownloadApp;
