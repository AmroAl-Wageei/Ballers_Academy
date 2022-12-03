<?php
/**
 * @copyright © TMS-Plugins. All rights reserved.
 * @licence   See LICENCE.md for license details.
 */

namespace AmeliaBooking\Application\Services\Notification;

use AmeliaBooking\Domain\Entity\User\Customer;
use AmeliaBooking\Domain\Entity\User\Provider;
use Exception;
use AmeliaBooking\Domain\Entity\Notification\Notification;
use Interop\Container\Exception\ContainerException;
use Slim\Exception\ContainerValueNotFoundException;

/**
 * Interface BasicWhatsAppNotificationService
 *
 * @package AmeliaBooking\Application\Services\Notification
 */
class BasicWhatsAppNotificationService extends AbstractNotificationService
{
    /**
     *
     * @param int $id
     *
     * @return Notification|null
     *
     */
    public function getById($id)
    {
        return null;
    }


    /**
     * @param array $appointmentArray
     * @param bool $forcedStatusChange
     * @param bool $logNotification
     * @param bool $isBackend
     *
     * @return null
     */
    public function sendAppointmentStatusNotifications($appointmentArray, $forcedStatusChange, $logNotification, $isBackend = false)
    {
        return null;
    }

    /**
     * @param array $appointmentArray
     * @param array $bookingsArray
     * @param bool $forcedStatusChange
     *
     */
    public function sendAppointmentEditedNotifications($appointmentArray, $bookingsArray, $forcedStatusChange)
    {
        return null;
    }

    /**
     * @param $appointmentArray
     *
     * @return null
     */
    public function sendAppointmentRescheduleNotifications($appointmentArray)
    {
        return null;
    }

    /**
     * @param array $appointmentArray
     * @param array $bookingArray
     * @param bool $logNotification
     *
     * @return null
     */
    public function sendBookingAddedNotifications($appointmentArray, $bookingArray, $logNotification)
    {
        return null;
    }

    /**
     * Notify the customer when he changes his booking status.
     *
     * @param $appointmentArray
     * @param $bookingArray
     *
     * @return null
     */
    public function sendCustomerBookingNotification($appointmentArray, $bookingArray)
    {
        return null;
    }

    /**
     * Notify the provider when the customer cancels event booking.
     *
     * @param $eventArray
     * @param $bookingArray
     *
     * @return null
     */
    public function sendProviderEventCancelledNotification($eventArray, $bookingArray)
    {
        return null;
    }

    /**
     * Returns an array of next day reminder notifications that have to be sent to customers with cron
     *
     * @param string $entityType
     *
     * @return void
     */
    public function sendNextDayReminderNotifications($entityType)
    {
    }

    /**
     * @param string $entityType
     *
     * @return null
     */
    public function sendScheduledNotifications($entityType)
    {
        return null;
    }

    /**
     * @param array $data
     * @param bool $logNotification
     * @param bool $notifyCustomers
     *
     * @return null
     */
    public function sendPackageNotifications($data, $logNotification, $notifyCustomers = true)
    {
        return null;
    }


    /**
     * @param array $appointmentArray
     * @param Notification $notification
     * @param bool $logNotification
     * @param null $bookingKey
     *
     * @return mixed
     */
    public function sendNotification($appointmentArray, $notification, $logNotification, $bookingKey = null, $allBookings = null)
    {
        return null;
    }

    /**
     * @throws ContainerException
     * @throws Exception
     */
    public function sendBirthdayGreetingNotifications()
    {
        return null;
    }

    public function checkRequiredFields()
    {
        return false;
    }

    public function getTemplates()
    {
        return [];
    }

    /**
     * @param $sendTo
     * @param Notification $notification
     * @param $dummyData
     * @return void
     */
    public function sendTestNotification($sendTo, $notification, $dummyData)
    {
    }

    /**
     * @param Customer $customer
     * @param string   $locale
     *
     * @return void
     *
     * @throws ContainerValueNotFoundException
     * @throws \Slim\Exception\ContainerException
     * @throws Exception
     */
    public function sendRecoveryWhatsApp($customer, $locale, $cabinetType)
    {
    }

    /**
     * @param Provider $provider
     *
     * @param $plainPassword
     * @return void
     *
     */
    public function sendEmployeePanelAccess($provider, $plainPassword)
    {
    }
}
