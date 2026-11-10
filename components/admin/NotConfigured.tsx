export function NotConfigured() {
  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <p className="kicker mb-4">Admin</p>
      <h1 className="text-4xl">Not configured</h1>
      <p className="mt-4 text-sm leading-relaxed text-steel-200">
        The members area needs STRIPE_SECRET_KEY, ADMIN_PASSWORD and ADMIN_SESSION_SECRET set
        in the environment.
      </p>
    </div>
  );
}
