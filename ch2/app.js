(function() {
  var  init = function() {
    var orderForm = document.forms.order,
        saveBtn = document.getElementById('saveOrder'),
        saveBtnClicked = false;

    var saveForm = function() {

      if(!('formAction' in document.createElement('input'))) {
        var formAction = saveBtn.getAttribute('formaction');
        orderForm.setAttribute('action',formAction);
      }
      saveBtnClicked = true;
    };
    saveBtn.addEventListener('click',saveForm, false);

    var qtyFields = orderForm.quantity,
        totalFields = document.getElementsByClassName('item_total'),
        orderTotalField = document.getElementById('order_total');

    var formatMoney = function(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    var calculateTotals = function() {
      var i = 0,
          ln = qtyFields.length,
          itemQty = 0,
          itemPrice = 0.00,
          itemTotal = 0.00,
          itemTotalMoney = '$0.00',
          orderTotal = 0.00,
          orderTotalMoney = '$0.00';

      for(;i<ln;i++) {
        if(!!qtyFields[i].valueAsNumber) {
          itemQty =qtyFields[i].valueAsNumber || 0;
        } else {
          itemQty =parseFloat(qtyFields[i].value) || 0;
        }
        if(!!qtyFields[i].dataset) {
          itemPrice =parseFloat(qtyFields[i].dataset.price);
        } else {
          itemPrice =parseFloat(qtyFields[i].getAttribute('data-price'));
        }
        itemTotal =itemQty *itemPrice;
        itemTotalMoney = '$'+formatMoney(itemTotal.toFixed(2));
        orderTotal +=itemTotal;
        orderTotalMoney = '$'+formatMoney(orderTotal.toFixed(2));

        if(!!totalFields[i].value) {
          totalFields[i].value =itemTotalMoney;
          orderTotalField.value =orderTotalMoney;
        } else {
          totalFields[i].innerHTML =itemTotalMoney;
          orderTotalField.innerHTML =orderTotalMoney;
        }
      }
    };
    calculateTotals();

    var qtyListeners = function() {
      var i = 0,
          ln = qtyFields.length;
      for(;i<ln;i++) {
        qtyFields[i].addEventListener('input',calculateTotals, false);
        qtyFields[i].addEventListener('keyup',calculateTotals, false);
      }
    };
    qtyListeners();

    var doCustomValidity = function(field, msg) {
      if('setCustomValidity' in field) {
        field.setCustomValidity(msg);
      } else {
        field.validationMessage = msg;
      }
    };

    var validateForm = function() {
      doCustomValidity(orderForm.name, '');
      doCustomValidity(orderForm.password, '');
      doCustomValidity(orderForm.confirm_password, '');
      doCustomValidity(orderForm.card_name, '');

      if(!Modernizr.inputtypes.month || !Modernizr.input.pattern) {
        fallbackValidation();
      }

      if(orderForm.name.value.length < 4) {
        doCustomValidity(
          orderForm.name, 'Full Name must be at least 4 characters long'
        );
      }
      if(orderForm.password.value.length < 8) {
        doCustomValidity(
          orderForm.password,
          'Password must be at least 8 characters long'
        );
      }

      if(orderForm.password.value != orderForm.confirm_password.value) {
        doCustomValidity(
          orderForm.confirm_password,
          'Confirm Password must match Password'
        );
      }

      if(orderForm.card_name.value.length < 4) {
        doCustomValidity(
          orderForm.card_name,
          'Name on Card must be at least 4 characters long'
        );
      }

    };
    orderForm.addEventListener('input', validateForm, false);
    orderForm.addEventListener('keyup', validateForm, false);

    var styleInvalidForm = function() {
      orderForm.className = 'invalid';
    }
    orderForm.addEventListener('invalid', styleInvalidForm, true);

    Modernizr.load({
      test: Modernizr.inputtypes.month,
      nope: 'monthpicker.js'
    });

    var getFieldLabel = function(field) {
      if('labels' in field && field.labels.length > 0) {
        return field.labels[0].innerText;
      }
      if(field.parentNode && field.parentNode.tagName.toLowerCase()=== 'label')
      {
        return field.parentNode.innerText;
      }
      return '';
    }

    var submitForm = function(e) {
      if(!saveBtnClicked) {
        validateForm();
        var i = 0,
            ln = orderForm.length,
            field,
            errors = [],
            errorFields = [],
            errorMsg = '';

        for(; i<ln; i++) {
          field = orderForm[i];
          if((!!field.validationMessage &&
              field.validationMessage.length > 0) || (!!field.checkValidity
                                                      && !field.checkValidity())
            ) {
            errors.push(
              getFieldLabel(field)+': '+field.validationMessage
            );
            errorFields.push(field);
          }
        }

        if(errors.length > 0) {
          e.preventDefault();
          errorMsg = errors.join('\n');
          alert('Please fix the following errors:\n'+errorMsg, 'Error');
          orderForm.className = 'invalid';
          errorFields[0].focus();
        }
      }
    };
    orderForm.addEventListener('submit', submitForm, false);

    var fallbackValidation = function() {
      var i = 0,
          ln = orderForm.length,
          field;
      for(;i<ln;i++) {
        field = orderForm[i];
        doCustomValidity(field, '');
        if(field.hasAttribute('pattern')) {
          var pattern = new  RegExp(field.getAttribute('pattern').toString());
          if(!pattern.test(field.value)) {
            var msg = 'Please match the requested format.';
            if(field.hasAttribute('title') &&  field.getAttribute('title').length > 0) {
              msg += ' '+field.getAttribute('title');
            }
            doCustomValidity(field, msg);
          }
        }
        if(field.hasAttribute('type') &&
           field.getAttribute('type').toLowerCase()=== 'email') {
          var pattern = new RegExp(/\S+@\S+\.\S+/);
          if(!pattern.test(field.value)) {
            doCustomValidity(field, 'Please enter an email address.');
          }
        }
        if(field.hasAttribute('required') && field.value.length < 1) {
          doCustomValidity(field, 'Please fill out this field.');
        }
      }
    };


  };
  window.addEventListener('load',init, false);
}) ();
