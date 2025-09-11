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

  return React.createElement(
    "div",
    {
      className: "gg-header",
    },
    React.createElement(
      "div",
      {
        className: "custom-constrained",
      },
      [
        // Header title and description
        React.createElement(
          "div",
          {
            key: "gg-home-header",
            id: "gg-home-header",
          },
          [
            React.createElement(
              "h1",
              {
                key: "title",
              },
              "Burpee Garden Guide"
            ),
            React.createElement(
              "p",
              {
                key: "description",
              },
              "Dig in to find garden inspiration and advice from the experts at Burpee"
            ),
          ]
        ),

        // Category buttons (desktop)
        React.createElement(
          "div",
          {
            key: "gg-home-links",
            id: "gg-home-links",
            className: "category-buttons-desktop",
          },
          React.createElement(
            "ul",
            {},
            categoryButtons.map((button, index) => {
              const IconComponent = button.icon;

              return React.createElement(
                "li",
                {
                  key: index,
                },
                React.createElement(
                  "a",
                  {
                    href: button.href,
                  },
                  [
                    // Icon container
                    React.createElement(
                      "div",
                      {
                        key: "icon",
                        className: "gg-link-icon",
                      },
                      React.createElement(IconComponent, {})
                    ),
                    // Button title with line breaks for mobile
                    React.createElement(
                      "h4",
                      {
                        key: "title",
                      },
                      Array.isArray(button.name)
                        ? button.name.map((part, partIndex) =>
                            React.createElement(
                              "span",
                              {
                                key: partIndex,
                                className: "mobile-break",
                              },
                              part
                            )
                          )
                        : button.name
                    ),
                    // Description
                    React.createElement(
                      "p",
                      {
                        key: "description",
                      },
                      button.description
                    ),
                  ]
                )
              );
            })
          )
        ),

        // Mobile category buttons (4 column grid)
        React.createElement(
          "div",
          {
            key: "category-buttons-mobile",
            className: "category-buttons-mobile",
            style: {
              display: "none", // Hidden by default, shown on mobile via CSS
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "1rem",
              width: "100%",
              marginTop: "1rem",
              marginBottom: "2rem",
            },
          },
          categoryButtons.map((button) => {
            const IconComponent = button.icon;

            // Create mobile button text with line breaks
            let mobileButtonText;
            if (
              button.name === "Get Started" ||
              (Array.isArray(button.name) &&
                button.name.join("").includes("Get Started"))
            ) {
              mobileButtonText = [
                "Get",
                React.createElement("br", { key: "br" }),
                "Started",
              ];
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
              mobileButtonText = [
                "Flowers",
                React.createElement("br", { key: "br" }),
                "& More",
              ];
            } else if (button.name === "Garden Care") {
              mobileButtonText = [
                "Garden",
                React.createElement("br", { key: "br" }),
                "Care",
              ];
            } else {
              mobileButtonText = Array.isArray(button.name)
                ? button.name.join("")
                : button.name;
            }

            return React.createElement(
              "div",
              {
                key: `mobile-${
                  Array.isArray(button.name)
                    ? button.name.join("")
                    : button.name
                }`,
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                },
              },
              [
                // Icon square container (clickable)
                React.createElement(
                  "a",
                  {
                    key: "icon-link",
                    href: button.href,
                    className: "category-button-mobile",
                    style: {
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
                    },
                  },
                  React.createElement(IconComponent, {
                    key: "svg-icon",
                    style: {
                      width: "50px",
                      height: "50px",
                    },
                  })
                ),
                // Text label (outside the square)
                React.createElement(
                  "span",
                  {
                    key: "text",
                    style: {
                      fontSize: "16px",
                      fontWeight: "600",
                      lineHeight: "1.3",
                      color: "black",
                      maxWidth: "100px",
                      wordWrap: "break-word",
                    },
                  },
                  mobileButtonText
                ),
              ]
            );
          })
        ),

        // Search section
        React.createElement(
          "div",
          {
            key: "gg-home-search",
            id: "gg-home-search",
          },
          [
            React.createElement(
              "h2",
              {
                key: "search-title",
              },
              "Search the Burpee Garden Guide"
            ),
            React.createElement(
              "div",
              {
                key: "search-container",
              },
              React.createElement(
                "form",
                {
                  className: "form minisearch",
                  id: "search_mini_form",
                  action: "https://mcstaging.burpee.com/catalogsearch/result/",
                  method: "get",
                },
                React.createElement(
                  "div",
                  {
                    className: "relative flex",
                  },
                  [
                    React.createElement(
                      "label",
                      {
                        key: "search-label",
                        className: "sr-only",
                        htmlFor: "search",
                      },
                      "Search seeds, plants & supplies"
                    ),
                    React.createElement("input", {
                      key: "search-input",
                      id: "search",
                      type: "search",
                      className:
                        "w-full border-brand-grey1 rounded-l-md rounded-r-none border-r-0 font-medium",
                      autoCapitalize: "off",
                      autoComplete: "off",
                      autoCorrect: "off",
                      name: "q",
                      defaultValue: "",
                      placeholder: "Search seeds, plants & supplies",
                      maxLength: "128",
                    }),
                    React.createElement(
                      "button",
                      {
                        key: "search-button",
                        type: "submit",
                        title: "Search",
                        className:
                          "action search btn rounded-md rounded-l-none p-2.5 bg-brand hover:bg-brand",
                        "aria-label": "Search",
                      },
                      React.createElement(
                        "svg",
                        {
                          xmlns: "http://www.w3.org/2000/svg",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          strokeWidth: "2",
                          stroke: "currentColor",
                          width: "24",
                          height: "24",
                          "aria-hidden": "true",
                        },
                        React.createElement("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                        })
                      )
                    ),
                  ]
                ),
                React.createElement(
                  "div",
                  {
                    id: "search_autocomplete",
                    className: "search-autocomplete relative w-full",
                    style: { display: "none" },
                  },
                  React.createElement(
                    "div",
                    {
                      className: "absolute z-50 w-full px-1",
                    },
                    React.createElement("div", {
                      className:
                        "bg-white border border-solid border-neutral-200 border-t-0 shadow py-2.5",
                    })
                  )
                )
              )
            ),
          ]
        ),
      ]
    )
  );
};

module.exports = HomeHeader;
