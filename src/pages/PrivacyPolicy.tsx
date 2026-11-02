const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p>
        <span className="font-semibold">Effective Date:</span> 2nd November, 2026
      </p>
      <div>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            GradrAI ("we," "our," or "us") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, store,
            and share your information, including data obtained through Google
            services when you sign in with your Google account. By using our
            application, you agree to the terms outlined in this Privacy Policy.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            2. Information We Collect
          </h2>
          <ul className="list-disc pl-6">
            <li>Your name</li>
            <li>Email address</li>
            <li>Username and password (stored as a secure hash)</li>
            <li>
              SmartPrep practice activity: the questions you answer, your
              answers, scores and time spent
            </li>
            <li>Profile picture (if available)</li>
          </ul>
          <p className="mt-2">
            Additionally, users may upload documents such as:
          </p>
          <ul className="list-disc pl-6">
            <li>Marking guides</li>
            <li>Exam questions</li>
            <li>Student answers</li>
          </ul>
          <p className="mt-2">
            These uploaded resources are stored securely in Google Cloud
            Buckets.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6">
            <li>
              To authenticate users and provide access to the application.
            </li>
            <li>To store and manage uploaded grading resources.</li>
            <li>
              To improve and enhance our services based on user interactions.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            4. Data Sharing and Disclosure
          </h2>
          <p>
            We do not sell, rent, or share your personal information with third
            parties, except in the following cases:
          </p>
          <ul className="list-disc pl-6">
            <li>When required by law or to comply with legal obligations.</li>
            <li>When necessary to protect our rights, users, or the public.</li>
            <li>With your explicit consent.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
          <p>
            We take appropriate security measures to protect your information
            from unauthorized access, disclosure, or alteration. User data is
            stored securely in Google Cloud Buckets with restricted access.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            6. User Control and Data Retention
          </h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6">
            <li>Request access to the personal data we store about you.</li>
            <li>Request deletion of your personal data.</li>
            <li>
              Revoke access to your Google account data via Google account
              settings.
            </li>
          </ul>
          <p className="mt-2">
            We retain user data for as long as necessary to provide our
            services. To delete your account and data, follow the steps at{" "}
            <a className="underline" href="/delete-account">
              gradrai.com/delete-account
            </a>{" "}
            or contact us at contact@gradrai.com.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">7. GradrAI Mobile App</h2>
          <ul className="list-disc pl-6">
            <li>
              The app stores the practice questions it downloads and your
              practice history on your device so you can practise offline.
            </li>
            <li>
              When you are signed in to a student account and online, completed
              practice sessions are uploaded to your GradrAI account so they
              appear in SmartPrep on the web.
            </li>
            <li>Your sign-in token is kept in your device&apos;s secure storage.</li>
            <li>
              The app does not show ads, does not use advertising identifiers
              and does not access your location, contacts, camera or
              microphone.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">8. Children&apos;s Privacy</h2>
          <p>
            GradrAI includes practice material for pupils preparing for the
            National Common Entrance Examination (NCEE), and many of our users
            are under 18. Children should use GradrAI with the permission of a
            parent or guardian; the mobile app asks users to confirm this
            before creating an account. We collect only the information needed
            to provide the service (listed in section 2), we do not sell it and
            we do not use it for advertising. Parents and guardians can request
            access to or deletion of their child&apos;s data by contacting
            contact@gradrai.com or following the steps at{" "}
            <a className="underline" href="/delete-account">
              gradrai.com/delete-account
            </a>
            .
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            9. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be reflected on this page with an updated effective date. We
            encourage you to review this policy periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Contact Information</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <p className="mt-2 font-semibold">GradrAI</p>
          <p>contact@gradrai.com</p>
          <p>https://gradrai.com</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
