// Copyright (c) 2020, earthians and contributors
// For license information, please see license.txt
{% include "healthcare/public/js/service_request.js" %}

frappe.ui.form.on('Service Request', {
	onload: function(frm) {
		if (frm.doc.__islocal) {
			frm.set_value('order_time', frappe.datetime.now_time())
		}
	},

	refresh: function(frm) {
		frm.set_query('order_group', function () {
			return {
				filters: {
					'docstatus': 1,
					'patient': frm.doc.patient,
					'practitioner': frm.doc.ordered_by
				}
			};
		});

		frm.set_query('order_doctype', function() {
			let service_order_doctypes = ['Medication', 'Therapy Type', 'Lab Test Template',
				'Clinical Procedure Template'];
			return {
				filters: {
					name: ['in', service_order_doctypes]
				}
			};
		});

		frm.set_query('patient', function () {
			return {
				filters: {
					'status': 'Active'
				}
			};
		});

		frm.set_query('staff_role', function () {
			return {
				filters: {
					'restrict_to_domain': 'Healthcare'
				}
			};
		});

		frm.trigger('setup_status_buttons');
		frm.trigger('setup_create_buttons');
	},

	setup_status_buttons: function(frm) {
		if (frm.doc.docstatus === 1) {

			if (frm.doc.status === 'Active') {
				frm.add_custom_button(__('On Hold'), function() {
					frm.events.set_status(frm, 'On Hold');
				}, __('Status'));

				frm.add_custom_button(__('Completed'), function() {
					frm.events.set_status(frm, 'Completed');
				}, __('Status'));
			}

			if (frm.doc.status === 'On Hold') {
				frm.add_custom_button(__('Active'), function() {
					frm.events.set_status(frm, 'Active');
				}, __('Status'));

				frm.add_custom_button(__('Completed'), function() {
					frm.events.set_status(frm, 'Completed');
				}, __('Status'));
			}

		} else if (frm.doc.docstatus === 2) {

			frm.add_custom_button(__('Revoked'), function() {
				frm.events.set_status(frm, 'Revoked');
			}, __('Status'));

			frm.add_custom_button(__('Replaced'), function() {
				frm.events.set_status(frm, 'Replaced');
			}, __('Status'));

			frm.add_custom_button(__('Entered in Error'), function() {
				frm.events.set_status(frm, 'Entered in Error');
			}, __('Status'));

			frm.add_custom_button(__('Unknown'), function() {
				frm.events.set_status(frm, 'Unknown');
			}, __('Status'));

		}
	},

	set_status: function(frm, status) {
		frappe.call({
			method: 'healthcare.healthcare.doctype.service_request.service_request.set_service_request_status',
			async: false,
			freeze: true,
			args: {
				service_request: frm.doc.name,
				status: status
			},
			callback: function(r) {
				if (!r.exc) frm.reload_doc();
			}
		});
	},


	setup_create_buttons: function(frm) {
		if (frm.doc.docstatus !== 1 || frm.doc.status === 'Completed') return;

		if (frm.doc.order_doctype === 'Clinical Procedure Template') {

			frm.add_custom_button(__('Clinical Procedure'), function() {
				frm.trigger('make_clinical_procedure');
			}, __('Create'));


		} else if (frm.doc.order_doctype === 'Lab Test Template') {

			frm.add_custom_button(__('Lab Test'), function() {
				frm.trigger('make_lab_test');
			}, __('Create'));

		} else if (frm.doc.order_doctype === 'Therapy Type') {

			frm.add_custom_button(__('Therapy Session'), function() {
				frm.trigger('make_therapy_session');
			}, __('Create'));

		}

		frm.page.set_inner_btn_group_as_primary(__('Create'));
	},

	make_clinical_procedure: function(frm) {
		frappe.call({
			method: 'healthcare.healthcare.doctype.service_request.service_request.make_clinical_procedure',
			args: { service_request: frm.doc },
			freeze: true,
			callback: function(r) {
				var doclist = frappe.model.sync(r.message);
				frappe.set_route('Form', doclist[0].doctype, doclist[0].name);
			}
		});
	},

	make_lab_test: function(frm) {
		frappe.call({
			method: 'healthcare.healthcare.doctype.service_request.service_request.make_lab_test',
			args: { service_request: frm.doc },
			freeze: true,
			callback: function(r) {
				var doclist = frappe.model.sync(r.message);
				frappe.set_route('Form', doclist[0].doctype, doclist[0].name);
			}
		});
	},

	make_therapy_session: function(frm) {
		frappe.call({
			method: 'healthcare.healthcare.doctype.service_request.service_request.make_therapy_session',
			args: { service_request: frm.doc },
			freeze: true,
			callback: function(r) {
				var doclist = frappe.model.sync(r.message);
				frappe.set_route('Form', doclist[0].doctype, doclist[0].name);
			}
		});
	},
});