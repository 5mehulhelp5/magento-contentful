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
              [
                React.createElement("span", { key: "burpee" }, "Burpee"),
                React.createElement(
                  "span",
                  { key: "garden-guide" },
                  " Garden Guide"
                ),
              ]
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

        // Category buttons
        React.createElement(
          "div",
          {
            key: "gg-home-links",
            id: "gg-home-links",
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
