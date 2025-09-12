const React = require("react");
const { default: FlowersAndMore } = require("../svgs/FlowersAndMore.jsx");
const { default: GettingStarted } = require("../svgs/GettingStarted.jsx");
const { default: KitchenGardening } = require("../svgs/KitchenGardening.jsx");
const { default: PlantCare } = require("../svgs/PlantCare.jsx");

/**
 * Header - Main site header with navigation and category buttons
 * @param {Array} breadcrumbs - Array of breadcrumb objects with name and href properties
 * @param {string} currentPath - Current page path for active states
 * @returns {Object} React element for the header
 */
const Header = ({ breadcrumbs = [], currentPath = "" }) => {
  // Top navigation items
  const topNavItems = [
    { name: "New", href: "/new" },
    { name: "Vegetables", href: "/vegetables" },
    { name: "Flowers", href: "/flowers" },
    { name: "Plants", href: "/plants" },
    { name: "Perennials", href: "/perennials" },
    { name: "Herbs", href: "/herbs" },
    { name: "Fruit", href: "/fruit" },
    { name: "Supplies", href: "/supplies" },
    { name: "Farmer's Market", href: "/farmers-market" },
    { name: "Garden Guide", href: "/garden-guide", active: true },
  ];

  // Main category buttons with icons
  const categoryButtons = [
    {
      name: "Get Started",
      href: "/garden-guide/get-started",
      icon: GettingStarted, // SVG Component
    },
    {
      name: "Kitchen Gardening",
      href: "/garden-guide/edible-gardening",
      icon: KitchenGardening, // SVG Component
    },
    {
      name: "Flowers & More",
      href: "/garden-guide/ornamental-gardening",
      icon: FlowersAndMore, // SVG Component
    },
    {
      name: "Garden Care",
      href: "/garden-guide/garden-care",
      icon: PlantCare, // SVG Component
    },
  ];

  return (
    <header
      style={{
        backgroundColor: "#FBF9F6",
        marginBottom: "30px",
      }}
    >
      <div
        key="main-header"
        style={{
          maxWidth: "1314px",
          margin: "0 auto",
          padding: "1.2rem 1rem",
        }}
      >
        {/* Header content wrapper */}
        <div
          key="header-content"
          className="header-content"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {/* Logo/Title */}
          <div
            key="logo"
            style={{
              flex: "0 0 auto",
            }}
          >
            <a
              href="/garden-guide"
              className="header-logo"
              style={{
                fontSize: "2.2rem",
                fontWeight: "500",
                color: "#046A38",
                textDecoration: "none",
              }}
            >
              Burpee Garden Guide
            </a>
          </div>

          {/* Category buttons */}
          <div
            key="category-buttons"
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
            className="category-buttons-desktop"
          >
            {categoryButtons.map((button) => (
              <a
                key={button.name}
                href={button.href}
                className="category-button-desktop"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1.25rem",
                  border: "1px solid #046A38",
                  borderRadius: "0.5rem",
                  backgroundColor: "white",
                  color: "black",
                  textDecoration: "none",
                  fontSize: "16px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  key="icon"
                  style={{
                    fontSize: "1.125rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {typeof button.icon === "string"
                    ? button.icon
                    : <button.icon
                        key="svg-icon"
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                      />}
                </span>
                <span key="text">{button.name}</span>
              </a>
            ))}
          </div>

          {/* Mobile category buttons (2x2 grid) */}
          <div
            key="category-buttons-mobile"
            className="category-buttons-mobile"
            style={{
              display: "none", // Hidden by default, shown on mobile via CSS
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "1rem",
              width: "100%",
              marginTop: "1rem",
            }}
          >
            {categoryButtons.map((button) => {
              // Create mobile button text with line breaks
              let mobileButtonText;
              if (button.name === "Get Started") {
                mobileButtonText = ["Get", <br key="br" />, "Started"];
              } else if (button.name === "Kitchen Gardening") {
                mobileButtonText = "Kitchen Garden";
              } else if (button.name === "Flowers & More") {
                mobileButtonText = ["Flowers", <br key="br" />, "& More"];
              } else if (button.name === "Garden Care") {
                mobileButtonText = ["Garden", <br key="br" />, "Care"];
              } else {
                mobileButtonText = button.name;
              }

              return (
                <div
                  key={`mobile-${button.name}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  {/* Icon square container (clickable) */}
                  <a
                    key="icon-link"
                    href={button.href}
                    className="category-button-mobile"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "55px",
                      height: "55px",
                      border: "1px solid #046A38",
                      borderRadius: "1rem",
                      backgroundColor: "white",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {typeof button.icon === "string" ? (
                      <span
                        style={{
                          fontSize: "2.5rem",
                          color: "#046A38",
                        }}
                      >
                        {button.icon}
                      </span>
                    ) : (
                      <button.icon
                        key="svg-icon"
                        style={{
                          width: "50px",
                          height: "50px",
                        }}
                      />
                    )}
                  </a>
                  {/* Text label (outside the square) */}
                  <span
                    key="text"
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      lineHeight: "1.3",
                      color: "black",
                      maxWidth: "100px",
                      wordWrap: "break-word",
                    }}
                  >
                    {mobileButtonText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

module.exports = Header;
