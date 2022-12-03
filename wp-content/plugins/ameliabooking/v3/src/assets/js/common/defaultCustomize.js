import { reactive } from "vue";

const globalLabels = reactive(window.wpAmeliaLabels)

let defaultCustomizeSettings = {
  fonts: {
    fontFamily: 'Amelia Roboto, sans-serif',
    fontUrl: '',
    customFontFamily: '',
    customFontSelected: false
  },
  sbsNew: {
    colors: {
      colorPrimary: '#1246D6',
      colorSuccess: '#019719',
      colorError: '#B4190F',
      colorWarning: '#CCA20C',
      colorInpBgr: '#FFFFFF',
      colorInpBorder: '#D1D5D7',
      colorInpText: '#1A2C37',
      colorInpPlaceHolder: '#808A90',
      colorDropBgr: '#FFFFFF',
      colorDropBorder: '#FFFFFF',
      colorDropText: '#0E1920',
      colorSbBgr: '#17295A',
      colorSbText: '#FFFFFF',
      colorMainBgr: '#FFFFFF',
      colorMainHeadingText: '#33434C',
      colorMainText: '#1A2C37',
      colorCalCell: '#265CF2',
      colorCalCellText: '#1246D6',
      colorCalCellSelected: '#1246D6',
      colorCalCellSelectedText: '#FFFFFF',
      colorCalCellDisabled: 'rgba(180, 25, 15, 0.05)',
      colorCalCellDisabledText: '#8C959A',
      colorBtnPrim: '#265CF2',
      colorBtnPrimText: '#FFFFFF',
      colorBtnSec: '#1A2C37',
      colorBtnSecText: '#FFFFFF',
    },
    initStep: {
      options: {
        location: {
          name: globalLabels.location_input_field,
          required: false,
          visibility: true
        },
        employee: {
          name: globalLabels.employee_input_field,
          required: false,
          visibility: true
        },
        primaryFooterButton: {
          name: globalLabels.continue_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      order: [
        {
          name: globalLabels.service,
          id: 'service'
        },
        {
          name: globalLabels.employee,
          id: 'employee'
        },
        {
          name: globalLabels.location,
          id: 'location'
        }
      ],
      translations: null,
    },
    bringingAnyone: {
      options: {
        heading: {
          name: globalLabels.heading,
          visibility: true
        },
        info: {
          name: globalLabels.info,
          visibility: true
        },
        primaryButton: {
          name: globalLabels.primary_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        },
        secondaryButton: {
          name: globalLabels.secondary_button_type,
          buttonType: 'text',
          typeOptions: ['filled', 'plain', 'text']
        },
        primaryFooterButton: {
          name: globalLabels.continue_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null
    },
    packageStep: {
      options: {
        heading: {
          name: globalLabels.popup_heading,
          visibility: true
        },
        primaryButton: {
          name: globalLabels.primary_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        },
        primaryFooterButton: {
          name: globalLabels.continue_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null
    },
    packageInfoStep: {
      options: {
        primaryFooterButton: {
          name: globalLabels.continue_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null
    },
    packageAppointmentsStep: {
      options: {
        endTimeVisibility: {
          name: globalLabels.calendar_slot_end_time,
          visibility: true,
        },
        timeZoneVisibility: {
          name: globalLabels.calendar_time_zone,
          visibility: true
        },
        primaryFooterButton: {
          name: globalLabels.continue_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null
    },
    packageAppointmentsListStep: {
      options: {
        primaryFooterButton: {
          name: globalLabels.continue_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null
    },
    extrasStep: {
      options: {
        heading: {
          name: globalLabels.extras_heading,
          visibility: true
        },
        description: {
          name: globalLabels.extras_description,
          visibility: true
        },
        duration: {
          name: globalLabels.extras_duration,
          visibility: true
        },
        primaryFooterButton: {
          name: globalLabels.continue_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null,
    },
    dateTimeStep: {
      options: {
        endTimeVisibility: {
          name: globalLabels.calendar_slot_end_time,
          visibility: true,
        },
        timeZoneVisibility: {
          name: globalLabels.calendar_time_zone,
          visibility: true
        },
        primaryFooterButton: {
          name: globalLabels.continue_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null
    },
    recurringPopup: {
      options: {
        content: {
          name: globalLabels.popup_content,
          visibility: true
        },
        primaryButton: {
          name: globalLabels.primary_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        },
        secondaryButton: {
          name: globalLabels.secondary_button_type,
          buttonType: 'text',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null
    },
    recurringStep: {
      options: {
        heading: {
          name: globalLabels.heading_content,
          visibility: true
        },
        primaryFooterButton: {
          name: globalLabels.continue_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null
    },
    recurringSummary: {
      options: {
        endTimeVisibility: {
          name: globalLabels.calendar_slot_end_time,
          visibility: true,
        },
        timeZoneVisibility: {
          name: globalLabels.calendar_time_zone,
          visibility: true
        },
        primaryFooterButton: {
          name: globalLabels.continue_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null
    },
    infoStep: {
      order: [
        {
          name: globalLabels.first_name,
          id: 'firstName'
        },
        {
          name: globalLabels.last_name,
          id: 'lastName'
        },
        {
          name: globalLabels.email,
          id: 'email'
        },
        {
          name: globalLabels.phone,
          id: 'phone'
        }
      ],
      options: {
        lastName: {
          name: globalLabels.last_name_input_field,
          required: true,
          visibility: true
        },
        email: {
          name: globalLabels.email_input_field,
          required: false,
          visibility: true
        },
        phone: {
          name: globalLabels.phone_input_field,
          required: false,
          visibility: true
        },
        primaryFooterButton: {
          name: globalLabels.continue_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null
    },
    paymentStep: {
      options: {
        primaryFooterButton: {
          name: globalLabels.continue_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null
    },
    congratulations: {
      options: {
        primaryFooterButton: {
          name: globalLabels.finish_button_type,
          buttonType: 'filled',
          typeOptions: ['filled', 'plain', 'text']
        },
        secondaryFooterButton: {
          name: globalLabels.panel_button_type,
          buttonType: 'text',
          typeOptions: ['filled', 'plain', 'text']
        }
      },
      translations: null
    },
    sidebar: {
      options: {
        self: {
          name: globalLabels.sidebar_visibility,
          visibility: true
        }
      },
      translations: null
    }
  }
}

let defaultTranslations = {
  sbsNew: {
    initStep: {
      header: {
        name: globalLabels.step_title,
        labels: {
          service_selection: null
        }
      },
      input: {
        name: globalLabels.input_fields,
        labels: {
          service_colon: null,
          select_service: null,
          please_select_service: null,
          location: null,
          select_location: null,
          please_select_location: null,
          employee_colon: null,
          select_employee: null,
          please_select_employee: null,
        }
      },
      dropdown: {
        name: globalLabels.dropdowns,
        labels: {
          dropdown_category_heading: null,
          dropdown_items_heading: null,
          dropdown_empty: null,
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          continue: null
        }
      },
      employeeDescription: {
        name: globalLabels.employee_description,
        labels: {
          employee_information: null,
          select_this_employee: null
        }
      }
    },
    bringingAnyone: {
      header: {
        name: globalLabels.step_title,
        labels: {
          bringing_anyone: null
        }
      },
      heading: {
        name: globalLabels.sub_step_title,
        labels: {
          bringing_anyone_title: null
        },
      },
      content: {
        name: globalLabels.content,
        labels: {
          bringing_people: null,
          add_people: null
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          continue: null,
          bringing_yes: null,
          bringing_no: null
        }
      }
    },
    packageStep: {
      header: {
        name: globalLabels.step_title,
        labels: {
          package_selection: null
        }
      },
      heading: {
        name: globalLabels.sub_step_title,
        labels: {
          package_heading: null
        },
      },
      content: {
        name: globalLabels.content,
        labels: {
          discount_save: null,
          separator_or: null
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          continue_without_package: null,
          continue: null
        }
      }
    },
    packageInfoStep: {
      header: {
        name: globalLabels.step_title,
        labels: {
          package_info_step: null
        }
      },
      heading: {
        name: globalLabels.heading_content,
        labels: {
          package_info_discount: null,
          package_book_service: null,
          expires_at: null,
          expires_after: null,
          expires_day: null,
          expires_days: null,
          expires_week: null,
          expires_weeks: null,
          expires_month: null,
          expires_months: null,
          without_expiration: null,
          multiple_locations: null,
          show_more: null,
          show_less: null
        },
      },
      content: {
        name: globalLabels.main_content,
        labels: {
          package_info_includes: null,
          package_info_employees: null
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          continue: null
        }
      }
    },
    packageAppointmentsStep: {
      header: {
        name: globalLabels.step_title,
        labels: {
          package_appointment_step: null
        }
      },
      heading: {
        name: globalLabels.step_heading,
        labels: {
          package_appointment_required: null,
          package_appointment_remaining: null
        }
      },
      inputs: {
        name: globalLabels.input_field,
        labels: {
          package_appointment_employee: null,
          package_appointment_any_employee: null,
          package_appointment_location: null,
          package_appointment_any_location: null
        }
      },
      employeeDescriptionPackage: {
        name: globalLabels.employee_description,
        labels: {
          employee_information_package: null,
          select_this_employee_package: null
        }
      },
      content: {
        name: globalLabels.cards_and_buttons,
        labels: {
          package_appointments: null,
          package_appointments_date: null,
          package_appointments_select: null,
          package_appointments_selected: null,
          package_appointments_add_more: null,
          package_appointments_slots_selected: null
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          continue: null
        }
      }
    },
    packageAppointmentsListStep: {
      header: {
        name: globalLabels.step_title,
        labels: {
          package_booking_overview: null
        }
      },
      content: {
        name: globalLabels.page_content,
        labels: {
          package_overview_all_selected: null,
          package_overview_selected_later: null,
          package_overview_info: null,
          package_overview_date: null,
          package_overview_time: null,
          package_overview_employee: null,
          package_overview_location: null
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          continue: null
        }
      }
    },
    extrasStep: {
      header: {
        name: globalLabels.step_title,
        labels: {
          extras: null
        }
      },
      heading: {
        name: globalLabels.heading_content,
        labels: {
          extras_available: null,
          min_req_extras_colon: null
        }
      },
      card: {
        name: globalLabels.card_field,
        labels: {
          extras_card_open: null,
          extras_card_close: null,
          duration_colon: null
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          continue: null
        }
      }
    },
    dateTimeStep: {
      header: {
        name: globalLabels.step_title,
        labels: {
          date_time: null
        }
      },
      content: {
        name: globalLabels.step_content,
        labels: {
          date_time_slots_selected: null
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          continue: null
        }
      }
    },
    recurringStep: {
      header: {
        name: globalLabels.step_title,
        labels: {
          recurring_step: null
        }
      },
      heading: {
        name: globalLabels.heading_content,
        labels: {
          recurrence: null,
          recurrence_choosing_time: null
        }
      },
      content: {
        name: globalLabels.page_content,
        labels: {
          repeat_every: null,
          recurrence_day: null,
          recurrence_week: null,
          recurrence_month: null,
          recurrence_days: null,
          recurrence_weeks: null,
          recurrence_months: null,
          recurrence_repeat_on: null,
          recurrence_specific_date: null,
          recurrence_first: null,
          recurrence_second: null,
          recurrence_third: null,
          recurrence_fourth: null,
          recurrence_last: null,
          recurrence_ends: null,
          recurrence_choose_ends: null,
          recurrence_on: null,
          recurrence_select_date: null,
          recurrence_after: null,
          occurrences: null,
          appointment_repeats: null,
          recurrence_every: null,
          repeats_from: null,
          repeats_on: null,
          repeats_at: null,
          number_of_recurrences: null,
          ends_on: null,
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          continue: null
        }
      }
    },
    recurringSummary: {
      header: {
        name: globalLabels.step_title,
        labels: {
          recurring_summary: null
        }
      },
      alert: {
        name: globalLabels.alert_content,
        labels: {
          recurring_unavailable_slots: null,
          recurring_alert_content: null
        }
      },
      content: {
        name: globalLabels.card_content,
        labels: {
          recurring_chose_date: null,
          recurring_delete: null,
          recurring_slots_selected: null
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          continue: null
        }
      }
    },
    recurringPopup: {
      header: {
        name: globalLabels.popup_title,
        labels: {
          repeat_appointment: null,
        }
      },
      content: {
        name: globalLabels.popup_content,
        labels: {
          repeat_appointment_quest: null
        }
      },
      footer: {
        name: globalLabels.popup_buttons,
        labels: {
          yes: null,
          no: null
        }
      }
    },
    infoStep: {
      header: {
        name: globalLabels.step_title,
        labels: {
          info_step: null
        }
      },
      input: {
        name: globalLabels.input_fields,
        labels: {
          first_name_colon: null,
          enter_first_name: null,
          enter_first_name_warning: null,
          last_name_colon: null,
          enter_last_name: null,
          enter_last_name_warning: null,
          email_colon: null,
          enter_email: null,
          enter_valid_email_warning: null,
          phone_colon: null,
          enter_phone: null,
          enter_phone_warning: null,
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          continue: null
        }
      }
    },
    paymentStep: {
      header: {
        name: globalLabels.step_title,
        labels: {
          payment_step: null
        }
      },
      summarySegment: {
        name: globalLabels.summary_segment,
        labels: {
          summary: null,
          coupon: null,
          add_coupon_btn: null,
          summary_services: null,
          summary_services_subtotal: null,
          summary_person: null,
          summary_persons: null,
          summary_recurrence: null,
          summary_recurrences: null,
          summary_extras: null,
          summary_extras_subtotal: null,
          summary_package: null,
          subtotal: null,
          discount_amount_colon: null,
          total_amount_colon: null,
          paying_now: null,
          paying_later: null,
          full_amount_consent: null
        }
      },
      paymentSegment: {
        name: globalLabels.payment_segment,
        labels: {
          payment_method: null,
          on_site: null,
          card_number_colon: null,
          expires_date_colon: null,
          payment_protected_policy: null,
          payment_onsite_sentence: null,
          payment_wc_mollie_sentence: null
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          continue: null
        }
      }
    },
    congratulations: {
      heading: {
        name: globalLabels.heading_title,
        labels: {
          congratulations: null,
          appointment_id: null
        }
      },
      content: {
        name: globalLabels.content,
        labels: {
          add_to_calendar: null,
          congrats_date: null,
          congrats_time: null,
          congrats_service: null,
          congrats_package: null,
          congrats_employee: null,
          congrats_location: null,
          congrats_total_amount: null,
          congrats_payment: null,
          your_name_colon: null,
          email_address_colon: null,
          phone_number_colon: null,
        }
      },
      footer: {
        name: globalLabels.footer_buttons,
        labels: {
          finish_appointment: null,
          congrats_panel: null
        }
      }
    },
    sidebar: {
      footer: {
        name: globalLabels.sidebar_footer,
        labels: {
          get_in_touch: null,
          collapse_menu: null
        }
      }
    }
  }
}

export { defaultCustomizeSettings, defaultTranslations }