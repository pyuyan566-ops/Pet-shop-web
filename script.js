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

  function isBookingValid(name, phone, message) {
    return hasText(name) && /^1\d{10}$/.test(phone) && hasText(message);
  }

  function addBookingRecord(records, record) {
    return records.concat([{
      name: record.name,
      phone: record.phone,
      message: record.message
    }]);
  }

  function removeBookingRecord(records, recordIndex) {
    var remaining = [];
    var index;

    for (index = 0; index < records.length; index += 1) {
      if (index !== recordIndex) {
        remaining.push(records[index]);
      }
    }

    return remaining;
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
    isBookingValid: isBookingValid,
    addBookingRecord: addBookingRecord,
    removeBookingRecord: removeBookingRecord,
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

    function initBookingForm() {
      var form = document.querySelector("[data-booking-form]");
      var error = document.querySelector("[data-booking-error]");
      var success = document.querySelector("[data-booking-success]");
      var list = document.querySelector("[data-booking-record-list]");
      var empty = document.querySelector("[data-booking-record-empty]");
      var records = [];

      if (!form) {
        return;
      }

      try {
        records = PetCart.deserialize(localStorage.getItem("pet-shop-booking-records") || "[]");
      } catch (error) {
        records = [];
      }

      function saveRecords() {
        try {
          localStorage.setItem("pet-shop-booking-records", PetCart.serialize(records));
        } catch (error) {
          return;
        }
      }

      function renderRecords() {
        var index;

        if (list) {
          list.innerHTML = "";
        }
        if (empty) {
          empty.hidden = records.length > 0;
        }

        for (index = 0; index < records.length; index += 1) {
          var item = document.createElement("li");
          var title = document.createElement("strong");
          var phone = document.createElement("p");
          var message = document.createElement("p");
          var deleteButton = document.createElement("button");

          item.className = "booking-record-item";
          title.textContent = records[index].name + " \u7684\u54a8\u8be2";
          phone.textContent = "\u7535\u8bdd\uff1a" + records[index].phone;
          message.textContent = "\u9700\u6c42\uff1a" + records[index].message;
          deleteButton.className = "booking-record-delete";
          deleteButton.type = "button";
          deleteButton.textContent = "\u5220\u9664\u8fd9\u6761\u8bb0\u5f55";

          (function (recordIndex) {
            deleteButton.addEventListener("click", function () {
              records = PetCart.removeBookingRecord(records, recordIndex);
              saveRecords();
              renderRecords();
            });
          }(index));

          item.appendChild(title);
          item.appendChild(phone);
          item.appendChild(message);
          item.appendChild(deleteButton);
          if (list) {
            list.appendChild(item);
          }
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        error.hidden = true;
        success.hidden = true;

        if (!PetCart.isBookingValid(form.elements.name.value, form.elements.phone.value, form.elements.message.value)) {
          error.hidden = false;
          return;
        }

        records = PetCart.addBookingRecord(records, {
          name: form.elements.name.value,
          phone: form.elements.phone.value,
          message: form.elements.message.value
        });
        saveRecords();
        renderRecords();
        success.hidden = false;
        form.reset();
      });

      renderRecords();
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

    initBookingForm();
    initLoginForm();
    initProductDetail();
  });
}
