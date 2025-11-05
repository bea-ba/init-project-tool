/**
 * Skip Links Component
 * Allows keyboard users to skip to main content and navigation
 */
export const SkipLinks = () => {
  return (
    <div className="skip-links">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#desktop-navigation" className="skip-link">
        Skip to navigation
      </a>
    </div>
  );
};
