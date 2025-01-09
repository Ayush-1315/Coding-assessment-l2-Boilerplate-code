//HTML Elements
const cart = document.getElementById("cart-products");
const subTotal=document.getElementById("sub-total");
const total=document.getElementById("total");

// Function to format the price with commas (e.g. ₹. 250000 -> ₹. 250,000)
const formatPrice = (price) => {
    return `₹ ${new Intl.NumberFormat().format(price)}.00`;
  };
const cartValue=()=>{
    const cartData=JSON.parse(localStorage.getItem("CartData"));
    const items=cartData.items;
    const value=items.reduce((prev,{presentment_price,quantity})=>prev+=presentment_price*quantity,0);
    const price=formatPrice(value);
    subTotal.textContent=price;
    total.textContent=price;
  }

// Function to handle the deletion of a product from the cart
const deleteProduct = (productId) => {
  // Remove the product from the DOM
  document.getElementById(productId).remove();
  // Get the current cart data from localStorage
  const cartData = JSON.parse(localStorage.getItem("CartData"));
  // Update the cart by removing the product with the matching ID
  const updatedCart = {
    ...cartData,
    items: cartData.items.filter((item) => item.id !== productId), // Filter out the deleted product
  };

  // Update localStorage with the new cart data
  localStorage.removeItem("CartData");
  localStorage.setItem("CartData", JSON.stringify(updatedCart));

  // Re-render the updated cart data on the page
  setData();
};

// Function to handle updating the quantity of a product in the cart
const updateProductList = (productId, value) => {
    const cartData = JSON.parse(localStorage.getItem("CartData"));

    // Update the cart with the new quantity for the specific product
  const updatedCart = {
    ...cartData,
    items: cartData.items.map((item) =>
      productId === item.id ? { ...item, quantity: value } : item
    ),
  };

  // Update localStorage with the new cart data
  localStorage.removeItem("CartData");
  document.getElementById(productId).remove();
  localStorage.setItem("CartData", JSON.stringify(updatedCart));

  // Re-render the updated cart data on the page
  setData();
};

// Handler to process the change events (either update or delete)
const changeHandler = ({ id, action, value }) => {
  if (action === "update")
    updateProductList(id, value); // Call update if the action is "update"
  else deleteProduct(id); // Call delete if the action is "delete"
};
const setData = () => {
  const cartData = JSON.parse(localStorage.getItem("CartData"));// Fetch cart data from localStorage
  const items = cartData.items; // Get the items from the cart data

  // Check if there are items in the cart
  if (items?.length > 0) {
    // Loop through the items and generate HTML elements for each product
    items.forEach(
      ({
        id,
        presentment_price,
        featured_image: { url, alt },
        product_title,
        quantity,
        quantity_rule: { min, increment },
      }) => {
        // Create the main list item for the product
        const newListProduct = document.createElement("li");

        // Creating elements for product details: name, image, price, quantity, subtotal, delete button
        const newProduct = document.createElement("span");
        const newProductName = document.createElement("span");
        const newProductImage = document.createElement("img");
        const newProductPrice = document.createElement("span");
        const newProductQuantity = document.createElement("span");
        const newProductSubtotal = document.createElement("span");
        const newProductQuantityInput = document.createElement("input");
        const deleteProductButton = document.createElement("button");

        // Setting up product image and name
        newProductImage.src = url;
        newProductImage.alt = alt;
        newProductName.textContent = product_title;
        newProduct.className = "product-name";
        newProduct.appendChild(newProductImage);
        newProduct.appendChild(newProductName);

        // Append product name and image to the list item
        newListProduct.appendChild(newProduct);
        newListProduct.className = "product";

        // Setting up the product price
        newProductPrice.className = "product-price";
        newProductPrice.textContent = formatPrice(presentment_price);
        newListProduct.appendChild(newProductPrice);

        // Setting up the quantity input field
        newProductQuantityInput.type = "number";
        newProductQuantityInput.min = min;
        newProductQuantityInput.step = increment;
        newProductQuantityInput.value = quantity;
        newProductQuantityInput.autofocus=true;
        newProductQuantityInput.addEventListener("change", (e) => {
          changeHandler({ id, action: "update", value: e.target.value });
        });

        // Append quantity input to the list item
        newProductQuantity.appendChild(newProductQuantityInput);

        // Setting up the product subtotal (price * quantity)
        newProductSubtotal.className = "product-subtotal";
        newProductSubtotal.textContent = formatPrice(presentment_price * quantity);

        // Setting up the delete button
        deleteProductButton.textContent = "Delete";
        deleteProductButton.addEventListener("click", () => {
          changeHandler({ id, action: "delete" });
        });

        // Append the delete button to the subtotal section
        newProductSubtotal.appendChild(deleteProductButton);

        // Append quantity and subtotal sections to the list item
        newListProduct.id = id;
        newListProduct.appendChild(newProductQuantity);
        newListProduct.appendChild(newProductSubtotal);

        // Add the product to the cart
        cart.appendChild(newListProduct);
      }
    );
    cartValue();
  } else {
    // If there are no items in the cart, display a message
    cart.innerHTML = "";
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Your cart is empty.";
    emptyMessage.className = "empty-cart-message";
    cart.appendChild(emptyMessage);
    cartValue();
  }
};

const getData = async () => {
  try {
    // Check if cart data is available in localStorage
    if (localStorage.getItem("CartData") === null) {
      // Fetch the cart data from the API
      const APIdata = await fetch(
        "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889"
      );
      const data = await APIdata.json();
      // If no cart data exists, save the fetched data to localStorage and render it
      localStorage.setItem("CartData", JSON.stringify(data));
      setData();
    } else {
      // If cart data exists, simply render it
      setData();
    }
  } catch (e) {
    // Log any errors that occur during the fetch
    console.log(e);
  }
};
// Initialize the cart data when the page loads
getData();

