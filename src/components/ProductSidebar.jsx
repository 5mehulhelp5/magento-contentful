const React = require("react");

/**
 * ProductSidebar - Displays a list of related products in a sidebar
 * @param {Array} products - Array of product objects with image, title, description, and price
 * @returns {Object} React element for the product sidebar
 */
const ProductSidebar = ({ products = [] }) => {
  // Default products if none provided
  const defaultProducts = [
    {
      image:
        "https://images.ctfassets.net/bq61jovlhx8i/4jDfinSFItwr7g3mKv3zjM/a55943980c3c1759290b01924ecf545b/993282ffbaf7398090b3581bc3bf8ffe00f2344b4cf3d6d80dcc0a1093b0ae20.webp",
      title: "Burpee Garden Sown™ Groundswell Hybrid Tomato Seeds",
      description:
        "Massive fruit looks like an heirloom and performs like a hybrid.",
      price: "As low as $7.95",
    },
    {
      image:
        "https://images.ctfassets.net/bq61jovlhx8i/5RP70oroJczLwDzvFOY4B3/925e7326f628ffb26df321f8bbf030d1/523382b183fafddec442f2b7fab260ed525c5d9639deb9b325b7f8fa57185b53.webp",
      title: "Heyday Hybrid Cucumber Seeds",
      description:
        "A better-tasting cuke that tolerates summer's hottest days.",
      price: "As low as $6.95",
    },
    {
      image:
        "https://images.ctfassets.net/bq61jovlhx8i/18ryILILZMGVLDqCnbYivh/0bdd0ead44c27c1e5fd2dca787072e77/94bd332c6077fcac29101b5b7fe530cf351c73afc69c6c4b86fae749ed38119f.webp",
      title: "SuperTom! Hybrid Tomato Seeds & Plant",
      description:
        "Indulge in this versatile beefsteak at any hour of the day.",
      price: "$7.95",
    },
    {
      image:
        "https://images.ctfassets.net/bq61jovlhx8i/4jpkEfIGe3RsJ0Ru6qzi1k/c1b2ed8da5899f0e98a0504f684a2c40/0841ab957bfba1d415b5291280988c0de708a8ac798798f073fb13711d103b7e.webp",
      title: "Garden Sown™ Rain Drops Hybrid Tomato Seeds",
      description: "Direct-sowing gives you a second chance at seed-starting.",
      price: "As low as $7.95",
    },
  ];

  const productsToShow = products.length > 0 ? products : defaultProducts;

  return React.createElement(
    "aside",
    {
      className: "product-sidebar",
      style: {
        width: "280px",
        backgroundColor: "white",
        padding: "16px",
        height: "100vh",
        position: "sticky",
        top: "20px",
        overflowY: "auto",
      },
    },
    [
      // Products list (title removed)
      React.createElement(
        "div",
        {
          key: "products",
          className: "products-list",
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          },
        },
        productsToShow.map((product, index) =>
          React.createElement(
            "div",
            {
              key: `product-${index}`,
              className: "product-card",
              style: {
                cursor: "pointer",
              },
            },
            [
              // Product image
              React.createElement("img", {
                key: "image",
                src: product.image,
                alt: product.title,
                style: {
                  width: "100%",
                  height: "160px",
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                  marginBottom: "12px",
                },
              }),

              // Product title
              React.createElement(
                "h4",
                {
                  key: "title",
                  className: "product-title",
                  style: {
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "8px",
                    lineHeight: "1.3",
                    transition: "all 0.2s ease",
                  },
                },
                product.title
              ),

              // Product description
              React.createElement(
                "p",
                {
                  key: "description",
                  style: {
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    marginBottom: "8px",
                    lineHeight: "1.4",
                  },
                },
                product.description
              ),

              // Product price
              React.createElement(
                "p",
                {
                  key: "price",
                  style: {
                    fontSize: "0.875rem",
                    fontWeight: "400",
                    color: "#374151",
                  },
                },
                product.price
              ),
            ]
          )
        )
      ),
    ]
  );
};

module.exports = ProductSidebar;
