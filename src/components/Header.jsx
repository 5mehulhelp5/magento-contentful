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
      name: "Start Here",
      href: "/garden-guide/start-here",
      icon: GettingStarted, // SVG Component
    },
    {
      name: "Kitchen Gardening",
      href: "/garden-guide/kitchen-gardening",
      icon: KitchenGardening, // SVG Component
    },
    {
      name: "Flowers & More",
      href: "/garden-guide/flowers-more",
      icon: FlowersAndMore, // SVG Component
    },
    {
      name: "Plant Care",
      href: "/garden-guide/plant-care",
      icon: PlantCare, // SVG Component
    },
  ];

  return React.createElement(
    "header",
    {
      style: {
        backgroundColor: "#FBF9F6",
        marginBottom: "30px",
      },
    },
    [
      // Main header section
      React.createElement(
        "div",
        {
          key: "main-header",
          style: {
            maxWidth: "1314px",
            margin: "0 auto",
            padding: "1.5rem 1rem",
          },
        },
        [
          // Header content wrapper
          React.createElement(
            "div",
            {
              key: "header-content",
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              },
            },
            [
              // Logo/Title
              React.createElement(
                "div",
                {
                  key: "logo",
                  style: {
                    flex: "0 0 auto",
                  },
                },
                React.createElement(
                  "a",
                  {
                    href: "/garden-guide",
                    style: {
                      fontSize: "2.2rem",
                      fontWeight: "500",
                      color: "#046A38",
                      textDecoration: "none",
                    },
                  },
                  "Burpee Garden Guide"
                )
              ),

              // Category buttons
              React.createElement(
                "div",
                {
                  key: "category-buttons",
                  style: {
                    display: "flex",
                    gap: "1.5rem",
                    flexWrap: "wrap",
                  },
                },
                categoryButtons.map((button) =>
                  React.createElement(
                    "a",
                    {
                      key: button.name,
                      href: button.href,
                      style: {
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
                      },
                    },
                    [
                      React.createElement(
                        "span",
                        {
                          key: "icon",
                          style: {
                            fontSize: "1.125rem",
                            display: "flex",
                            alignItems: "center",
                          },
                        },
                        typeof button.icon === "string"
                          ? button.icon
                          : React.createElement(button.icon, {
                              key: "svg-icon",
                              style: {
                                width: "20px",
                                height: "20px",
                              },
                            })
                      ),
                      React.createElement(
                        "span",
                        {
                          key: "text",
                        },
                        button.name
                      ),
                    ]
                  )
                )
              ),
            ]
          ),
        ]
      ),
    ]
  );
};

module.exports = Header;
