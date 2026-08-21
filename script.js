var PetCart = (function () {
  var products = {
    "dog-food": { id: "dog-food", price: 89 },
    "cat-food": { id: "cat-food", price: 79 },
    chew: { id: "chew", price: 29 },
    toy: { id: "toy", price: 39 }
  };

  function addItem(items, item) {
    return items.concat([{ name: item.name, price: item.price }]);
  }

  function getCount(items) {
    return items.length;
  }

  function getTotal(items) {
    var total = 0;
    var index;

    for (index = 0; index < items.length; index += 1) {
      total += items[index].price;
    }

    return total;
  }

  function serialize(items) {
    return JSON.stringify(items);
  }

  function deserialize(savedItems) {
    var items;

    try {
      items = JSON.parse(savedItems);
      return Object.prototype.toString.call(items) === "[object Array]" ? items : [];
    } catch (error) {
      return [];
    }
  }

  function hasText(value) {
    return String(value || "").replace(/^\s+|\s+$/g, "") !== "";
  }

  function hasLoginInput(username, password) {
    return hasText(username) && hasText(password);
  }

  function getProduct(id) {
    return products[id] || null;
  }

  return {
    addItem: addItem,
    getCount: getCount,
    getTotal: getTotal,
    serialize: serialize,
    deserialize: deserialize,
    hasLoginInput: hasLoginInput,
    getProduct: getProduct
  };
}());

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    function initCart() {
      var items = [];
      var addButtons = document.querySelectorAll(".product-add-button");
      var count = document.querySelector("[data-cart-count]");
      var list = document.querySelector("[data-cart-list]");
      var total = document.querySelector("[data-cart-total]");
      var empty = document.querySelector("[data-cart-empty]");
      var clearButton = document.querySelector("[data-clear-cart]");
      var toggleButton = document.querySelector("[data-cart-toggle]");
      var cartSection = document.querySelector("[data-cart-section]");
      var detailAdded = document.querySelector("[data-detail-added]");
      var index;

      try {
        items = PetCart.deserialize(localStorage.getItem("pet-shop-cart") || "[]");
      } catch (error) {
        items = [];
      }

      function saveCart() {
        try {
          localStorage.setItem("pet-shop-cart", PetCart.serialize(items));
        } catch (error) {
          return;
        }
      }

      function renderCart() {
        if (list) {
          list.innerHTML = "";
        }
        if (count) {
          count.textContent = PetCart.getCount(items);
        }
        if (total) {
          total.textContent = PetCart.getTotal(items);
        }
        if (empty) {
          empty.hidden = items.length > 0;
        }

        for (index = 0; index < items.length; index += 1) {
          var row = document.createElement("li");
          row.textContent = items[index].name + " - \u00A5" + items[index].price;
          if (list) {
            list.appendChild(row);
          }
        }
      }

      for (index = 0; index < addButtons.length; index += 1) {
        addButtons[index].addEventListener("click", function () {
          items = PetCart.addItem(items, {
            name: this.dataset.productName,
            price: Number(this.dataset.productPrice)
          });
          saveCart();
          renderCart();
          if (detailAdded) {
            detailAdded.hidden = false;
          }
        });
      }

      if (clearButton) {
        clearButton.addEventListener("click", function () {
          items = [];
          saveCart();
          renderCart();
        });
      }

      if (toggleButton && cartSection) {
        toggleButton.addEventListener("click", function () {
          cartSection.scrollIntoView({ behavior: "smooth" });
        });
      }

      renderCart();
    }

    function initLoginForm() {
      var form = document.querySelector("[data-login-form]");
      var error = document.querySelector("[data-login-error]");
      var success = document.querySelector("[data-login-success]");

      if (!form) {
        return;
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        error.hidden = true;
        success.hidden = true;

        if (!PetCart.hasLoginInput(form.elements.username.value, form.elements.password.value)) {
          error.hidden = false;
          return;
        }

        success.hidden = false;
        form.reset();
      });
    }

    function initProductDetail() {
      var detailCards = document.querySelectorAll("[data-product-detail]");
      var id;
      var index;

      if (!detailCards.length) {
        return;
      }

      id = new URLSearchParams(window.location.search).get("id") || "dog-food";

      for (index = 0; index < detailCards.length; index += 1) {
        detailCards[index].hidden = detailCards[index].dataset.productDetail !== id;
      }
    }

    if (document.querySelector(".product-add-button")) {
      initCart();
    }

    initLoginForm();
    initProductDetail();
  });
}
