import { useState } from 'react';

const LogoImage = ({ src, alt, fallbackText, className }: { src: string; alt: string; fallbackText: string; className: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return fallbackText ? <span className="text-xl md:text-2xl font-bold">{fallbackText}</span> : null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

const partners = [
  {
    name: "Google for Startups",
    logoUrl: "https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg",
    label: "for Startups",
    href: "https://startup.google.com/",
    fallback: "Google",
  },
  {
    name: "MongoDB for Startups",
    logoUrl: "https://www.mongodb.com/assets/images/global/leaf.svg",
    label: "MongoDB for Startups",
    href: "https://www.mongodb.com/startups",
    fallback: "",
  },
];

const BackedBy = () => {
  return (
    <section className="py-8 bg-background border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-[12px] md:text-[13px] tracking-[0.08em] uppercase text-muted-foreground font-semibold mb-6">
          Backed by
        </h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 md:gap-10">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
            >
              {partner.name === "Google for Startups" ? (
                <>
                  <LogoImage
                    src={partner.logoUrl}
                    alt="Google"
                    fallbackText="Google"
                    className="h-[28px] md:h-[36px] w-auto object-contain"
                  />
                  <span className="text-lg md:text-xl font-medium text-muted-foreground group-hover:text-foreground tracking-tight transition-colors">
                    {partner.label}
                  </span>
                </>
              ) : (
                <>
                  <LogoImage
                    src={partner.logoUrl}
                    alt="MongoDB leaf"
                    fallbackText=""
                    className="h-[28px] md:h-[36px] w-auto object-contain"
                  />
                  <span className="text-lg md:text-xl font-bold text-muted-foreground group-hover:text-[#00ED64] tracking-tight transition-colors">
                    MongoDB <span className="font-normal text-muted-foreground group-hover:text-foreground transition-colors">for Startups</span>
                  </span>
                </>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BackedBy;
