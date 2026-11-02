const SUPPORT_EMAIL = "contact@gradrai.com";
const MAIL_SUBJECT = "Delete my GradrAI account";
const MAIL_BODY = "Please delete my GradrAI account and its data.\n\nAccount email:\nUsername:\n";
const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(MAIL_BODY)}`;

const DeleteAccount = () => {
  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Delete your GradrAI account</h1>
      <p className="mb-6">
        This page explains how to delete your GradrAI account and the data linked to it. It applies to accounts
        used on gradrai.com and in the GradrAI mobile app (developer: GradrAI).
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">How to request deletion</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            Email <a className="text-blue-600 underline" href={MAILTO}>{SUPPORT_EMAIL}</a> from the email address
            on your GradrAI account, with the subject &quot;{MAIL_SUBJECT}&quot;.
          </li>
          <li>
            Include your username. If you can no longer use that email address, say so and we will verify your
            identity another way.
          </li>
          <li>We confirm your request by email and delete your account within 30 days.</li>
        </ol>
        <a href={MAILTO} className="inline-block mt-4 bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg">
          Email a deletion request
        </a>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">What we delete</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your profile: name, username, email address and password.</li>
          <li>Your SmartPrep practice sessions, answers and scores, including practice synced from the mobile app.</li>
          <li>Files you uploaded to your own account.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">What we may keep</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Exam results and records that belong to a school or organisation you were linked to may be kept by that
            organisation as part of its academic records.
          </li>
          <li>Records we must keep for legal, security or fraud-prevention reasons, for no longer than required.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Data on your phone</h2>
        <p>
          The GradrAI mobile app keeps downloaded questions and your practice history on your device. Uninstalling the
          app removes this data from your phone.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Parents and guardians</h2>
        <p>
          You can request deletion of your child&apos;s account the same way. Tell us the child&apos;s username and the
          email address on the account.
        </p>
      </section>

      <p className="mt-8 text-sm">
        See also our{" "}
        <a className="underline" href="/privacy-policy">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};

export default DeleteAccount;
