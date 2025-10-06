const React = require("react");
const { default: GettingStarted } = require("../svgs/GettingStarted.jsx");
const { default: PlantCare } = require("../svgs/PlantCare.jsx");
const { default: KitchenGardening } = require("../svgs/KitchenGardening.jsx");
const { default: FlowersAndMore } = require("../svgs/FlowersAndMore.jsx");

/**
 * HomeHeader - The main Burpee Garden Guide header with category buttons and search
 * This matches the provided HTML structure with category buttons and search functionality
 */
const HomeHeader = () => {
  const categoryButtons = [
    {
      name: "Get Started",
      href: "/garden-guide/get-started",
      icon: GettingStarted,
      description: "How to plant, what to grow, and where to begin.",
    },
    {
      name: "Garden Care",
      href: "/garden-guide/garden-care",
      icon: PlantCare,
      description:
        "Get help with watering, feeding and solving plant problems.",
    },
    {
      name: ["Kitchen", " Gardening"],
      href: "/garden-guide/edible-gardening",
      icon: KitchenGardening,
      description: "Herbs, veggies, and fruit from your own garden.",
    },
    {
      name: ["Flowers", " & More"],
      href: "/garden-guide/ornamental-gardening",
      icon: FlowersAndMore,
      description:
        "Plant for color, pollinators, containers, and outdoor beauty.",
    },
  ];

  return (
    <div className="gg-header">
      <div className="custom-constrained">
        {/* Header title and description */}
        <div key="gg-home-header" id="gg-home-header">
          <h1 key="title">Burpee Garden Guide</h1>
          <p key="description">
            Dig in to find garden inspiration and advice from the experts at
            Burpee
          </p>
        </div>

        {/* Category buttons (desktop) */}
        <div
          key="gg-home-links"
          id="gg-home-links"
          className="category-buttons-desktop"
        >
          <ul>
            {categoryButtons.map((button, index) => {
              const IconComponent = button.icon;

              return (
                <li key={index}>
                  <a href={button.href}>
                    {/* Icon container */}
                    <div key="icon" className="gg-link-icon">
                      <IconComponent />
                    </div>
                    {/* Button title with line breaks for mobile */}
                    <h4 key="title">
                      {Array.isArray(button.name)
                        ? button.name.map((part, partIndex) => (
                            <span key={partIndex} className="mobile-break">
                              {part}
                            </span>
                          ))
                        : button.name}
                    </h4>
                    {/* Description */}
                    <p key="description">{button.description}</p>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile category buttons (4 column grid) */}
        <div
          key="category-buttons-mobile"
          className="category-buttons-mobile"
          style={{
            display: "none", // Hidden by default, shown on mobile via CSS
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "1rem",
            width: "100%",
            marginTop: "1rem",
            marginBottom: "2rem",
          }}
        >
          {categoryButtons.map((button) => {
            const IconComponent = button.icon;

            // Create mobile button text with line breaks
            let mobileButtonText;
            if (
              button.name === "Get Started" ||
              (Array.isArray(button.name) &&
                button.name.join("").includes("Get Started"))
            ) {
              mobileButtonText = ["Get", <br key="br" />, "Started"];
            } else if (
              button.name === "Kitchen Gardening" ||
              (Array.isArray(button.name) &&
                button.name.join("").includes("Kitchen"))
            ) {
              mobileButtonText = "Kitchen Garden";
            } else if (
              button.name === "Flowers & More" ||
              (Array.isArray(button.name) &&
                button.name.join("").includes("Flowers"))
            ) {
              mobileButtonText = ["Flowers", <br key="br" />, "& More"];
            } else if (button.name === "Garden Care") {
              mobileButtonText = ["Garden", <br key="br" />, "Care"];
            } else {
              mobileButtonText = Array.isArray(button.name)
                ? button.name.join("")
                : button.name;
            }

            return (
              <div
                key={`mobile-${
                  Array.isArray(button.name)
                    ? button.name.join("")
                    : button.name
                }`}
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
                    width: "65px",
                    height: "65px",
                    border: "1px solid #046A38",
                    borderRadius: "1rem",
                    backgroundColor: "white",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    marginBottom: "0.75rem",
                  }}
                >
                  <IconComponent
                    key="svg-icon"
                    style={{
                      width: "50px",
                      height: "50px",
                    }}
                  />
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

        {/* Search section */}
        <div key="gg-home-search" id="gg-home-search">
          <h2 key="search-title">Search the Burpee Garden Guide</h2>
          <div key="search-container">
            <form
              className="form minisearch"
              id="search_mini_form"
              action="https://mcstaging.burpee.com/catalogsearch/result/"
              method="get"
            >
              <div className="relative flex">
                <label key="search-label" className="sr-only" htmlFor="search">
                  Search the Garden Guide
                </label>
                <input
                  key="search-input"
                  id="search"
                  type="search"
                  className="w-full border-brand-grey1 rounded-l-md rounded-r-none border-r-0 font-medium"
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  name="q"
                  defaultValue=""
                  placeholder="Search the Garden Guide"
                  maxLength="128"
                />
                <button
                  key="search-button"
                  type="submit"
                  title="Search"
                  className="action search btn rounded-md rounded-l-none p-2.5 bg-brand hover:bg-brand"
                  aria-label="Search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    width="24"
                    height="24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
              <div
                id="search_autocomplete"
                className="search-autocomplete relative w-full"
                style={{ display: "none" }}
              >
                <div className="absolute z-50 w-full px-1">
                  <div className="bg-white border border-solid border-neutral-200 border-t-0 shadow py-2.5" />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

module.exports = HomeHeader;
