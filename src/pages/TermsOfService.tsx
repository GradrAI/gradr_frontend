const TermsOfService = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">Terms of Service</h1>
      <p>
        <span className="font-semibold">Effective Date:</span> 28th March, 2025
      </p>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
        <p>
          By using GradrAI ("we," "our," or "us"), you agree to comply with and
          be bound by these Terms of Service. If you do not agree to these
          terms, please do not use our application.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          2. Description of Service
        </h2>
        <p>
          GradrAI is an online grading application that allows users to upload
          and manage grading resources, including documents such as marking
          guides, exam questions, and student answers.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          3. User Accounts and Responsibilities
        </h2>
        <ul className="list-disc pl-6">
          <li>You must be at least 13 years old to use this application.</li>
          <li>
            You are responsible for maintaining the confidentiality of your
            account and login credentials.
          </li>
          <li>
            You agree not to misuse the service, including engaging in
            unauthorized access or data scraping.
          </li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          4. Data Collection and Privacy
        </h2>
        <p>
          We collect and store user information as described in our
          <a href="/privacy-policy" className="text-blue-600 hover:underline">
            {" "}
            Privacy Policy
          </a>
          .
        </p>
        <p>
          We do not sell, rent, or share your personal data with third parties
          except as necessary to provide our services.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Content Ownership</h2>
        <p>
          Users retain ownership of any content they upload to the application.
        </p>
        <p>
          By uploading content, you grant us a license to store and display it
          within the app for the intended purpose of grading.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">6. Prohibited Activities</h2>
        <ul className="list-disc pl-6">
          <li>Violate any applicable laws.</li>
          <li>Attempt to hack, disrupt, or interfere with the service.</li>
          <li>Upload harmful, illegal, or offensive content.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">7. Service Availability</h2>
        <p>
          We strive to maintain uptime but do not guarantee uninterrupted access
          to our services. We may update or discontinue parts of the service
          without prior notice.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          8. Limitation of Liability
        </h2>
        <p>
          We are not liable for any indirect, incidental, or consequential
          damages resulting from your use of our service. Your use of GradrAI is
          at your own risk.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          9. Modifications to Terms
        </h2>
        <p>
          We may update these Terms of Service at any time. Continued use of the
          application after changes means you accept the revised terms.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">10. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact
          us at:
        </p>
        <p className="mt-2 font-semibold">GradrAI</p>
        <p>contact@gradrai.com</p>
        <p>https://gradrai.com</p>
      </section>
    </div>
  );
};

export default TermsOfService;
