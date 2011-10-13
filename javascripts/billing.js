with (Hasher.Controller('Billing','Application')) {
  route({
    '#account/billing': 'index'
  });
  
  create_action('index', function() {
    BadgerCache.getPaymentMethods(function(results) {
      render('index', results.data.message ? [] : results.data);
    });
  });
  
  create_action('create_or_update_billing', function(contact_id, form_data) {
    $('#errors').empty();
    var callback = function(response) {
			console.log(response)

      if (response.meta.status == 'ok') {
        call_action('Modal.hide');
        call_action('profiles');
      } else {
        $('#errors').empty().append(helper('Application.error_message', response));
      }
    }

    if (contact_id) {
      Badger.updatePaymentMethod(contact_id, form_data, callback);
    } else {
      Badger.createPaymentMethod(form_data, callback);
    }
  });
  
  layout('dashboard');
}

with (Hasher.View('Billing', 'Application')) { (function() {

  create_view('index', function(contacts) {
    return div(
      h1('Billing Settings'),
      div({ style: 'float: right; margin-top: -44px' }, 
        a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'Billing.edit_billing_modal') }, 'Add Credit Card')
      ),

      table({ 'class': 'fancy-table' },
        tbody(
          (contacts || []).map(function(payment_method) {
            return tr(
              // td(
              //   div(contact.first_name, ' ', contact.last_name)
              // ),
              // td(
              //   div(contact.cc_number),
              //   div(contact.cc_expiration)
              // ),
							td(payment_method.name),
              td({ style: "text-align: right" },
                a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'Billing.edit_billing_modal', payment_method) }, 'Edit')
              )
            );
          })
        )
      )
    );
  });

  create_helper('edit_billing_modal', function(data) {
    data = data || {};
    return form({ action: action('create_or_update_billing', data.id) },
      h1(data.id ? 'Edit Credit Card' : 'Add Credit Card'),
      div({ id: 'errors' }),
      div(
        input({ name: 'first_name', placeholder: 'First Name', value: data.first_name || '' }),
        input({ name: 'last_name', placeholder: 'Last Name', value: data.last_name || '' })
      ),
      div(
        input({ name: 'street_address', placeholder: 'Billing Address', value: data.address || '' }),
				input({ name: 'extended_address', placeholder: 'Extended Address', value: data.address || '' })
      ),
      div(
        input({ name: 'locality', placeholder: 'City', value: data.city || '' }),
        input({ name: 'region', placeholder: 'State', value: data.state || '' }),
        input({ name: 'postal_code', placeholder: 'Zip', value: data.zip || '' })
      ),
      div(
        input({ name: 'country_name', placeholder: 'Country', value: data.country || '' })
      ),
      br(),
      div(
        input({ name: 'cc_number', placeholder: 'XXXX-XXXX-XXXX-XXXX', value: data.cc_number || '', style: "width: 240px" })
      ),
      div(
        input({ name: 'cc_expiration_date', placeholder: 'MM/YYYY', value: data.cc_expiration || '' }),
        input({ name: 'cc_ccv', placeholder: 'CCV', value: data.cc_ccv || '' })
      ),
      div({ style: 'text-align: right; margin-top: 10px' }, button({ 'class': 'myButton' }, data.id ? 'Save' : 'Create'))
    );
  });
})(); }