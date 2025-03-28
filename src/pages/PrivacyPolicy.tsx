const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p>
        <span className="font-semibold">Effective Date:</span> 28th March, 2025
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
            services. If you wish to delete your data, please contact us at
            contact@gradrai.com.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            7. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be reflected on this page with an updated effective date. We
            encourage you to review this policy periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Contact Information</h2>
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
