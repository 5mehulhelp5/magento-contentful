const React = require("react");
const Header = require("../components/Header.jsx");

/**
 * HeaderTestPage - Test page to preview the header component
 */
const HeaderTestPage = () => {
  // Sample breadcrumbs for testing
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Garden Guide", href: "/garden-guide" },
    { name: "Get Started", href: "/garden-guide/get-started" },
    { name: "How Much Sun Does a Garden Need? Answering Your Sun Questions" },
  ];

  return React.createElement(
    "div",
    {
      style: {
        minHeight: "100vh",
        backgroundColor: "white",
      },
    },
    [
      // Header
      React.createElement(Header, {
        key: "header",
        breadcrumbs: breadcrumbs,
        currentPath: "/garden-guide/get-started/sun-requirements",
      }),

      // Sample content to show how it looks with page content
      React.createElement(
        "main",
        {
          key: "main-content",
          style: {
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem 1rem",
          },
        },
        [
          React.createElement(
            "h1",
            {
              key: "title",
              style: {
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "1rem",
              },
            },
            "Header Preview Page"
          ),
          React.createElement(
            "p",
            {
              key: "description",
              style: {
                fontSize: "1.125rem",
                color: "#6b7280",
                lineHeight: "1.75",
                marginBottom: "2rem",
              },
            },
            "This page demonstrates the header component design. The header includes top navigation, the main Burpee Garden Guide title with category buttons, and breadcrumb navigation."
          ),
          React.createElement(
            "div",
            {
              key: "sample-content",
              style: {
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              },
            },
            [
              React.createElement(
                "h2",
                {
                  key: "sample-title",
                  style: {
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "1rem",
                  },
                },
                "Sample Content Area"
              ),
              React.createElement(
                "p",
                {
                  key: "sample-text",
                  style: {
                    color: "#374151",
                    lineHeight: "1.625",
                  },
                },
                "This is where your main page content would go. The header is sticky, so it will remain at the top as you scroll through the page content."
              ),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "sample-content",
              style: {
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              },
            },
            [
              React.createElement(
                "h2",
                {
                  key: "sample-title",
                  style: {
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "1rem",
                  },
                },
                "Sample Content Area"
              ),
              React.createElement(
                "p",
                {
                  key: "sample-text",
                  style: {
                    color: "#374151",
                    lineHeight: "1.625",
                  },
                },
                "This is where your main page content would go. The header is sticky, so it will remain at the top as you scroll through the page content."
              ),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "sample-content",
              style: {
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              },
            },
            [
              React.createElement(
                "h2",
                {
                  key: "sample-title",
                  style: {
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "1rem",
                  },
                },
                "Sample Content Area"
              ),
              React.createElement(
                "p",
                {
                  key: "sample-text",
                  style: {
                    color: "#374151",
                    lineHeight: "1.625",
                  },
                },
                "This is where your main page content would go. The header is sticky, so it will remain at the top as you scroll through the page content."
              ),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "sample-content",
              style: {
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              },
            },
            [
              React.createElement(
                "h2",
                {
                  key: "sample-title",
                  style: {
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "1rem",
                  },
                },
                "Sample Content Area"
              ),
              React.createElement(
                "p",
                {
                  key: "sample-text",
                  style: {
                    color: "#374151",
                    lineHeight: "1.625",
                  },
                },
                "This is where your main page content would go. The header is sticky, so it will remain at the top as you scroll through the page content."
              ),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "sample-content",
              style: {
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              },
            },
            [
              React.createElement(
                "h2",
                {
                  key: "sample-title",
                  style: {
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "1rem",
                  },
                },
                "Sample Content Area"
              ),
              React.createElement(
                "p",
                {
                  key: "sample-text",
                  style: {
                    color: "#374151",
                    lineHeight: "1.625",
                  },
                },
                "This is where your main page content would go. The header is sticky, so it will remain at the top as you scroll through the page content."
              ),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "sample-content",
              style: {
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              },
            },
            [
              React.createElement(
                "h2",
                {
                  key: "sample-title",
                  style: {
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "1rem",
                  },
                },
                "Sample Content Area"
              ),
              React.createElement(
                "p",
                {
                  key: "sample-text",
                  style: {
                    color: "#374151",
                    lineHeight: "1.625",
                  },
                },
                "This is where your main page content would go. The header is sticky, so it will remain at the top as you scroll through the page content."
              ),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "sample-content",
              style: {
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              },
            },
            [
              React.createElement(
                "h2",
                {
                  key: "sample-title",
                  style: {
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "1rem",
                  },
                },
                "Sample Content Area"
              ),
              React.createElement(
                "p",
                {
                  key: "sample-text",
                  style: {
                    color: "#374151",
                    lineHeight: "1.625",
                  },
                },
                "This is where your main page content would go. The header is sticky, so it will remain at the top as you scroll through the page content."
              ),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "sample-content",
              style: {
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              },
            },
            [
              React.createElement(
                "h2",
                {
                  key: "sample-title",
                  style: {
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "1rem",
                  },
                },
                "Sample Content Area"
              ),
              React.createElement(
                "p",
                {
                  key: "sample-text",
                  style: {
                    color: "#374151",
                    lineHeight: "1.625",
                  },
                },
                "This is where your main page content would go. The header is sticky, so it will remain at the top as you scroll through the page content."
              ),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "sample-content",
              style: {
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              },
            },
            [
              React.createElement(
                "h2",
                {
                  key: "sample-title",
                  style: {
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "1rem",
                  },
                },
                "Sample Content Area"
              ),
              React.createElement(
                "p",
                {
                  key: "sample-text",
                  style: {
                    color: "#374151",
                    lineHeight: "1.625",
                  },
                },
                "This is where your main page content would go. The header is sticky, so it will remain at the top as you scroll through the page content."
              ),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "sample-content",
              style: {
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              },
            },
            [
              React.createElement(
                "h2",
                {
                  key: "sample-title",
                  style: {
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "1rem",
                  },
                },
                "Sample Content Area"
              ),
              React.createElement(
                "p",
                {
                  key: "sample-text",
                  style: {
                    color: "#374151",
                    lineHeight: "1.625",
                  },
                },
                "This is where your main page content would go. The header is sticky, so it will remain at the top as you scroll through the page content."
              ),
            ]
          ),
          React.createElement(
            "div",
            {
              key: "sample-content",
              style: {
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              },
            },
            [
              React.createElement(
                "h2",
                {
                  key: "sample-title",
                  style: {
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "1rem",
                  },
                },
                "Sample Content Area"
              ),
              React.createElement(
                "p",
                {
                  key: "sample-text",
                  style: {
                    color: "#374151",
                    lineHeight: "1.625",
                  },
                },
                "This is where your main page content would go. The header is sticky, so it will remain at the top as you scroll through the page content."
              ),
            ]
          ),
        ]
      ),
    ]
  );
};

module.exports = HeaderTestPage;
